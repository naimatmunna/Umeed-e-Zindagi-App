import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const slug = z
  .string()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9_]+$/, 'Slug may only contain lowercase letters, numbers, and underscores');

export const listRolesSchema = {
  query: z
    .object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
      sort: z.string().optional(),
      search: z.string().optional(),
      activeOnly: z
        .union([z.literal('true'), z.literal('false')])
        .transform((v) => v === 'true')
        .optional(),
    })
    .passthrough(),
};

export const roleIdSchema = {
  params: z.object({ id: objectId }),
};

export const createRoleSchema = {
  body: z.object({
    name: z.string().min(2).max(80),
    slug,
    description: z.string().max(280).optional(),
    isActive: z.boolean().optional(),
  }),
};

export const updateRoleSchema = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: z.string().min(2).max(80).optional(),
      slug: slug.optional(),
      description: z.string().max(280).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' }),
};
