import patientRepository from '../repositories/patient.repository.js';
import patientTimelineService from './patientTimeline.service.js';
import patientAuditService from './patientAudit.service.js';
import ApiError from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { parseQueryOptions } from '../utils/pagination.js';
import { TIMELINE_EVENT } from '../constants/patient.js';
import {
  normalizeCnic,
  isValidCnic,
  isValidPhone,
  generateSerial,
  calculateAge,
} from '../utils/patientHelpers.js';
import { getStorage } from '../storage/index.js';
import mongoose from 'mongoose';

const SEARCHABLE = [
  'fullName',
  'patientId',
  'registrationNumber',
  'admissionNumber',
  'cnic',
  'phone',
  'guardian.guardianName',
  'emergencyContacts.name',
];

class PatientService {
  async list(query) {
    const options = parseQueryOptions(query, { searchableFields: SEARCHABLE });
    const filter = { ...options.filter };

    if (query.status) filter.status = query.status;
    if (query.gender) filter.gender = query.gender;
    if (query.city) filter.city = new RegExp(query.city, 'i');
    if (query.admissionType) filter['admission.admissionType'] = query.admissionType;
    if (query.doctor) filter['admission.doctorName'] = new RegExp(query.doctor, 'i');

    if (query.admissionFrom || query.admissionTo) {
      filter.admissionDate = {};
      if (query.admissionFrom) filter.admissionDate.$gte = new Date(query.admissionFrom);
      if (query.admissionTo) filter.admissionDate.$lte = new Date(query.admissionTo);
    }

    options.filter = filter;
    return patientRepository.paginate(options);
  }

  async summary() {
    const baseFilter = { deletedAt: null };
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [total, byStatus, admittedThisMonth, drafts, recentRaw] = await Promise.all([
      patientRepository.model.countDocuments(baseFilter),
      patientRepository.model.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      patientRepository.model.countDocuments({
        ...baseFilter,
        admissionDate: { $gte: monthStart, $lte: monthEnd },
        status: { $nin: ['draft', 'inactive'] },
      }),
      patientRepository.model.countDocuments({ ...baseFilter, status: 'draft' }),
      patientRepository.model
        .find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('patientId fullName firstName lastName status admissionDate phone city guardian profilePhoto')
        .lean(),
    ]);

    const statusMap = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
    const active = (statusMap.admitted ?? 0) + (statusMap.under_treatment ?? 0);

    return {
      total,
      active,
      drafts,
      admittedThisMonth,
      discharged: statusMap.discharged ?? 0,
      recovered: statusMap.recovered ?? 0,
      byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
      recentPatients: recentRaw.map((p) => ({
        id: p._id.toString(),
        patientId: p.patientId,
        fullName: p.fullName,
        firstName: p.firstName,
        lastName: p.lastName,
        status: p.status,
        admissionDate: p.admissionDate,
        phone: p.phone,
        city: p.city,
        profilePhoto: p.profilePhoto,
        guardianName: p.guardian?.guardianName,
      })),
    };
  }

  async getById(id) {
    const patient = await patientRepository.findById(id);
    if (!patient) throw ApiError.notFound(MESSAGES.PATIENT.NOT_FOUND, { code: 'PATIENT_NOT_FOUND' });
    return patient;
  }

  async checkDuplicates({ cnic, phone }, excludeId) {
    const warnings = [];
    if (cnic && isValidCnic(cnic)) {
      const normalized = normalizeCnic(cnic);
      const dup = await patientRepository.findByCnic(normalized, excludeId);
      if (dup) warnings.push({ field: 'cnic', message: 'CNIC already registered', patient: dup });
    }
    if (phone && isValidPhone(phone)) {
      const dup = await patientRepository.findByPhone(phone, excludeId);
      if (dup) warnings.push({ field: 'phone', message: 'Phone number already in use', patient: dup });
    }
    return warnings;
  }

  async create(payload, reqUser, req) {
    const year = new Date().getFullYear();
    const [patientId, registrationNumber, admissionNumber] = await Promise.all([
      generateSerial(patientRepository, 'patientId', 'PAT', year),
      generateSerial(patientRepository, 'registrationNumber', 'REG', year),
      generateSerial(patientRepository, 'admissionNumber', 'ADM', year),
    ]);

    const data = this.preparePayload(payload);
    if (data.cnic) {
      data.cnic = normalizeCnic(data.cnic);
      if (!isValidCnic(data.cnic)) {
        throw ApiError.badRequest('Invalid CNIC format', { code: 'INVALID_CNIC' });
      }
    }

    const patient = await patientRepository.create({
      ...data,
      patientId,
      registrationNumber,
      admissionNumber,
      status: payload.status ?? 'draft',
      createdBy: reqUser.id,
      updatedBy: reqUser.id,
    });

    await patientTimelineService.record(patient.id, TIMELINE_EVENT.PATIENT_CREATED, {
      userId: reqUser.id,
      description: `Patient ${patient.patientId} registered`,
    });

    return patientRepository.findById(patient.id);
  }

