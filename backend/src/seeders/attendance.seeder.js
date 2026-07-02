import Attendance from '../models/attendance.model.js';
import User from '../models/user.model.js';
import { ATTENDANCE_STATUS } from '../constants/attendance.js';
import { dateKeyToUtcStart } from '../utils/attendanceTime.js';
import logger from '../utils/logger.js';

const statusesForDay = (day, isOff) => {
  if (isOff) return ATTENDANCE_STATUS.WEEKEND;
  const roll = day % 10;
  if (roll === 0) return ATTENDANCE_STATUS.ABSENT;
  if (roll === 1) return ATTENDANCE_STATUS.LEAVE_PAID;
  if (roll === 2) return ATTENDANCE_STATUS.LEAVE_UNPAID;
  if (roll === 3) return ATTENDANCE_STATUS.LATE;
  if (roll === 4) return ATTENDANCE_STATUS.HALF_DAY;
  return ATTENDANCE_STATUS.PRESENT;
};

export const seedAttendance = async () => {
  const users = await User.find({ isActive: true }).select('_id email').lean();
  if (!users.length) return;

  const exists = await Attendance.exists({});
  if (exists) {
    logger.info('Attendance already seeded');
    return;
  }

  const now = new Date();
  for (let monthOffset = 0; monthOffset >= -2; monthOffset -= 1) {
    const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, 1));
    const year = base.getUTCFullYear();
    const month = base.getUTCMonth() + 1;
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    for (const user of users) {
      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const date = dateKeyToUtcStart(dateKey);
        const dayOfWeek = new Date(date).getUTCDay();
        const isOff = dayOfWeek === 0 || dayOfWeek === 6;
        const status = statusesForDay(d, isOff);

        let checkIn;
        let checkOut;
        let workingMinutes = 0;

        if ([ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.LATE, ATTENDANCE_STATUS.HALF_DAY].includes(status)) {
          const startHour = status === ATTENDANCE_STATUS.LATE ? 10 : 9;
          const endHour = status === ATTENDANCE_STATUS.HALF_DAY ? 13 : 18;
          checkIn = new Date(Date.UTC(year, month - 1, d, startHour, 5, 0));
          checkOut = new Date(Date.UTC(year, month - 1, d, endHour, 0, 0));
          workingMinutes = Math.round((checkOut - checkIn) / 60000);
        }

        await Attendance.create({
          userId: user._id,
          date,
          dateKey,
          status,
          checkIn,
          checkOut,
          workingMinutes,
          isManual: true,
          leaveReason: status.includes('leave') ? 'Seeded leave' : undefined,
        });
      }
    }
  }

  logger.info('Seeded attendance records');
};

export const destroyAttendance = async () => {
  await Attendance.deleteMany({});
  logger.info('Removed all attendance records');
};
