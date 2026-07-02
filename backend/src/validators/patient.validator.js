import { z } from 'zod';
import {
  PATIENT_STATUSES,
  GENDERS,
  MARITAL_STATUSES,
  ADMISSION_TYPES,
  CONTACT_PRIORITIES,
  SUBSTANCE_TYPES,
  FREQUENCIES,
  ROUTES_OF_USE,
  EXISTING_DISEASES,
  BLOOD_GROUPS,
  DOCUMENT_TYPES,
  PDF_LANGUAGES,
} from '../constants/patient.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const emergencyContactSchema = z.object({
  name: z.string().max(120).optional(),
  relationship: z.string().max(60).optional(),
  phone: z.string().max(20).optional(),
  alternatePhone: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  priority: z.enum([...CONTACT_PRIORITIES]).optional(),
});

const addictionSchema = z.object({
  substanceType: z.enum([...SUBSTANCE_TYPES]).optional(),
  frequency: z.enum([...FREQUENCIES]).optional(),
  duration: z.string().max(80).optional(),
  quantity: z.string().max(80).optional(),
  route: z.enum([...ROUTES_OF_USE]).optional(),
  lastUsedDate: z.coerce.date().optional(),
});

const guardianSchema = z.object({
  guardianName: z.string().max(120).optional(),
  relationship: z.string().max(60).optional(),
  phone: z.string().max(20).optional(),
  alternatePhone: z.string().max(20).optional(),
  cnic: z.string().max(20).optional(),
  occupation: z.string().max(120).optional(),
  address: z.string().max(300).optional(),
  email: z.string().email().optional().or(z.literal('')),
  guardianResponsible: z.boolean().optional(),
});

const admissionSchema = z.object({
  admissionType: z.enum(ADMISSION_TYPES).optional(),
  referredBy: z.string().max(120).optional(),
  hospitalName: z.string().max(200).optional(),
  doctorName: z.string().max(120).optional(),
  reasonForAdmission: z.string().max(500).optional(),
  chiefComplaint: z.string().max(500).optional(),
  presentingSymptoms: z.string().max(1000).optional(),
  admissionNotes: z.string().max(2000).optional(),
});

const medicalSchema = z.object({
  existingDiseases: z.array(z.enum([...EXISTING_DISEASES])).optional(),
  allergies: z.string().max(500).optional(),
  currentMedications: z.string().max(1000).optional(),
  surgeries: z.string().max(1000).optional(),
  previousHospitalizations: z.string().max(1000).optional(),
  bloodGroup: z.enum([...BLOOD_GROUPS]).optional(),
  height: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).optional(),
  disability: z.string().max(300).optional(),
  infectiousDisease: z.string().max(300).optional(),
  medicalNotes: z.string().max(2000).optional(),
});

const mentalHealthSchema = z.object({
  depression: z.boolean().optional(),
  anxiety: z.boolean().optional(),
  aggression: z.boolean().optional(),
  suicidalHistory: z.boolean().optional(),
  hallucinations: z.boolean().optional(),
  selfHarmHistory: z.boolean().optional(),
  psychiatricTreatment: z.string().max(1000).optional(),
  psychiatricNotes: z.string().max(2000).optional(),
});

const socialSchema = z.object({
  employmentStatus: z.string().max(80).optional(),
  familySupport: z.string().max(300).optional(),
  livingSituation: z.string().max(300).optional(),
  educationLevel: z.string().max(120).optional(),
  financialCondition: z.string().max(300).optional(),
  criminalHistory: z.string().max(500).optional(),
  legalCases: z.string().max(500).optional(),
  socialNotes: z.string().max(2000).optional(),
});

const consentSchema = z.object({
  patientConsent: z.boolean().optional(),
  guardianConsent: z.boolean().optional(),
  treatmentAgreement: z.boolean().optional(),
  hospitalRulesAgreement: z.boolean().optional(),
  privacyAgreement: z.boolean().optional(),
  emergencyTreatmentPermission: z.boolean().optional(),
  dataProcessingConsent: z.boolean().optional(),
  digitalSignature: z.string().max(200).optional(),
  signedDate: z.coerce.date().optional(),
});

const dischargeSchema = z.object({
  dischargeDate: z.coerce.date().optional(),
  dischargeReason: z.string().max(500).optional(),
  doctorRemarks: z.string().max(1000).optional(),
  followUpDate: z.coerce.date().optional(),
  followUpInstructions: z.string().max(1000).optional(),
});

const patientBodySchema = z.object({
  status: z.enum([...PATIENT_STATUSES]).optional(),
  wizardStep: z.coerce.number().int().min(1).max(10).optional(),
  admissionDate: z.coerce.date().optional(),
  firstName: z.string().max(80).optional(),
  middleName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  gender: z.enum([...GENDERS]).optional(),
  dateOfBirth: z.coerce.date().optional(),
  maritalStatus: z.enum([...MARITAL_STATUSES]).optional(),
  nationality: z.string().max(80).optional(),
  religion: z.string().max(80).optional(),
  cnic: z.string().max(20).optional(),
  passportNumber: z.string().max(30).optional(),
  phone: z.string().max(20).optional(),
  alternatePhone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  occupation: z.string().max(120).optional(),
  education: z.string().max(120).optional(),
  monthlyIncome: z.coerce.number().min(0).optional(),
  address: z.string().max(300).optional(),
  country: z.string().max(80).optional(),
  province: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  postalCode: z.string().max(20).optional(),
  currentAddress: z.string().max(300).optional(),
  permanentAddress: z.string().max(300).optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  guardian: guardianSchema.optional(),
  admission: admissionSchema.optional(),
  addictions: z.array(addictionSchema).optional(),
  medical: medicalSchema.optional(),
  mentalHealth: mentalHealthSchema.optional(),
  social: socialSchema.optional(),
  consent: consentSchema.optional(),
  discharge: dischargeSchema.optional(),
});

export const listPatientsSchema = {
  query: z
    .object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
      search: z.string().optional(),
      status: z.enum([...PATIENT_STATUSES]).optional(),
      gender: z.enum([...GENDERS]).optional(),
      city: z.string().optional(),
      admissionType: z.enum([...ADMISSION_TYPES]).optional(),
      doctor: z.string().optional(),
      admissionFrom: z.string().optional(),
      admissionTo: z.string().optional(),
      sort: z.string().optional(),
    })
    .passthrough(),
};

export const createPatientSchema = { body: patientBodySchema };
export const updatePatientSchema = {
  params: z.object({ id: objectId }),
  body: patientBodySchema,
};
export const patientIdSchema = { params: z.object({ id: objectId }) };
export const exportPatientPdfSchema = {
  params: z.object({ id: objectId }),
  query: z.object({ lang: z.enum([...PDF_LANGUAGES]).optional() }),
};
export const uploadDocumentSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    type: z.enum([...DOCUMENT_TYPES]),
    label: z.string().max(120).optional(),
  }),
};
export const documentIdSchema = {
  params: z.object({ id: objectId, documentId: objectId }),
};
export const checkDuplicatesSchema = {
  query: z.object({
    cnic: z.string().optional(),
    phone: z.string().optional(),
    excludeId: objectId.optional(),
  }),
};
