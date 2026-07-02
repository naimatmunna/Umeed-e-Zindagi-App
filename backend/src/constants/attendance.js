export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  LEAVE_PAID: 'leave_paid',
  LEAVE_UNPAID: 'leave_unpaid',
  WEEKEND: 'weekend',
  HOLIDAY: 'holiday',
});

export const ATTENDANCE_STATUS_VALUES = Object.freeze(Object.values(ATTENDANCE_STATUS));

export const MANUAL_STATUSES = Object.freeze([
  ATTENDANCE_STATUS.ABSENT,
  ATTENDANCE_STATUS.LEAVE_PAID,
  ATTENDANCE_STATUS.LEAVE_UNPAID,
  ATTENDANCE_STATUS.HOLIDAY,
  ATTENDANCE_STATUS.HALF_DAY,
]);
