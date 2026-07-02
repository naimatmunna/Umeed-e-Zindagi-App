import Expense from '../models/expense.model.js';
import User from '../models/user.model.js';
import { getCategoryIdBySlug } from './category.seeder.js';
import logger from '../utils/logger.js';

const sampleExpenses = (userId, monthOffset = 0) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + monthOffset;
  const base = new Date(Date.UTC(year, month, 1));

  const day = (d) => new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), d, 12, 0, 0));

  return [
    { title: 'Grocery run', amount: 4500, categorySlug: 'food', date: day(2), paymentMethod: 'card' },
    { title: 'Fuel', amount: 3200, categorySlug: 'transport', date: day(4), paymentMethod: 'cash' },
    { title: 'Electricity bill', amount: 6800, categorySlug: 'utilities', date: day(6), paymentMethod: 'bank' },
    { title: 'Netflix', amount: 1500, categorySlug: 'entertainment', date: day(8), paymentMethod: 'card' },
    { title: 'Pharmacy', amount: 2200, categorySlug: 'healthcare', date: day(11), paymentMethod: 'cash' },
    { title: 'Lunch out', amount: 1800, categorySlug: 'food', date: day(14), paymentMethod: 'mobile_wallet' },
    { title: 'Uber rides', amount: 2400, categorySlug: 'transport', date: day(17), paymentMethod: 'card' },
    { title: 'Clothing', amount: 5500, categorySlug: 'shopping', date: day(20), paymentMethod: 'card' },
    { title: 'Internet', amount: 4000, categorySlug: 'utilities', date: day(22), paymentMethod: 'bank' },
    { title: 'Books', amount: 2800, categorySlug: 'education', date: day(25), paymentMethod: 'card' },
  ].map((e) => ({ ...e, userId }));
};

export const seedExpenses = async () => {
  const user = await User.findOne({ email: 'user@example.com' }).select('_id');
  if (!user) {
    logger.warn('Skipping expense seed — demo user not found');
    return;
  }

  const exists = await Expense.exists({ userId: user._id });
  if (exists) {
    logger.info('Expenses already seeded');
    return;
  }

  for (const offset of [0, -1, -2, -3, -4, -5]) {
    const expenses = sampleExpenses(user._id, offset);
    for (const { categorySlug, ...data } of expenses) {
      const categoryId = await getCategoryIdBySlug(categorySlug);
      await Expense.create({ ...data, categoryId });
    }
  }

  logger.info('Seeded demo expenses for user@example.com');
};

export const destroyExpenses = async () => {
  await Expense.deleteMany({});
  logger.info('Removed all expenses');
};
