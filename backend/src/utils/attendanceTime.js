/** Attendance date/time helpers using office timezone. */

export const parseTimeToMinutes = (timeStr) => {
  const [h, m] = (timeStr ?? '09:00').split(':').map(Number);
  return h * 60 + (m || 0);
};

export const formatMinutesToHours = (minutes = 0) =>
  Number((minutes / 60).toFixed(2));

export const getZonedParts = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: parts.weekday,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
  };
};

export const weekdayToIndex = (weekday) => {
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekday] ?? 0;
};

export const dateKeyToUtcStart = (dateKey) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
};

export const getMonthRangeFromKey = (monthKey) => {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey ?? '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { year, month, start, end, daysInMonth, monthKey: `${year}-${String(month).padStart(2, '0')}` };
};

export const computeWorkingMinutes = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / 60000));
};

export const deriveStatus = ({
  checkIn,
  checkOut,
  manualStatus,
  isOffDay,
  office,
  workingMinutes,
}) => {
  if (manualStatus) return manualStatus;
  if (isOffDay) return 'weekend';

  if (!checkIn && !checkOut) return null;

  if (checkIn && office) {
    const parts = getZonedParts(new Date(checkIn), office.timezone);
    const checkInMinutes = parts.hour * 60 + parts.minute;
    const startMinutes = parseTimeToMinutes(office.workStartTime);
    const grace = office.gracePeriodMinutes ?? 15;

    if (checkInMinutes > startMinutes + grace) {
      if (!checkOut) return 'late';
    }
  }

  if (checkIn && checkOut && office) {
    const expectedMinutes =
      parseTimeToMinutes(office.workEndTime) - parseTimeToMinutes(office.workStartTime);
    const halfThreshold = office.halfDayThresholdHours ?? 4;
    if (workingMinutes < halfThreshold * 60) return 'half_day';
    if (workingMinutes < expectedMinutes * 0.5) return 'half_day';
  }

  if (checkIn) return checkOut ? 'present' : 'present';
  return 'absent';
};
