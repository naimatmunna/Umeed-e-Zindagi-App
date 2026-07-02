import { describe, it, expect } from 'vitest';
import { statusMeta, ATTENDANCE_STATUS } from '@/helpers/attendance.js';

describe('attendance helpers', () => {
  it('returns metadata for known statuses', () => {
    expect(statusMeta('present').label).toBe('Present');
    expect(statusMeta('leave_paid').label).toBe('Paid leave');
    expect(statusMeta('absent').color).toBe('#FF3B30');
  });

  it('has all required status keys', () => {
    const required = ['present', 'absent', 'late', 'leave_paid', 'leave_unpaid', 'weekend'];
    required.forEach((key) => {
      expect(ATTENDANCE_STATUS[key]).toBeDefined();
    });
  });
});
