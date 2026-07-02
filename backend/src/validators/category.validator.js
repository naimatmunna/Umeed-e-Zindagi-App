import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const slug = z
  .string()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9_]+$/, 'Slug may only contain lowercase letters, numbers, and underscores');
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color');

export const listCategoriesSchema = {
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

export const categoryIdSchema = {
  params: z.object({ id: objectId }),
};

export const createCategorySchema = {
  body: z.object({
    name: z.string().min(2).max(80),
    slug,
    color: hexColor.optional(),
    icon: z.string().max(32).optional(),
    isActive: z.boolean().optional(),
  }),
};

export const updateCategorySchema = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: z.string().min(2).max(80).optional(),
      slug: slug.optional(),
      color: hexColor.optional(),
      icon: z.string().max(32).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' }),
};
