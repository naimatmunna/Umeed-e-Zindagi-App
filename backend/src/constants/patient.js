export const PATIENT_STATUSES = Object.freeze([
  'draft',
  'admitted',
  'under_treatment',
  'recovered',
  'discharged',
  'transferred',
  'inactive',
]);

export const GENDERS = Object.freeze(['male', 'female', 'other']);

export const MARITAL_STATUSES = Object.freeze(['single', 'married', 'divorced', 'widowed', 'other']);

export const ADMISSION_TYPES = Object.freeze(['walk_in', 'referral', 'transfer', 'emergency']);

export const CONTACT_PRIORITIES = Object.freeze(['primary', 'secondary', 'other']);

export const SUBSTANCE_TYPES = Object.freeze([
  'heroin',
  'ice',
  'methamphetamine',
  'hashish',
  'alcohol',
  'opium',
  'cannabis',
  'prescription_drugs',
  'injectable_drugs',
  'other',
]);

export const FREQUENCIES = Object.freeze(['daily', 'weekly', 'monthly', 'occasionally']);

export const ROUTES_OF_USE = Object.freeze(['smoking', 'injection', 'oral', 'sniffing', 'other']);

export const EXISTING_DISEASES = Object.freeze([
  'diabetes',
  'hypertension',
  'hepatitis_b',
  'hepatitis_c',
  'hiv',
  'tuberculosis',
  'asthma',
  'heart_disease',
  'kidney_disease',
  'mental_illness',
  'other',
]);

export const BLOOD_GROUPS = Object.freeze(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']);

export const DOCUMENT_TYPES = Object.freeze([
  'patient_photo',
  'cnic_front',
  'cnic_back',
  'guardian_cnic',
  'medical_report',
  'lab_report',
  'prescription',
  'referral_letter',
  'police_clearance',
  'consent_form',
  'other',
]);

export const TIMELINE_EVENT = Object.freeze({
  PATIENT_CREATED: 'patient_created',
  ADMISSION_UPDATED: 'admission_updated',
  MEDICAL_UPDATED: 'medical_updated',
  GUARDIAN_UPDATED: 'guardian_updated',
  DOCUMENT_UPLOADED: 'document_uploaded',
  CONSENT_SIGNED: 'consent_signed',
  STATUS_CHANGED: 'status_changed',
  DISCHARGED: 'discharged',
  PDF_GENERATED: 'pdf_generated',
  PATIENT_UPDATED: 'patient_updated',
});

export const TIMELINE_EVENTS = Object.freeze(Object.values(TIMELINE_EVENT));

export const PDF_LANGUAGES = Object.freeze(['en', 'ur', 'bilingual']);
