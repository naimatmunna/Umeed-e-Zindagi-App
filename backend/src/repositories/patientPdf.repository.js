import PatientPdf from '../models/patientPdf.model.js';
import BaseRepository from './base.repository.js';

class PatientPdfRepository extends BaseRepository {
  constructor() {
    super(PatientPdf);
  }

  listByPatient(patientId) {
    return this.model.find({ patientId }).sort({ createdAt: -1 }).lean({ virtuals: true });
  }

  nextVersion(patientId, language) {
    return this.model.countDocuments({ patientId, language }) + 1;
  }
}

export default new PatientPdfRepository();
