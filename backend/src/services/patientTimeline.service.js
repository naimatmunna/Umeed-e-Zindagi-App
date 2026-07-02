import patientTimelineRepository from '../repositories/patientTimeline.repository.js';
import { TIMELINE_EVENT } from '../constants/patient.js';

const EVENT_TITLES = {
  [TIMELINE_EVENT.PATIENT_CREATED]: 'Patient created',
  [TIMELINE_EVENT.ADMISSION_UPDATED]: 'Admission updated',
  [TIMELINE_EVENT.MEDICAL_UPDATED]: 'Medical information updated',
  [TIMELINE_EVENT.GUARDIAN_UPDATED]: 'Guardian information updated',
  [TIMELINE_EVENT.DOCUMENT_UPLOADED]: 'Document uploaded',
  [TIMELINE_EVENT.CONSENT_SIGNED]: 'Consent signed',
  [TIMELINE_EVENT.STATUS_CHANGED]: 'Status changed',
  [TIMELINE_EVENT.DISCHARGED]: 'Patient discharged',
  [TIMELINE_EVENT.PDF_GENERATED]: 'PDF generated',
  [TIMELINE_EVENT.PATIENT_UPDATED]: 'Patient record updated',
};

class PatientTimelineService {
  async record(patientId, event, { description, metadata, userId } = {}) {
    return patientTimelineRepository.create({
      patientId,
      event,
      title: EVENT_TITLES[event] ?? event,
      description,
      metadata,
      performedBy: userId,
    });
  }

  async list(patientId, query = {}) {
    const limit = Math.min(Number(query.limit) || 50, 100);
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      patientTimelineRepository.listByPatient(patientId, { limit, skip }),
      patientTimelineRepository.countByPatient(patientId),
    ]);
    return {
      items,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    };
  }
}

export default new PatientTimelineService();
