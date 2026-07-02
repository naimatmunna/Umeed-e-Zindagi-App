import { describe, it, expect } from 'vitest';
import { expenseFormSchema, categoryFormSchema } from '@/schemas/expense.schema.js';
import { currentMonth, shiftMonth, formatCurrency } from '@/helpers/format.js';

describe('expenseFormSchema', () => {
  it('accepts valid expense data', () => {
    const result = expenseFormSchema.safeParse({
      title: 'Groceries',
      amount: 2500,
      date: '2024-07-15',
      categoryId: '507f1f77bcf86cd799439011',
      paymentMethod: 'cash',
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero amount', () => {
    const result = expenseFormSchema.safeParse({
      title: 'Free',
      amount: 0,
      date: '2024-07-15',
      categoryId: '507f1f77bcf86cd799439011',
    });
    expect(result.success).toBe(false);
  });
});

describe('categoryFormSchema', () => {
  it('accepts valid category', () => {
    const result = categoryFormSchema.safeParse({
      name: 'Travel',
      slug: 'travel',
      color: '#007AFF',
    });
    expect(result.success).toBe(true);
  });
});

describe('format helpers', () => {
  it('formats PKR currency', () => {
    expect(formatCurrency(5000)).toMatch(/5/);
  });

  it('shifts month correctly', () => {
    expect(shiftMonth('2024-03', 1)).toBe('2024-04');
    expect(shiftMonth('2024-01', -1)).toBe('2023-12');
  });

  it('returns current month as YYYY-MM', () => {
    expect(currentMonth()).toMatch(/^\d{4}-\d{2}$/);
  });
});
