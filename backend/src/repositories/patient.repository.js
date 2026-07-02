import Patient from '../models/patient.model.js';
import BaseRepository from './base.repository.js';

const USER_POPULATE = { path: 'createdBy', select: 'firstName lastName email' };

class PatientRepository extends BaseRepository {
  constructor() {
    super(Patient);
  }

  paginate(options) {
    const filter = { deletedAt: null, ...options.filter };
    return super.paginate({ ...options, filter, populate: [USER_POPULATE] });
  }

  async findById(id) {
    const doc = await this.model
      .findOne({ _id: id, deletedAt: null })
      .populate(USER_POPULATE);
    return doc ? doc.toJSON() : null;
  }

  findByPatientId(patientId) {
    return this.model.findOne({ patientId, deletedAt: null }).lean({ virtuals: true });
  }

  findByCnic(cnic, excludeId) {
    const filter = { cnic, deletedAt: null, status: { $ne: 'draft' } };
    if (excludeId) filter._id = { $ne: excludeId };
    return this.model.findOne(filter).select('_id patientId fullName').lean();
  }

  findByPhone(phone, excludeId) {
    const filter = {
      deletedAt: null,
      status: { $ne: 'draft' },
      $or: [{ phone }, { alternatePhone: phone }],
    };
    if (excludeId) filter._id = { $ne: excludeId };
    return this.model.findOne(filter).select('_id patientId fullName phone').lean();
  }

  softDelete(id) {
    return this.model.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  }

  countByYearPrefix(field, year) {
    const regex = new RegExp(`^${field === 'patientId' ? 'PAT' : field === 'registrationNumber' ? 'REG' : 'ADM'}-${year}-`);
    return this.model.countDocuments({ [field]: regex });
  }
}

export default new PatientRepository();
