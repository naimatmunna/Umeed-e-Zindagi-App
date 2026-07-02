import attendanceRepository from '../repositories/attendance.repository.js';
import officeSettingsRepository from '../repositories/officeSettings.repository.js';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { parseQueryOptions } from '../utils/pagination.js';
import { roleHasPermission } from '../security/rbac.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { ATTENDANCE_STATUS } from '../constants/attendance.js';
import {
  getZonedParts,
  weekdayToIndex,
  dateKeyToUtcStart,
  getMonthRangeFromKey,
  computeWorkingMinutes,
  deriveStatus,
  formatMinutesToHours,
} from '../utils/attendanceTime.js';
import { currentMonthParam } from '../utils/dateRange.js';
import mongoose from 'mongoose';

const canReadAll = (roles) => roleHasPermission(roles, PERMISSIONS.ATTENDANCE_READ_ALL);

const scopeUserId = (reqUser, roles, queryUserId) => {
  if (canReadAll(roles) && queryUserId) return queryUserId;
  if (canReadAll(roles)) return null;
  return reqUser.id;
};

const assertCanAccess = (record, reqUser, roles) => {
  if (canReadAll(roles)) return;
  const ownerId = record.userId?._id?.toString() ?? record.userId?.toString();
  if (ownerId !== reqUser.id) {
    throw ApiError.forbidden(MESSAGES.AUTH.FORBIDDEN, { code: 'FORBIDDEN' });
  }
};

const isOffDay = (dateKey, office) => {
  const parts = getZonedParts(dateKeyToUtcStart(dateKey), office.timezone);
  const dayIndex = weekdayToIndex(parts.weekday);
  return (office.offDays ?? []).includes(dayIndex);
};

class AttendanceService {
  async getOffice() {
    return officeSettingsRepository.get();
  }

  async getToday(reqUser) {
    const office = await this.getOffice();
    const now = new Date();
    const { dateKey } = getZonedParts(now, office.timezone);
    let record = await attendanceRepository.findByUserAndDateKey(reqUser.id, dateKey);

    if (!record && isOffDay(dateKey, office)) {
      return {
        dateKey,
        status: ATTENDANCE_STATUS.WEEKEND,
        isOffDay: true,
        office: this.formatOfficeForClient(office),
      };
    }

    return {
      ...(record?.toJSON?.() ?? record ?? {}),
      dateKey,
      isOffDay: isOffDay(dateKey, office),
      office: this.formatOfficeForClient(office),
      canCheckIn: !record?.checkIn && !isOffDay(dateKey, office),
      canCheckOut: Boolean(record?.checkIn && !record?.checkOut),
    };
  }

  formatOfficeForClient(office) {
    const o = office.toJSON?.() ?? office;
    return {
      timezone: o.timezone,
      workStartTime: o.workStartTime,
      workEndTime: o.workEndTime,
      offDays: o.offDays,
      gracePeriodMinutes: o.gracePeriodMinutes,
    };
  }

  async checkIn(reqUser, { notes } = {}) {
    const office = await this.getOffice();
    const now = new Date();
    const { dateKey } = getZonedParts(now, office.timezone);

    if (isOffDay(dateKey, office)) {
      throw ApiError.badRequest('Today is an off day', { code: 'OFF_DAY' });
    }

    let record = await attendanceRepository.findByUserAndDateKey(reqUser.id, dateKey);
    if (record?.checkIn) {
      throw ApiError.conflict('Already checked in today', { code: 'ALREADY_CHECKED_IN' });
    }

    const workingMinutes = record?.workingMinutes ?? 0;
    const status = deriveStatus({
      checkIn: now,
      checkOut: record?.checkOut,
      isOffDay: false,
      office,
      workingMinutes,
    });

    const payload = {
      userId: reqUser.id,
      date: dateKeyToUtcStart(dateKey),
      dateKey,
      checkIn: now,
      checkOut: record?.checkOut,
      workingMinutes,
      status: status ?? ATTENDANCE_STATUS.PRESENT,
      notes: notes ?? record?.notes,
    };

    if (record) {
      record = await attendanceRepository.updateById(record.id, payload, {
        new: true,
        populate: { path: 'userId', select: 'firstName lastName email' },
      });
    } else {
      record = await attendanceRepository.create(payload);
      record = await attendanceRepository.findById(record.id);
    }

    return record;
  }

