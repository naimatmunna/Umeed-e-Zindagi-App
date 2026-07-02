import { z } from 'zod';
import { PAYMENT_METHODS } from '../models/expense.model.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const monthParam = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be YYYY-MM');

export const listExpensesSchema = {
  query: z
    .object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
      sort: z.string().optional(),
      search: z.string().optional(),
      month: monthParam.optional(),
      categoryId: objectId.optional(),
      paymentMethod: z.enum(PAYMENT_METHODS).optional(),
      userId: objectId.optional(),
    })
    .passthrough(),
};

export const expenseSummarySchema = {
  query: z.object({
    month: monthParam.optional(),
    userId: objectId.optional(),
  }),
};

export const expenseIdSchema = {
  params: z.object({ id: objectId }),
};

export const expenseExportSchema = {
  query: z.object({
    month: monthParam.optional(),
    categoryId: objectId.optional(),
    userId: objectId.optional(),
  }),
};

export const createExpenseSchema = {
  body: z.object({
    title: z.string().min(1).max(120),
    amount: z.coerce.number().positive('Amount must be greater than zero'),
    description: z.string().max(500).optional(),
    date: z.coerce.date(),
    categoryId: objectId,
    paymentMethod: z.enum(PAYMENT_METHODS).optional(),
    userId: objectId.optional(),
  }),
};

export const updateExpenseSchema = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      title: z.string().min(1).max(120).optional(),
      amount: z.coerce.number().positive().optional(),
      description: z.string().max(500).optional(),
      date: z.coerce.date().optional(),
      categoryId: objectId.optional(),
      paymentMethod: z.enum(PAYMENT_METHODS).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' }),
};
