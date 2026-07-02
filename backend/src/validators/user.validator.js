import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const listUsersSchema = {
  query: z
    .object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
      sort: z.string().optional(),
      search: z.string().optional(),
      fields: z.string().optional(),
    })
    .passthrough(),
};

export const userIdSchema = {
  params: z.object({ id: objectId }),
};

export const createUserSchema = {
  body: z.object({
    firstName: z.string().min(1).max(60),
    lastName: z.string().min(1).max(60),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(128),
    joiningDate: z.coerce.date().optional(),
    salary: z.coerce.number().min(0).optional(),
    roleId: objectId,
    isActive: z.boolean().optional(),
  }),
};

export const updateUserSchema = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      firstName: z.string().min(1).max(60).optional(),
      lastName: z.string().min(1).max(60).optional(),
      joiningDate: z.coerce.date().optional(),
      salary: z.coerce.number().min(0).optional(),
      roleId: objectId.optional(),
      isActive: z.boolean().optional(),
      password: z.string().min(8).max(128).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' }),
};