  async checkOut(reqUser, { notes } = {}) {
    const office = await this.getOffice();
    const now = new Date();
    const { dateKey } = getZonedParts(now, office.timezone);

    const record = await attendanceRepository.findByUserAndDateKey(reqUser.id, dateKey);
    if (!record?.checkIn) {
      throw ApiError.badRequest('Check in first before checking out', { code: 'NOT_CHECKED_IN' });
    }
    if (record.checkOut) {
      throw ApiError.conflict('Already checked out today', { code: 'ALREADY_CHECKED_OUT' });
    }

    const workingMinutes = computeWorkingMinutes(record.checkIn, now);
    const status = deriveStatus({
      checkIn: record.checkIn,
      checkOut: now,
      isOffDay: false,
      office,
      workingMinutes,
    });

    return attendanceRepository.updateById(
      record.id,
      {
        checkOut: now,
        workingMinutes,
        status: status ?? ATTENDANCE_STATUS.PRESENT,
        notes: notes ?? record.notes,
      },
      { new: true, populate: { path: 'userId', select: 'firstName lastName email' } },
    );
  }

  async list(query, reqUser, roles) {
    const month = query.month ?? currentMonthParam();
    const range = getMonthRangeFromKey(month);
    if (!range) throw ApiError.badRequest('Invalid month', { code: 'BAD_MONTH' });

    const userId = scopeUserId(reqUser, roles, query.userId);
    const options = parseQueryOptions(query, { searchableFields: [] });
    delete options.filter.month;
    delete options.filter.userId;
    delete options.filter.status;

    options.filter = {
      ...options.filter,
      date: { $gte: range.start, $lte: range.end },
      ...(userId ? { userId: new mongoose.Types.ObjectId(userId) } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    return attendanceRepository.paginate(options);
  }

  async getById(id, reqUser, roles) {
    const record = await attendanceRepository.findById(id);
    if (!record) throw ApiError.notFound(MESSAGES.ATTENDANCE.NOT_FOUND, { code: 'ATTENDANCE_NOT_FOUND' });
    assertCanAccess(record, reqUser, roles);
    return record;
  }

  async createManual(payload, reqUser) {
    const user = await userRepository.findById(payload.userId);
    if (!user) throw ApiError.notFound(MESSAGES.USER.NOT_FOUND, { code: 'USER_NOT_FOUND' });

    const office = await this.getOffice();
    const offDay = isOffDay(payload.dateKey, office);
    let workingMinutes = 0;
    if (payload.checkIn && payload.checkOut) {
      workingMinutes = computeWorkingMinutes(payload.checkIn, payload.checkOut);
    }

    const status =
      payload.status ??
      deriveStatus({
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        manualStatus: payload.status,
        isOffDay: offDay,
        office,
        workingMinutes,
      }) ??
      ATTENDANCE_STATUS.ABSENT;

    const existing = await attendanceRepository.findByUserAndDateKey(payload.userId, payload.dateKey);
    if (existing) {
      throw ApiError.conflict('Attendance already exists for this date', { code: 'ATTENDANCE_EXISTS' });
    }

    const record = await attendanceRepository.create({
      userId: payload.userId,
      date: dateKeyToUtcStart(payload.dateKey),
      dateKey: payload.dateKey,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      status,
      workingMinutes,
      notes: payload.notes,
      leaveReason: payload.leaveReason,
      isManual: true,
      recordedBy: reqUser.id,
    });
    return attendanceRepository.findById(record.id);
  }

  async update(id, payload, reqUser, roles) {
    const record = await attendanceRepository.findById(id);
    if (!record) throw ApiError.notFound(MESSAGES.ATTENDANCE.NOT_FOUND, { code: 'ATTENDANCE_NOT_FOUND' });

    if (!canReadAll(roles)) {
      throw ApiError.forbidden(MESSAGES.AUTH.FORBIDDEN, { code: 'FORBIDDEN' });
    }

    const checkIn = payload.checkIn !== undefined ? payload.checkIn : record.checkIn;
    const checkOut = payload.checkOut !== undefined ? payload.checkOut : record.checkOut;
    const workingMinutes =
      checkIn && checkOut ? computeWorkingMinutes(checkIn, checkOut) : record.workingMinutes;

    const office = await this.getOffice();
    const status =
      payload.status ??
      deriveStatus({
        checkIn,
        checkOut,
        manualStatus: payload.status,
        isOffDay: isOffDay(record.dateKey, office),
        office,
        workingMinutes,
      }) ??
      record.status;

    return attendanceRepository.updateById(
      id,
      { ...payload, workingMinutes, status, isManual: true, recordedBy: reqUser.id },
      { new: true, populate: { path: 'userId', select: 'firstName lastName email' } },
    );
  }

  async remove(id, reqUser, roles) {
    if (!canReadAll(roles)) throw ApiError.forbidden(MESSAGES.AUTH.FORBIDDEN);
    const record = await attendanceRepository.deleteById(id);
    if (!record) throw ApiError.notFound(MESSAGES.ATTENDANCE.NOT_FOUND, { code: 'ATTENDANCE_NOT_FOUND' });
    return record;
  }

  async summary(query, reqUser, roles) {
    const month = query.month ?? currentMonthParam();
    const range = getMonthRangeFromKey(month);
    if (!range) throw ApiError.badRequest('Invalid month', { code: 'BAD_MONTH' });

    const userId = scopeUserId(reqUser, roles, query.userId);
    const filter = {
      date: { $gte: range.start, $lte: range.end },
      ...(userId ? { userId: new mongoose.Types.ObjectId(userId) } : {}),
    };

    const records = await attendanceRepository.findInRange({ filter, start: range.start, end: range.end });
    const office = await this.getOffice();

    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      half_day: 0,
      leave_paid: 0,
      leave_unpaid: 0,
      weekend: 0,
      holiday: 0,
      totalHours: 0,
      totalRecords: records.length,
    };

    records.forEach((r) => {
      if (stats[r.status] !== undefined) stats[r.status] += 1;
      stats.totalHours += r.workingMinutes ?? 0;
    });

    const workingDays = this.countWorkingDays(range, office);
    const expectedRecords = userId ? workingDays : workingDays * (await this.activeEmployeeCount());
    const attendanceRate =
      expectedRecords > 0
        ? Number((((stats.present + stats.late + stats.half_day) / expectedRecords) * 100).toFixed(1))
        : 0;

    return {
      month: range.monthKey,
      monthLabel: new Date(range.start).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
      stats: {
        ...stats,
        totalHours: formatMinutesToHours(stats.totalHours),
        avgHoursPerDay:
          stats.totalRecords > 0
            ? formatMinutesToHours(Math.round(stats.totalHours / stats.totalRecords))
            : 0,
        attendanceRate,
        workingDays,
      },
      byStatus: Object.entries(stats)
        .filter(([k]) => !['totalHours', 'totalRecords'].includes(k))
        .map(([status, count]) => ({ status, count })),
    };
  }

  countWorkingDays(range, office) {
    let count = 0;
    for (let d = 1; d <= range.daysInMonth; d++) {
      const key = `${range.year}-${String(range.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (!isOffDay(key, office)) count += 1;
    }
    return count;
  }

  async activeEmployeeCount() {
    return userRepository.count({ isActive: true });
  }

  async matrix(query, reqUser, roles) {
    if (!canReadAll(roles)) {
      throw ApiError.forbidden(MESSAGES.AUTH.FORBIDDEN, { code: 'FORBIDDEN' });
    }

    const month = query.month ?? currentMonthParam();
    const range = getMonthRangeFromKey(month);
    if (!range) throw ApiError.badRequest('Invalid month', { code: 'BAD_MONTH' });

    const office = await this.getOffice();
    const users = await userRepository.model
      .find({ isActive: true })
      .select('firstName lastName email')
      .sort({ firstName: 1 })
      .lean();

    const records = await attendanceRepository.findInRange({
      filter: { date: { $gte: range.start, $lte: range.end } },
      start: range.start,
      end: range.end,
    });

    const recordMap = {};
    records.forEach((r) => {
      const uid = r.userId?._id?.toString() ?? r.userId?.toString();
      recordMap[`${uid}:${r.dateKey}`] = r;
    });

    const days = [];
    for (let d = 1; d <= range.daysInMonth; d++) {
      const dateKey = `${range.year}-${String(range.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateKey, isOffDay: isOffDay(dateKey, office) });
    }

    const employees = users.map((u) => {
      const uid = u._id.toString();
      const dayStatuses = days.map(({ dateKey, isOffDay: off }) => {
        const rec = recordMap[`${uid}:${dateKey}`];
        if (rec) {
          return {
            dateKey,
            status: rec.status,
            checkIn: rec.checkIn,
            checkOut: rec.checkOut,
            workingHours: formatMinutesToHours(rec.workingMinutes),
            id: rec.id ?? rec._id?.toString(),
          };
        }
        return { dateKey, status: off ? ATTENDANCE_STATUS.WEEKEND : null };
      });

      const summary = { present: 0, absent: 0, late: 0, leave: 0, hours: 0 };
      dayStatuses.forEach((d) => {
        if (d.status === 'present') summary.present += 1;
        if (d.status === 'absent') summary.absent += 1;
        if (d.status === 'late') summary.late += 1;
        if (d.status?.includes('leave')) summary.leave += 1;
        if (d.workingHours) summary.hours += d.workingHours;
      });

      return {
        userId: uid,
        fullName: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        days: dayStatuses,
        summary,
      };
    });

    return { month: range.monthKey, days, employees, office: this.formatOfficeForClient(office) };
  }
}

export default new AttendanceService();
