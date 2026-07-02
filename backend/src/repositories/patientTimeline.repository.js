import PatientTimeline from '../models/patientTimeline.model.js';
import BaseRepository from './base.repository.js';

const USER_POPULATE = { path: 'performedBy', select: 'firstName lastName email' };

class PatientTimelineRepository extends BaseRepository {
  constructor() {
    super(PatientTimeline);
  }

  listByPatient(patientId, { limit = 50, skip = 0 } = {}) {
    return this.model
      .find({ patientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(USER_POPULATE)
      .lean({ virtuals: true });
  }

  countByPatient(patientId) {
    return this.model.countDocuments({ patientId });
  }
}

export default new PatientTimelineRepository();
