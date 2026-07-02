import BaseRepository from './base.repository.js';
import Expense from '../models/expense.model.js';

const CATEGORY_POPULATE = { path: 'categoryId', select: 'name slug color icon isActive' };
const USER_POPULATE = { path: 'userId', select: 'firstName lastName email' };

class ExpenseRepository extends BaseRepository {
  constructor() {
    super(Expense);
  }

  paginate(options) {
    return super.paginate({
      ...options,
      populate: [CATEGORY_POPULATE, USER_POPULATE],
    });
  }

  findById(id, options = {}) {
    return super.findById(id, {
      ...options,
      populate: [CATEGORY_POPULATE, USER_POPULATE],
    });
  }

  aggregateSummary({ match, groupBy = 'category' }) {
    if (groupBy === 'category') {
      return this.model.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$categoryId',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]);
    }

    if (groupBy === 'day') {
      return this.model.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$date' },
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    }

    if (groupBy === 'month') {
      return this.model.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$date' },
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    }

    return [];
  }

  sumAmount(match) {
    return this.model.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
  }
}

export default new ExpenseRepository();
