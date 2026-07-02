import Patient from '../models/patient.model.js';
import PatientTimeline from '../models/patientTimeline.model.js';
import User from '../models/user.model.js';
import { TIMELINE_EVENT } from '../constants/patient.js';
import logger from '../utils/logger.js';

const year = new Date().getFullYear();

const demoPatients = (createdBy) => [
  {
    patientId: `PAT-${year}-00001`,
    registrationNumber: `REG-${year}-00001`,
    admissionNumber: `ADM-${year}-00001`,
    status: 'admitted',
    wizardStep: 10,
    firstName: 'Ahmed',
    lastName: 'Raza',
    fullName: 'Ahmed Raza',
    gender: 'male',
    dateOfBirth: new Date('1992-04-15'),
    age: 33,
    cnic: '35201-1234567-1',
    phone: '03001234567',
    email: 'ahmed.raza@example.com',
    city: 'Lahore',
    province: 'Punjab',
    currentAddress: 'House 12, Model Town, Lahore',
    admissionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    guardian: {
      guardianName: 'Muhammad Raza',
      relationship: 'Father',
      phone: '03009876543',
      cnic: '35201-7654321-9',
      guardianResponsible: true,
    },
    emergencyContacts: [
      { name: 'Fatima Raza', relationship: 'Sister', phone: '03001112233', priority: 'primary' },
    ],
    admission: {
      admissionType: 'referral',
      doctorName: 'Dr. Hassan Ali',
      reasonForAdmission: 'Substance use rehabilitation',
      chiefComplaint: 'Heroin dependency',
      referredBy: 'Mayo Hospital',
    },
    addictions: [
      { substanceType: 'heroin', frequency: 'daily', route: 'injection', duration: '3 years' },
    ],
    medical: {
      existingDiseases: ['hepatitis_c'],
      bloodGroup: 'B+',
      height: 175,
      weight: 68,
      bmi: 22.2,
      allergies: 'Penicillin',
      currentMedications: 'Vitamin supplements',
    },
    mentalHealth: {
      depression: true,
      anxiety: true,
      psychiatricTreatment: 'Outpatient counseling in 2024',
    },
    social: {
      employmentStatus: 'Unemployed',
      familySupport: 'Moderate — father involved',
      livingSituation: 'Lives with parents',
    },
    consent: {
      patientConsent: true,
      guardianConsent: true,
      treatmentAgreement: true,
      hospitalRulesAgreement: true,
      privacyAgreement: true,
      emergencyTreatmentPermission: true,
      dataProcessingConsent: true,
      signedDate: new Date(),
    },
    createdBy,
    updatedBy: createdBy,
  },
  {
    patientId: `PAT-${year}-00002`,
    registrationNumber: `REG-${year}-00002`,
    admissionNumber: `ADM-${year}-00002`,
    status: 'under_treatment',
    wizardStep: 10,
    firstName: 'Sara',
    lastName: 'Khan',
    fullName: 'Sara Khan',
    gender: 'female',
    dateOfBirth: new Date('1998-08-22'),
    age: 27,
    cnic: '42101-2345678-2',
    phone: '03007654321',
    city: 'Karachi',
    province: 'Sindh',
    currentAddress: 'Flat 4B, Gulshan-e-Iqbal, Karachi',
    admissionDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    guardian: {
      guardianName: 'Ayesha Khan',
      relationship: 'Mother',
      phone: '03005556677',
      guardianResponsible: true,
    },
    emergencyContacts: [
      { name: 'Ayesha Khan', relationship: 'Mother', phone: '03005556677', priority: 'primary' },
      { name: 'Bilal Khan', relationship: 'Brother', phone: '03004445566', priority: 'secondary' },
    ],
    admission: {
      admissionType: 'walk_in',
      doctorName: 'Dr. Saima Noor',
      reasonForAdmission: 'Ice addiction treatment',
      chiefComplaint: 'Methamphetamine use',
    },
    addictions: [
      { substanceType: 'ice', frequency: 'weekly', route: 'smoking', duration: '18 months' },
      { substanceType: 'cannabis', frequency: 'occasionally', route: 'smoking' },
    ],
    medical: {
      bloodGroup: 'O+',
      height: 162,
      weight: 55,
      existingDiseases: ['asthma'],
      allergies: 'None known',
    },
    mentalHealth: {
      anxiety: true,
      aggression: false,
      suicidalHistory: false,
    },
    social: {
      employmentStatus: 'Part-time',
      educationLevel: 'Intermediate',
      familySupport: 'Strong',
    },
    consent: {
      patientConsent: true,
      treatmentAgreement: true,
      hospitalRulesAgreement: true,
      privacyAgreement: true,
      signedDate: new Date(),
    },
    createdBy,
    updatedBy: createdBy,
  },
  {
    patientId: `PAT-${year}-00003`,
    registrationNumber: `REG-${year}-00003`,
    admissionNumber: `ADM-${year}-00003`,
    status: 'recovered',
    wizardStep: 10,
    firstName: 'Usman',
    lastName: 'Malik',
    fullName: 'Usman Malik',
    gender: 'male',
    dateOfBirth: new Date('1988-01-10'),
    age: 37,
    cnic: '61101-3456789-3',
    phone: '03003334455',
    city: 'Islamabad',
    province: 'ICT',
    admissionDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    guardian: {
      guardianName: 'Nadia Malik',
      relationship: 'Spouse',
      phone: '03002223344',
    },
    emergencyContacts: [{ name: 'Nadia Malik', relationship: 'Spouse', phone: '03002223344', priority: 'primary' }],
    admission: {
      admissionType: 'transfer',
      doctorName: 'Dr. Imran Shah',
      reasonForAdmission: 'Alcohol dependency program',
      hospitalName: 'PIMS Islamabad',
    },
    addictions: [{ substanceType: 'alcohol', frequency: 'daily', route: 'oral', duration: '5 years' }],
    medical: { bloodGroup: 'A+', height: 180, weight: 82 },
    mentalHealth: { depression: true },
    social: { employmentStatus: 'Employed', familySupport: 'Strong' },
    consent: {
      patientConsent: true,
      treatmentAgreement: true,
      hospitalRulesAgreement: true,
      privacyAgreement: true,
      signedDate: new Date(),
    },
    createdBy,
    updatedBy: createdBy,
  },
  {
    patientId: `PAT-${year}-00004`,
    registrationNumber: `REG-${year}-00004`,
    admissionNumber: `ADM-${year}-00004`,
    status: 'discharged',
    wizardStep: 10,
    firstName: 'Hina',
    lastName: 'Abbas',
    fullName: 'Hina Abbas',
    gender: 'female',
    dateOfBirth: new Date('1995-11-30'),
    age: 30,
    cnic: '35202-4567890-4',
    phone: '03006667788',
    city: 'Lahore',
    province: 'Punjab',
    admissionDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    discharge: {
      dischargeDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dischargeReason: 'Completed treatment program',
      doctorRemarks: 'Good progress, follow-up in 2 weeks',
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    guardian: { guardianName: 'Abbas Ali', relationship: 'Father', phone: '03007778899' },
    emergencyContacts: [{ name: 'Abbas Ali', relationship: 'Father', phone: '03007778899', priority: 'primary' }],
    admission: {
      admissionType: 'emergency',
      doctorName: 'Dr. Hassan Ali',
      reasonForAdmission: 'Crisis intervention',
    },
    addictions: [{ substanceType: 'hashish', frequency: 'daily', route: 'smoking' }],
    medical: { bloodGroup: 'AB+', height: 165, weight: 58 },
    consent: {
      patientConsent: true,
      guardianConsent: true,
      treatmentAgreement: true,
      hospitalRulesAgreement: true,
      privacyAgreement: true,
      signedDate: new Date(),
    },
    createdBy,
    updatedBy: createdBy,
  },
  {
    patientId: `PAT-${year}-00005`,
    registrationNumber: `REG-${year}-00005`,
    admissionNumber: `ADM-${year}-00005`,
    status: 'draft',
    wizardStep: 4,
    firstName: 'Bilal',
    lastName: 'Hussain',
    fullName: 'Bilal Hussain',
    gender: 'male',
    phone: '03009998877',
    city: 'Rawalpindi',
    province: 'Punjab',
    guardian: { guardianName: 'Tariq Hussain', relationship: 'Father', phone: '03008887766' },
    emergencyContacts: [{ name: 'Tariq Hussain', relationship: 'Father', phone: '03008887766', priority: 'primary' }],
    createdBy,
    updatedBy: createdBy,
  },
];

export const seedPatients = async () => {
  const exists = await Patient.exists({});
  if (exists) {
    logger.info('Patients already seeded');
    return;
  }

  const admin = await User.findOne({ email: 'admin@example.com' }).select('_id');
  if (!admin) {
    logger.warn('Skipping patient seed — admin user not found');
    return;
  }

  const patients = demoPatients(admin._id);
  const inserted = await Patient.insertMany(patients);

  await PatientTimeline.insertMany(
    inserted.map((p) => ({
      patientId: p._id,
      event: TIMELINE_EVENT.PATIENT_CREATED,
      title: 'Patient created',
      description: `Demo patient ${p.patientId} seeded`,
      performedBy: admin._id,
    })),
  );

  logger.info(`Seeded ${inserted.length} demo patients`);
};

export const destroyPatients = async () => {
  await PatientTimeline.deleteMany({});
  await Patient.deleteMany({});
  logger.info('Removed all patients');
};
