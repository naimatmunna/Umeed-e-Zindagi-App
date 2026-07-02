import {
  REQUIRED_DOCUMENT_TYPES,
  ACCEPTED_DOCUMENT_MIMES,
  MAX_DOCUMENT_SIZE_BYTES,
} from '@/constants/patient.js';

const CNIC_REGEX = /^\d{5}-\d{7}-\d$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+92|0)?3\d{9}$/;

export { REQUIRED_DOCUMENT_TYPES };
export const MAX_DOCUMENT_SIZE = MAX_DOCUMENT_SIZE_BYTES;
export const ACCEPTED_DOCUMENT_TYPES = ACCEPTED_DOCUMENT_MIMES;
export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad',
  'Gilgit-Baltistan',
  'Azad Kashmir',
];

export const formatCnicInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export const formatPhoneInput = (value) => {
  const raw = String(value ?? '').replace(/[^\d+]/g, '');
  if (raw.startsWith('+')) return `+${raw.slice(1).replace(/\D/g, '').slice(0, 12)}`;
  return raw.replace(/\D/g, '').slice(0, 11);
};


const isEmpty = (v) => v === undefined || v === null || String(v).trim() === '';

export const validateField = (path, form, t) => {
  switch (path) {
    case 'firstName':
      if (isEmpty(form.firstName)) return t('validation.required', { field: t('fields.firstName') });
      if (form.firstName.trim().length < 2) return t('validation.minLength', { min: 2 });
      return '';
    case 'gender':
      return isEmpty(form.gender) ? t('validation.required', { field: t('fields.gender') }) : '';
    case 'phone':
      if (isEmpty(form.phone)) return t('validation.required', { field: t('fields.phone') });
      if (!PHONE_REGEX.test(form.phone.replace(/\s/g, ''))) return t('validation.phoneFormat');
      return '';
    case 'cnic':
      if (!isEmpty(form.cnic) && !CNIC_REGEX.test(form.cnic)) return t('validation.cnicFormat');
      return '';
    case 'email':
      if (!isEmpty(form.email) && !EMAIL_REGEX.test(form.email)) return t('validation.emailFormat');
      return '';
    case 'currentAddress':
      return isEmpty(form.currentAddress)
        ? t('validation.required', { field: t('fields.currentAddress') })
        : '';
    case 'city':
      return isEmpty(form.city) ? t('validation.required', { field: t('fields.city') }) : '';
    case 'guardian.guardianName':
      return isEmpty(form.guardian?.guardianName)
        ? t('validation.required', { field: t('fields.guardianName') })
        : '';
    case 'guardian.phone':
      if (isEmpty(form.guardian?.phone)) return t('validation.required', { field: t('fields.phone') });
      if (!PHONE_REGEX.test(form.guardian.phone.replace(/\s/g, ''))) return t('validation.phoneFormat');
      return '';
    case 'guardian.cnic':
      if (!isEmpty(form.guardian?.cnic) && !CNIC_REGEX.test(form.guardian.cnic)) return t('validation.cnicFormat');
      return '';
    case 'admissionDate':
      return isEmpty(form.admissionDate)
        ? t('validation.required', { field: t('fields.admissionDate') })
        : '';
    case 'admission.doctorName':
      return isEmpty(form.admission?.doctorName)
        ? t('validation.required', { field: t('fields.doctorName') })
        : '';
  }

  const emergencyMatch = path.match(/^emergencyContacts\.(\d+)\.(name|phone)$/);
  if (emergencyMatch) {
    const idx = Number(emergencyMatch[1]);
    const field = emergencyMatch[2];
    const contact = form.emergencyContacts?.[idx];
    if (idx === 0) {
      if (field === 'name' && isEmpty(contact?.name)) {
        return t('validation.required', { field: t('fields.firstName') });
      }
      if (field === 'phone') {
        if (isEmpty(contact?.phone)) return t('validation.required', { field: t('fields.phone') });
        if (!PHONE_REGEX.test(contact.phone.replace(/\s/g, ''))) return t('validation.phoneFormat');
      }
    } else if (contact && (contact.name?.trim() || contact.phone?.trim())) {
      if (field === 'phone' && contact.phone && !PHONE_REGEX.test(contact.phone.replace(/\s/g, ''))) {
        return t('validation.phoneFormat');
      }
    }
  }

  const consentMatch = path.match(/^consent\.(.+)$/);
  if (consentMatch) {
    const key = consentMatch[1];
    if (key === 'patientOrGuardian') {
      if (!form.consent?.patientConsent && !form.consent?.guardianConsent) {
        return t('validation.consentRequired');
      }
      return '';
    }
    if (['treatmentAgreement', 'hospitalRulesAgreement', 'privacyAgreement'].includes(key)) {
      if (!form.consent?.[key]) return t('validation.requiredConsent');
    }
    return '';
  }

  return '';
};

const STEP_FIELDS = {
  1: ['firstName', 'gender', 'phone', 'cnic', 'email'],
  2: ['currentAddress', 'city'],
  3: ['guardian.guardianName', 'guardian.phone', 'guardian.cnic'],
  4: ['emergencyContacts.0.name', 'emergencyContacts.0.phone'],
  5: ['admissionDate', 'admission.doctorName'],
  9: [
    'consent.patientOrGuardian',
    'consent.treatmentAgreement',
    'consent.hospitalRulesAgreement',
    'consent.privacyAgreement',
  ],
};

export const validateWizardStep = (step, form, t) => {
  const errors = {};
  const fields = STEP_FIELDS[step] ?? [];
  fields.forEach((path) => {
    const msg = validateField(path, form, t);
    if (msg) errors[path] = msg;
  });
  return errors;
};

export const validateAllSteps = (form, t, { includeDocuments = false, pendingDocuments = {}, existingDocuments = {} } = {}) => {
  const allErrors = {};
  for (let s = 1; s <= 9; s += 1) {
    Object.assign(allErrors, validateWizardStep(s, form, t));
  }

  if (includeDocuments) {
    REQUIRED_DOCUMENT_TYPES.forEach((type) => {
      if (!pendingDocuments[type]?.file && !existingDocuments[type]) {
        allErrors[`documents.${type}`] = t('validation.documentRequired', {
          type: t(`documents.types.${type}`),
        });
      }
    });
  }

  return allErrors;
};

export const getStepsWithErrors = (errors) => {
  const steps = new Set();
  Object.keys(errors).forEach((path) => {
    if (path.startsWith('documents.')) {
      steps.add(8);
      return;
    }
    if (path.startsWith('consent.')) {
      steps.add(9);
      return;
    }
    if (path.startsWith('guardian.')) {
      steps.add(3);
      return;
    }
    if (path.startsWith('admission.')) {
      steps.add(5);
      return;
    }
    if (path.startsWith('emergencyContacts.')) {
      steps.add(4);
      return;
    }
    const fieldStep = { firstName: 1, gender: 1, phone: 1, cnic: 1, email: 1, currentAddress: 2, city: 2 };
    if (fieldStep[path]) steps.add(fieldStep[path]);
  });
  return [...steps].sort((a, b) => a - b);
};

export const getFirstErrorStep = (errors) => {
  const steps = getStepsWithErrors(errors);
  return steps[0] ?? null;
};

export const validateForSubmit = (form, t, docState = {}) => {
  const errors = validateAllSteps(form, t, { includeDocuments: true, ...docState });
  return Object.values(errors);
};

export const validateDocumentFile = (file, t) => {
  if (!file) return '';
  if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) return t('validation.fileType');
  if (file.size > MAX_DOCUMENT_SIZE) return t('validation.fileSize', { size: '10 MB' });
  return '';
};