  async update(id, payload, reqUser, req) {
    const existing = await this.getById(id);
    const data = this.preparePayload(payload);

    if (data.cnic) {
      data.cnic = normalizeCnic(data.cnic);
      if (!isValidCnic(data.cnic)) {
        throw ApiError.badRequest('Invalid CNIC format', { code: 'INVALID_CNIC' });
      }
    }

    if (data.dateOfBirth) {
      data.age = calculateAge(data.dateOfBirth);
    }

    data.updatedBy = new mongoose.Types.ObjectId(reqUser.id);

    const updated = await patientRepository.model
      .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .populate({ path: 'createdBy', select: 'firstName lastName email' })
      .lean({ virtuals: true });

    await patientAuditService.logChanges(id, existing, updated, reqUser.id, req);

    const event = this.resolveTimelineEvent(payload);
    if (event) {
      await patientTimelineService.record(id, event, { userId: reqUser.id });
    }

    if (payload.status && payload.status !== existing.status) {
      await patientTimelineService.record(id, TIMELINE_EVENT.STATUS_CHANGED, {
        userId: reqUser.id,
        metadata: { from: existing.status, to: payload.status },
      });
    }

    return updated;
  }

  resolveTimelineEvent(payload) {
    if (payload.admission) return TIMELINE_EVENT.ADMISSION_UPDATED;
    if (payload.medical || payload.mentalHealth) return TIMELINE_EVENT.MEDICAL_UPDATED;
    if (payload.guardian) return TIMELINE_EVENT.GUARDIAN_UPDATED;
    if (payload.consent) return TIMELINE_EVENT.CONSENT_SIGNED;
    if (payload.discharge) return TIMELINE_EVENT.DISCHARGED;
    return TIMELINE_EVENT.PATIENT_UPDATED;
  }

  preparePayload(payload) {
    const data = { ...payload };
    delete data.id;
    delete data._id;
    delete data.patientId;
    delete data.registrationNumber;
    delete data.admissionNumber;
    delete data.createdBy;
    delete data.createdAt;
    delete data.updatedAt;
    return data;
  }

  validateForSubmit(patient) {
    const errors = [];
    if (!patient.firstName?.trim()) errors.push('First name is required');
    if (!patient.gender) errors.push('Gender is required');
    if (!patient.dateOfBirth) errors.push('Date of birth is required');
    if (!patient.phone?.trim()) errors.push('Phone is required');
    if (!patient.admissionDate) errors.push('Admission date is required');
    if (!patient.guardian?.guardianName?.trim()) errors.push('Guardian name is required');
    if (!patient.emergencyContacts?.length) errors.push('At least one emergency contact is required');
    const primary = patient.emergencyContacts?.find((c) => c.priority === 'primary') ?? patient.emergencyContacts?.[0];
    if (!primary?.name?.trim() || !primary?.phone?.trim()) {
      errors.push('Emergency contact name and phone are required');
    }
    const c = patient.consent ?? {};
    if (!c.patientConsent && !c.guardianConsent) errors.push('Patient or guardian consent is required');
    if (!c.treatmentAgreement) errors.push('Treatment agreement is required');
    if (!c.hospitalRulesAgreement) errors.push('Hospital rules agreement is required');
    if (!c.privacyAgreement) errors.push('Privacy agreement is required');
    return errors;
  }

  async submit(id, reqUser, req) {
    const patient = await this.getById(id);
    const errors = this.validateForSubmit(patient);
    if (errors.length) {
      throw ApiError.badRequest('Cannot submit patient admission', {
        code: 'SUBMIT_VALIDATION',
        details: errors,
      });
    }

    const status = patient.status === 'draft' ? 'admitted' : patient.status;
    return this.update(
      id,
      { status, wizardStep: 10 },
      reqUser,
      req,
    );
  }

  async remove(id, reqUser, req) {
    await this.getById(id);
    await patientRepository.softDelete(id);
    await patientAuditService.log({
      patientId: id,
      action: 'delete',
      field: 'deletedAt',
      oldValue: null,
      newValue: new Date(),
      userId: reqUser.id,
      req,
    });
  }

  async uploadDocument(id, file, { type, label }, reqUser) {
    await this.getById(id);
    const storage = getStorage();
    const { url, publicId } = await storage.upload(file.buffer, {
      filename: `${type}-${file.originalname}`,
    });

    const doc = {
      type,
      label: label || type,
      url,
      publicId,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: reqUser.id,
      uploadedAt: new Date(),
    };

    const updated = await patientRepository.model
      .findByIdAndUpdate(id, { $push: { documents: doc } }, { new: true })
      .lean({ virtuals: true });

    if (type === 'patient_photo') {
      await patientRepository.model.findByIdAndUpdate(id, {
        profilePhoto: { url, publicId },
      });
    }

    await patientTimelineService.record(id, TIMELINE_EVENT.DOCUMENT_UPLOADED, {
      userId: reqUser.id,
      metadata: { type, fileName: file.originalname },
    });

    return updated;
  }

  async removeDocument(id, documentId, reqUser) {
    const patient = await this.getById(id);
    const doc = patient.documents?.find((d) => d._id?.toString() === documentId || d.id === documentId);
    if (!doc) throw ApiError.notFound('Document not found', { code: 'DOCUMENT_NOT_FOUND' });

    if (doc.publicId) {
      try {
        await getStorage().remove(doc.publicId);
      } catch {
        /* ignore storage errors */
      }
    }

    await patientRepository.model.findByIdAndUpdate(id, {
      $pull: { documents: { _id: documentId } },
    });

    await patientAuditService.log({
      patientId: id,
      action: 'document_delete',
      field: 'documents',
      oldValue: doc,
      newValue: null,
      userId: reqUser.id,
    });
  }

  getTimeline(patientId, query) {
    return patientTimelineService.list(patientId, query);
  }

  getAuditLog(patientId, query) {
    return patientAuditService.list(patientId, query);
  }
}

export default new PatientService();
