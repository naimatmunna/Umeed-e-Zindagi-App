import { z } from 'zod';

export const updateOfficeSettingsSchema = {
  body: z
    .object({
      timezone: z.string().min(2).max(64).optional(),
      workStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      workEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      offDays: z.array(z.coerce.number().int().min(0).max(6)).optional(),
      gracePeriodMinutes: z.coerce.number().int().min(0).max(120).optional(),
      halfDayThresholdHours: z.coerce.number().min(1).max(8).optional(),
      lateThresholdMinutes: z.coerce.number().int().min(0).max(120).optional(),
      autoMarkAbsent: z.boolean().optional(),
    })
    .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' }),
};
