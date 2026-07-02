import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const expenseFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  description: z.string().max(500).optional(),
  date: z.string().min(1, 'Date is required'),
  categoryId: z.string().min(1, 'Category is required'),
  paymentMethod: z.enum(['cash', 'card', 'bank', 'mobile_wallet', 'other']).optional(),
});

export const categoryFormSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers, underscores'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(32).optional(),
  isActive: z.boolean().optional(),
});

export { userFormSchema, roleFormSchema, registerSchema } from './auth.schema.js';
