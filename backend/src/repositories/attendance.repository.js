import BaseRepository from './base.repository.js';
import Attendance from '../models/attendance.model.js';

const USER_POPULATE = { path: 'userId', select: 'firstName lastName email' };

class AttendanceRepository extends BaseRepository {
  constructor() {
    super(Attendance);
  }

  paginate(options) {
    return super.paginate({ ...options, populate: USER_POPULATE });
  }

  findById(id, options = {}) {
    return super.findById(id, { ...options, populate: USER_POPULATE });
  }

  findByUserAndDateKey(userId, dateKey) {
    return this.model.findOne({ userId, dateKey }).populate(USER_POPULATE).exec();
  }

  findInRange({ filter, start, end }) {
    return this.model
      .find({ ...filter, date: { $gte: start, $lte: end } })
      .populate(USER_POPULATE)
      .sort({ date: 1 })
      .exec();
  }
}

export default new AttendanceRepository();
