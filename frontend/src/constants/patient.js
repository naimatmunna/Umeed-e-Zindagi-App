export const PATIENT_STATUSES = [
  'draft', 'admitted', 'under_treatment', 'recovered', 'discharged', 'transferred', 'inactive',
];

export const GENDERS = ['male', 'female', 'other'];
export const MARITAL_STATUSES = ['single', 'married', 'divorced', 'widowed', 'other'];
export const ADMISSION_TYPES = ['walk_in', 'referral', 'transfer', 'emergency'];
export const CONTACT_PRIORITIES = ['primary', 'secondary', 'other'];
export const SUBSTANCE_TYPES = [
  'heroin', 'ice', 'methamphetamine', 'hashish', 'alcohol', 'opium', 'cannabis',
  'prescription_drugs', 'injectable_drugs', 'other',
];
export const FREQUENCIES = ['daily', 'weekly', 'monthly', 'occasionally'];
export const ROUTES_OF_USE = ['smoking', 'injection', 'oral', 'sniffing', 'other'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'];
export const EXISTING_DISEASES = [
  'diabetes', 'hypertension', 'hepatitis_b', 'hepatitis_c', 'hiv', 'tuberculosis',
  'asthma', 'heart_disease', 'kidney_disease', 'mental_illness', 'other',
];
export const DOCUMENT_TYPES = [
  'patient_photo', 'cnic_front', 'cnic_back', 'guardian_cnic', 'medical_report',
  'lab_report', 'prescription', 'referral_letter', 'police_clearance', 'consent_form', 'other',
];

export const REQUIRED_DOCUMENT_TYPES = ['patient_photo', 'cnic_front', 'consent_form'];
export const ACCEPTED_DOCUMENT_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

export const WIZARD_STEPS = 10;

export const formatLabel = (value) =>
  value ? String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';
