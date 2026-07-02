import { z } from 'zod';
import { ATTENDANCE_STATUS_VALUES } from '../constants/attendance.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const monthParam = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be YYYY-MM');
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');
const timeRegex = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const listAttendanceSchema = {
  query: z
    .object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
      month: monthParam.optional(),
      userId: objectId.optional(),
      status: z.enum(ATTENDANCE_STATUS_VALUES).optional(),
      search: z.string().optional(),
    })
    .passthrough(),
};

export const attendanceSummarySchema = {
  query: z.object({
    month: monthParam.optional(),
    userId: objectId.optional(),
  }),
};

export const attendanceMatrixSchema = {
  query: z.object({
    month: monthParam.optional(),
  }),
};

export const attendanceIdSchema = {
  params: z.object({ id: objectId }),
};

export const createAttendanceSchema = {
  body: z.object({
    userId: objectId,
    dateKey,
    status: z.enum(ATTENDANCE_STATUS_VALUES),
    checkIn: z.coerce.date().optional(),
    checkOut: z.coerce.date().optional(),
    notes: z.string().max(500).optional(),
    leaveReason: z.string().max(280).optional(),
  }),
};

export const updateAttendanceSchema = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      status: z.enum(ATTENDANCE_STATUS_VALUES).optional(),
      checkIn: z.coerce.date().nullable().optional(),
      checkOut: z.coerce.date().nullable().optional(),
      notes: z.string().max(500).optional(),
      leaveReason: z.string().max(280).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' }),
};

export const checkInOutSchema = {
  body: z.object({
    notes: z.string().max(500).optional(),
  }),
};
