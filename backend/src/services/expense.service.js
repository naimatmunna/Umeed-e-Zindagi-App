import expenseRepository from '../repositories/expense.repository.js';
import categoryRepository from '../repositories/category.repository.js';
import ApiError from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { parseQueryOptions } from '../utils/pagination.js';
import { roleHasPermission } from '../security/rbac.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { parseMonthParam, currentMonthParam, shiftMonth } from '../utils/dateRange.js';
import mongoose from 'mongoose';

const SEARCHABLE = ['title', 'description'];

const canReadAll = (roles) => roleHasPermission(roles, PERMISSIONS.EXPENSE_READ_ALL);

const scopeFilter = (reqUser, roles, extra = {}) => {
  const filter = { ...extra };
  if (!canReadAll(roles)) {
    filter.userId = new mongoose.Types.ObjectId(reqUser.id);
  } else if (extra.userId) {
    filter.userId = new mongoose.Types.ObjectId(extra.userId);
    delete filter.userIdFromQuery;
  }
  return filter;
};

const assertOwnership = (expense, reqUser, roles) => {
  if (canReadAll(roles)) return;
  const ownerId =
    expense.userId?._id?.toString() ??
    expense.userId?.id?.toString() ??
    expense.userId?.toString();
  if (ownerId !== reqUser.id) {
    throw ApiError.forbidden(MESSAGES.AUTH.FORBIDDEN, { code: 'FORBIDDEN' });
  }
};

const monthDateFilter = (month) => {
  const range = parseMonthParam(month) ?? parseMonthParam(currentMonthParam());
  return { date: { $gte: range.start, $lte: range.end } };
};

class ExpenseService {
  async list(query, reqUser, roles) {
    const options = parseQueryOptions(query, { searchableFields: SEARCHABLE });
    const month = query.month ?? currentMonthParam();
    const range = parseMonthParam(month);
    if (!range) throw ApiError.badRequest('Invalid month format. Use YYYY-MM', { code: 'BAD_MONTH' });

    delete options.filter.month;
    delete options.filter.categoryId;
    delete options.filter.paymentMethod;
    delete options.filter.userId;

    const scope = scopeFilter(reqUser, roles, {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
      ...(query.userId && canReadAll(roles) ? { userId: query.userId } : {}),
      ...monthDateFilter(month),
    });

    options.filter = { ...options.filter, ...scope };
    return expenseRepository.paginate(options);
  }

  async getById(id, reqUser, roles) {
    const expense = await expenseRepository.findById(id);
    if (!expense) throw ApiError.notFound(MESSAGES.EXPENSE.NOT_FOUND, { code: 'EXPENSE_NOT_FOUND' });
    assertOwnership(expense, reqUser, roles);
    return expense;
  }

  async create(payload, reqUser, roles) {
    const category = await categoryRepository.findById(payload.categoryId);
    if (!category || !category.isActive) {
      throw ApiError.badRequest('Invalid or inactive category', { code: 'BAD_CATEGORY' });
    }

    const userId =
      payload.userId && canReadAll(roles) ? payload.userId : reqUser.id;

    const expense = await expenseRepository.create({
      title: payload.title,
      amount: payload.amount,
      description: payload.description,
      date: payload.date,
      categoryId: payload.categoryId,
      paymentMethod: payload.paymentMethod,
      userId,
    });
    return expenseRepository.findById(expense.id);
  }

  async update(id, payload, reqUser, roles) {
    const existing = await expenseRepository.findById(id);
    if (!existing) throw ApiError.notFound(MESSAGES.EXPENSE.NOT_FOUND, { code: 'EXPENSE_NOT_FOUND' });
    assertOwnership(existing, reqUser, roles);

    if (payload.categoryId) {
      const category = await categoryRepository.findById(payload.categoryId);
      if (!category || !category.isActive) {
        throw ApiError.badRequest('Invalid or inactive category', { code: 'BAD_CATEGORY' });
      }
    }

    const expense = await expenseRepository.updateById(id, payload, {
      new: true,
      runValidators: true,
      populate: [
        { path: 'categoryId', select: 'name slug color icon isActive' },
        { path: 'userId', select: 'firstName lastName email' },
      ],
    });
    return expense;
  }

