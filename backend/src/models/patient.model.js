import mongoose from 'mongoose';
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
} from '../constants/patient.js';

const { Schema } = mongoose;

const emergencyContactSchema = new Schema(
  {
    name: { type: String, trim: true, maxlength: 120 },
    relationship: { type: String, trim: true, maxlength: 60 },
    phone: { type: String, trim: true, maxlength: 20 },
    alternatePhone: { type: String, trim: true, maxlength: 20 },
    address: { type: String, trim: true, maxlength: 300 },
    priority: { type: String, enum: CONTACT_PRIORITIES, default: 'other' },
  },
  { _id: true },
);

const addictionSchema = new Schema(
  {
    substanceType: { type: String, enum: SUBSTANCE_TYPES },
    frequency: { type: String, enum: FREQUENCIES },
    duration: { type: String, trim: true, maxlength: 80 },
    quantity: { type: String, trim: true, maxlength: 80 },
    route: { type: String, enum: ROUTES_OF_USE },
    lastUsedDate: { type: Date },
  },
  { _id: true },
);

const documentSchema = new Schema(
  {
    type: { type: String, enum: DOCUMENT_TYPES, required: true },
    label: { type: String, trim: true, maxlength: 120 },
    url: { type: String, required: true },
    publicId: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const consentSchema = new Schema(
  {
    patientConsent: { type: Boolean, default: false },
    guardianConsent: { type: Boolean, default: false },
    treatmentAgreement: { type: Boolean, default: false },
    hospitalRulesAgreement: { type: Boolean, default: false },
    privacyAgreement: { type: Boolean, default: false },
    emergencyTreatmentPermission: { type: Boolean, default: false },
    dataProcessingConsent: { type: Boolean, default: false },
    digitalSignature: { type: String, trim: true, maxlength: 200 },
    signedDate: { type: Date },
  },
  { _id: false },
);

const dischargeSchema = new Schema(
  {
    dischargeDate: { type: Date },
    dischargeReason: { type: String, trim: true, maxlength: 500 },
    doctorRemarks: { type: String, trim: true, maxlength: 1000 },
    followUpDate: { type: Date },
    followUpInstructions: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false },
);

const patientSchema = new Schema(
  {
    patientId: { type: String, unique: true, index: true },
    registrationNumber: { type: String, unique: true, sparse: true, index: true },
    admissionNumber: { type: String, unique: true, sparse: true, index: true },
    admissionDate: { type: Date, index: true },
    status: { type: String, enum: PATIENT_STATUSES, default: 'draft', index: true },
    wizardStep: { type: Number, default: 1, min: 1, max: 10 },

    profilePhoto: { url: String, publicId: String },

    firstName: { type: String, trim: true, maxlength: 80 },
    middleName: { type: String, trim: true, maxlength: 80 },
    lastName: { type: String, trim: true, maxlength: 80 },
    fullName: { type: String, trim: true, maxlength: 240, index: true },
    gender: { type: String, enum: GENDERS },
    dateOfBirth: { type: Date },
    age: { type: Number, min: 0, max: 150 },
    maritalStatus: { type: String, enum: MARITAL_STATUSES },
    nationality: { type: String, trim: true, maxlength: 80 },
    religion: { type: String, trim: true, maxlength: 80 },
    cnic: { type: String, trim: true, maxlength: 20, index: true },
    passportNumber: { type: String, trim: true, maxlength: 30 },
    phone: { type: String, trim: true, maxlength: 20, index: true },
    alternatePhone: { type: String, trim: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    occupation: { type: String, trim: true, maxlength: 120 },
    education: { type: String, trim: true, maxlength: 120 },
    monthlyIncome: { type: Number, min: 0 },

    address: { type: String, trim: true, maxlength: 300 },
    country: { type: String, trim: true, maxlength: 80, default: 'Pakistan' },
    province: { type: String, trim: true, maxlength: 80, index: true },
    city: { type: String, trim: true, maxlength: 80, index: true },
    postalCode: { type: String, trim: true, maxlength: 20 },
    currentAddress: { type: String, trim: true, maxlength: 300 },
    permanentAddress: { type: String, trim: true, maxlength: 300 },

    emergencyContacts: [emergencyContactSchema],

    guardian: {
      guardianName: { type: String, trim: true, maxlength: 120 },
      relationship: { type: String, trim: true, maxlength: 60 },
      phone: { type: String, trim: true, maxlength: 20 },
      alternatePhone: { type: String, trim: true, maxlength: 20 },
      cnic: { type: String, trim: true, maxlength: 20 },
      occupation: { type: String, trim: true, maxlength: 120 },
      address: { type: String, trim: true, maxlength: 300 },
      email: { type: String, trim: true, lowercase: true, maxlength: 120 },
      guardianResponsible: { type: Boolean, default: true },
    },

    admission: {
      admissionType: { type: String, enum: ADMISSION_TYPES },
      referredBy: { type: String, trim: true, maxlength: 120 },
      hospitalName: { type: String, trim: true, maxlength: 200 },
      doctorName: { type: String, trim: true, maxlength: 120, index: true },
      reasonForAdmission: { type: String, trim: true, maxlength: 500 },
      chiefComplaint: { type: String, trim: true, maxlength: 500 },
      presentingSymptoms: { type: String, trim: true, maxlength: 1000 },
      admissionNotes: { type: String, trim: true, maxlength: 2000 },
    },

    addictions: [addictionSchema],

    medical: {
      existingDiseases: [{ type: String, enum: EXISTING_DISEASES }],
      allergies: { type: String, trim: true, maxlength: 500 },
      currentMedications: { type: String, trim: true, maxlength: 1000 },
      surgeries: { type: String, trim: true, maxlength: 1000 },
      previousHospitalizations: { type: String, trim: true, maxlength: 1000 },
      bloodGroup: { type: String, enum: BLOOD_GROUPS },
      height: { type: Number, min: 0 },
      weight: { type: Number, min: 0 },
      bmi: { type: Number, min: 0 },
      disability: { type: String, trim: true, maxlength: 300 },
      infectiousDisease: { type: String, trim: true, maxlength: 300 },
      medicalNotes: { type: String, trim: true, maxlength: 2000 },
    },

    mentalHealth: {
      depression: { type: Boolean, default: false },
      anxiety: { type: Boolean, default: false },
      aggression: { type: Boolean, default: false },
      suicidalHistory: { type: Boolean, default: false },
      hallucinations: { type: Boolean, default: false },
      selfHarmHistory: { type: Boolean, default: false },
      psychiatricTreatment: { type: String, trim: true, maxlength: 1000 },
      psychiatricNotes: { type: String, trim: true, maxlength: 2000 },
    },

    social: {
      employmentStatus: { type: String, trim: true, maxlength: 80 },
      familySupport: { type: String, trim: true, maxlength: 300 },
      livingSituation: { type: String, trim: true, maxlength: 300 },
      educationLevel: { type: String, trim: true, maxlength: 120 },
      financialCondition: { type: String, trim: true, maxlength: 300 },
      criminalHistory: { type: String, trim: true, maxlength: 500 },
      legalCases: { type: String, trim: true, maxlength: 500 },
      socialNotes: { type: String, trim: true, maxlength: 2000 },
    },

    consent: consentSchema,
    discharge: dischargeSchema,
    documents: [documentSchema],

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.createdBy && typeof ret.createdBy === 'object' && ret.createdBy.email) {
          ret.createdByUser = {
            id: ret.createdBy.id ?? ret.createdBy._id?.toString(),
            firstName: ret.createdBy.firstName,
            lastName: ret.createdBy.lastName,
            email: ret.createdBy.email,
          };
          ret.createdBy = ret.createdByUser.id;
        }
        return ret;
      },
    },
  },
);

patientSchema.index({ fullName: 'text', patientId: 'text', cnic: 'text', phone: 'text' });
patientSchema.index({ status: 1, admissionDate: -1 });
patientSchema.index({ 'guardian.guardianName': 1 });
patientSchema.index({ deletedAt: 1, status: 1 });

patientSchema.pre('save', function computeFullName(next) {
  if (this.firstName || this.lastName) {
    this.fullName = [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ').trim();
  }
  if (this.dateOfBirth && !this.age) {
    const dob = new Date(this.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
    this.age = Math.max(0, age);
  }
  if (this.medical?.height && this.medical?.weight) {
    const hM = this.medical.height / 100;
    if (hM > 0) {
      this.medical.bmi = Number((this.medical.weight / (hM * hM)).toFixed(1));
    }
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
