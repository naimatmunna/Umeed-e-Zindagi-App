import PatientAuditLog from '../models/patientAuditLog.model.js';
import BaseRepository from './base.repository.js';

const USER_POPULATE = { path: 'userId', select: 'firstName lastName email' };

class PatientAuditLogRepository extends BaseRepository {
  constructor() {
    super(PatientAuditLog);
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
}

export default new PatientAuditLogRepository();
