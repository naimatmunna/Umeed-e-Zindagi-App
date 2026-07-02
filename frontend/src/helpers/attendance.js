export const ATTENDANCE_STATUS = {
  present: { label: 'Present', color: '#34C759', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  absent: { label: 'Absent', color: '#FF3B30', bg: 'bg-red-50', text: 'text-red-600' },
  late: { label: 'Late', color: '#FF9500', bg: 'bg-orange-50', text: 'text-orange-600' },
  half_day: { label: 'Half day', color: '#FFCC00', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  leave_paid: { label: 'Paid leave', color: '#5856D6', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  leave_unpaid: { label: 'Unpaid leave', color: '#AF52DE', bg: 'bg-purple-50', text: 'text-purple-600' },
  weekend: { label: 'Off day', color: '#8E8E93', bg: 'bg-gray-100', text: 'text-gray-500' },
  holiday: { label: 'Holiday', color: '#5AC8FA', bg: 'bg-sky-50', text: 'text-sky-600' },
};

export const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half day' },
  { value: 'leave_paid', label: 'Paid leave' },
  { value: 'leave_unpaid', label: 'Unpaid leave' },
  { value: 'holiday', label: 'Holiday' },
];

export const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const TIMEZONES = [
  'Asia/Karachi',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Europe/London',
  'America/New_York',
  'UTC',
];

export const statusMeta = (status) =>
  ATTENDANCE_STATUS[status] ?? { label: status ?? '—', color: '#8E8E93', bg: 'bg-gray-100', text: 'text-gray-500' };