  async remove(id, reqUser, roles) {
    const existing = await expenseRepository.findById(id);
    if (!existing) throw ApiError.notFound(MESSAGES.EXPENSE.NOT_FOUND, { code: 'EXPENSE_NOT_FOUND' });
    assertOwnership(existing, reqUser, roles);
    return expenseRepository.deleteById(id);
  }

  async summary(query, reqUser, roles) {
    const month = query.month ?? currentMonthParam();
    const range = parseMonthParam(month);
    if (!range) throw ApiError.badRequest('Invalid month format. Use YYYY-MM', { code: 'BAD_MONTH' });

    const prevMonth = shiftMonth(month, -1);
    const prevRange = parseMonthParam(prevMonth);

    const baseMatch = scopeFilter(reqUser, roles, {
      ...(query.userId && canReadAll(roles) ? { userId: query.userId } : {}),
    });

    const currentMatch = { ...baseMatch, ...monthDateFilter(month) };
    const previousMatch = { ...baseMatch, date: { $gte: prevRange.start, $lte: prevRange.end } };

    const trendStart = parseMonthParam(shiftMonth(month, -5));
    const trendMatch = {
      ...baseMatch,
      date: { $gte: trendStart.start, $lte: range.end },
    };

    const [currentTotals, previousTotals, byCategory, byDay, trend] = await Promise.all([
      expenseRepository.sumAmount(currentMatch),
      expenseRepository.sumAmount(previousMatch),
      expenseRepository.aggregateSummary({ match: currentMatch, groupBy: 'category' }),
      expenseRepository.aggregateSummary({ match: currentMatch, groupBy: 'day' }),
      expenseRepository.aggregateSummary({ match: trendMatch, groupBy: 'month' }),
    ]);

    const totalAmount = currentTotals[0]?.total ?? 0;
    const expenseCount = currentTotals[0]?.count ?? 0;
    const previousTotal = previousTotals[0]?.total ?? 0;
    const changeAmount = totalAmount - previousTotal;
    const changePercent =
      previousTotal > 0 ? Number(((changeAmount / previousTotal) * 100).toFixed(1)) : totalAmount > 0 ? 100 : 0;

    const daysInMonth = new Date(range.year, range.month, 0).getDate();
    const avgPerDay = expenseCount > 0 ? Number((totalAmount / daysInMonth).toFixed(2)) : 0;

    const categoryIds = byCategory.map((c) => c._id);
    const categories = await categoryRepository.model
      .find({ _id: { $in: categoryIds } })
      .select('name slug color icon')
      .lean();

    const categoryMap = Object.fromEntries(categories.map((c) => [c._id.toString(), c]));

    const byCategoryEnriched = byCategory.map((row) => {
      const cat = categoryMap[row._id?.toString()] ?? {};
      const amount = row.total;
      return {
        categoryId: row._id?.toString(),
        name: cat.name ?? 'Uncategorized',
        slug: cat.slug ?? 'other',
        color: cat.color ?? '#8E8E93',
        icon: cat.icon ?? 'tag',
        amount,
        count: row.count,
        percentage: totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(1)) : 0,
      };
    });

    return {
      month,
      monthLabel: new Date(range.start).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
      totalAmount,
      expenseCount,
      avgPerDay,
      previousMonth: {
        month: prevMonth,
        totalAmount: previousTotal,
        changeAmount,
        changePercent,
      },
      byCategory: byCategoryEnriched,
      byDay: byDay.map((d) => ({
        date: d._id,
        amount: d.total,
        count: d.count,
      })),
      trend: trend.map((t) => ({
        month: t._id,
        amount: t.total,
        count: t.count,
      })),
    };
  }
}

export default new ExpenseService();
