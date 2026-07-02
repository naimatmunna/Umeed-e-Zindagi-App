import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  useCreatePatientMutation,
  useGetPatientQuery,
  useUpdatePatientMutation,
  useSubmitPatientMutation,
  useUploadPatientDocumentMutation,
} from '@/features/patients/patientsApi.js';
import { ROUTES } from '@/constants';
import { WIZARD_STEPS } from '@/constants/patient.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import { loadWizardCache, saveWizardCache, clearWizardCache } from '@/lib/patientWizardCache.js';
import PageMeta from '@/components/common/PageMeta.jsx';
import WizardProgress from '@/components/patients/WizardProgress.jsx';
import MedicalStep from '@/components/patients/wizard/MedicalStep.jsx';
import PatientReviewStep from '@/components/patients/wizard/PatientReviewStep.jsx';
import DocumentsUploadStep from '@/components/patients/wizard/DocumentsUploadStep.jsx';
import { SubstanceStep } from '@/components/patients/wizard/SubstanceStep.jsx';
import {
  BasicInfoStep,
  AddressStep,
  GuardianStep,
  EmergencyContactsStep,
  AdmissionStep,
  ConsentStep,
} from '@/components/patients/wizard/WizardStepPanels.jsx';
import { usePatientWizardValidation } from '@/components/patients/wizard/usePatientWizardValidation.js';
import { validateWizardStep } from '@/components/patients/wizard/wizardValidation.js';
import Button from '@/components/ui/Button.jsx';

const emptyContact = () => ({ name: '', relationship: '', phone: '', priority: 'primary' });
const emptyAddiction = () => ({ substanceType: '', frequency: '', route: '' });

const DOCTOR_SUGGESTIONS = [
  'Dr. Ahmed Khan',
  'Dr. Sara Malik',
  'Dr. Hassan Raza',
  'Dr. Fatima Noor',
  'Dr. Usman Ali',
];

const defaultForm = () => ({
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  maritalStatus: '',
  nationality: 'Pakistani',
  religion: '',
  cnic: '',
  phone: '',
  alternatePhone: '',
  email: '',
  occupation: '',
  education: '',
  monthlyIncome: '',
  currentAddress: '',
  permanentAddress: '',
  city: '',
  province: '',
  postalCode: '',
  admissionDate: new Date().toISOString().slice(0, 10),
  guardian: { guardianName: '', relationship: '', phone: '', cnic: '', address: '', guardianResponsible: true },
  emergencyContacts: [emptyContact()],
  admission: { admissionType: 'walk_in', doctorName: '', reasonForAdmission: '', chiefComplaint: '' },
  medical: {
    bloodGroup: 'unknown',
    allergies: '',
    height: '',
    weight: '',
    existingDiseases: [],
    currentMedications: '',
    surgeries: '',
    previousHospitalizations: '',
    disability: '',
    infectiousDisease: '',
    medicalNotes: '',
  },
  mentalHealth: {
    depression: false,
    anxiety: false,
    aggression: false,
    suicidalHistory: false,
    hallucinations: false,
    selfHarmHistory: false,
    psychiatricTreatment: '',
    psychiatricNotes: '',
  },
  social: {
    employmentStatus: '',
    familySupport: '',
    livingSituation: '',
    educationLevel: '',
    financialCondition: '',
    criminalHistory: '',
    legalCases: '',
    socialNotes: '',
  },
  addictions: [emptyAddiction()],
  consent: {
    patientConsent: false,
    guardianConsent: false,
    treatmentAgreement: false,
    hospitalRulesAgreement: false,
    privacyAgreement: false,
    emergencyTreatmentPermission: false,
    dataProcessingConsent: false,
    digitalSignature: '',
    signedDate: '',
  },
});

const toDateInput = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '');

const mapPatientToForm = (p) => ({
  ...defaultForm(),
  ...p,
  dateOfBirth: toDateInput(p.dateOfBirth),
  admissionDate: toDateInput(p.admissionDate),
  guardian: { ...defaultForm().guardian, ...p.guardian },
  admission: { ...defaultForm().admission, ...p.admission },
  medical: { ...defaultForm().medical, ...p.medical },
  mentalHealth: { ...defaultForm().mentalHealth, ...p.mentalHealth },
  social: { ...defaultForm().social, ...p.social },
  consent: { ...defaultForm().consent, ...p.consent, signedDate: toDateInput(p.consent?.signedDate) },
  emergencyContacts: p.emergencyContacts?.length ? p.emergencyContacts : [emptyContact()],
  addictions: p.addictions?.length ? p.addictions : [emptyAddiction()],
});

const mapDocumentsByType = (documents = []) =>
  Object.fromEntries(documents.map((d) => [d.type, d]));

export default function PatientWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('patient');
  const { t: tc } = useTranslation('common');
  const isEdit = Boolean(id);

  const { data: patientData, isLoading: loadingPatient } = useGetPatientQuery(id, { skip: !id });
  const [createPatient, { isLoading: creating }] = useCreatePatientMutation();
  const [updatePatient, { isLoading: updating }] = useUpdatePatientMutation();
  const [submitPatient, { isLoading: submitting }] = useSubmitPatientMutation();
  const [uploadDocument] = useUploadPatientDocumentMutation();

  const [step, setStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);
  const [patientId, setPatientId] = useState(id ?? null);
  const [form, setForm] = useState(defaultForm());
  const [pendingDocuments, setPendingDocuments] = useState({});
  const [existingDocuments, setExistingDocuments] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const docState = useMemo(
    () => ({ pendingDocuments, existingDocuments }),
    [pendingDocuments, existingDocuments],
  );

  const validation = usePatientWizardValidation(form, t, docState);
  const { getFieldError, touch, touchStep, touchAll, stepsWithErrors } = validation;

  const stepLabels = useMemo(
    () => Object.fromEntries(Array.from({ length: WIZARD_STEPS }, (_, i) => [i + 1, t(`steps.${i + 1}`)])),
    [t],
  );

  const v = useMemo(
    () => ({
      t,
      getFieldError,
      touch,
      doctorSuggestions: DOCTOR_SUGGESTIONS,
    }),
    [t, getFieldError, touch],
  );

  const isSaving = creating || updating || submitting;

  useEffect(() => {
    if (!isEdit) return;
    const p = patientData?.data?.patient;
    if (!p) return;
    setForm(mapPatientToForm(p));
    const loadedStep = Math.min(p.wizardStep ?? 1, WIZARD_STEPS);
    setStep(loadedStep);
    setFurthestStep(loadedStep);
    setPatientId(p.id);
    setExistingDocuments(mapDocumentsByType(p.documents));
    setDraftSaved(p.status === 'draft');
    setHydrated(true);
  }, [patientData, isEdit]);

  useEffect(() => {
    if (isEdit) return;
    const cached = loadWizardCache();
    if (cached?.form) {
      setForm({ ...defaultForm(), ...cached.form });
      setStep(cached.step ?? 1);
      setFurthestStep(cached.furthestStep ?? cached.step ?? 1);
    }
    setHydrated(true);
  }, [isEdit]);

  useEffect(() => {
    if (!hydrated || isEdit) return;
    saveWizardCache({
      form,
      step,
      furthestStep,
      pendingMeta: Object.fromEntries(
        Object.entries(pendingDocuments).map(([k, v]) => [k, v?.file?.name ?? null]),
      ),
    });
  }, [form, step, furthestStep, pendingDocuments, hydrated, isEdit]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    touch(key);
  };

  const setNested = (section, key, value) => {
    const path = `${section}.${key}`;
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));
    touch(path);
  };

  const buildPayload = useCallback(
    (status = 'draft') => ({
      ...form,
      status,
      wizardStep: step,
      monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined,
      medical: {
        ...form.medical,
        height: form.medical.height ? Number(form.medical.height) : undefined,
        weight: form.medical.weight ? Number(form.medical.weight) : undefined,
      },
      dateOfBirth: form.dateOfBirth || undefined,
      admissionDate: form.admissionDate || undefined,
      addictions: (form.addictions ?? []).filter((a) => a.substanceType),
      emergencyContacts: (form.emergencyContacts ?? []).filter((c) => c.name?.trim() || c.phone?.trim()),
      consent: {
        ...form.consent,
        signedDate: form.consent.signedDate || undefined,
      },
    }),
    [form, step],
  );

  const uploadPendingDocuments = async (currentId) => {
    const entries = Object.entries(pendingDocuments).filter(([, doc]) => doc?.file);
    for (const [type, doc] of entries) {
      const fd = new FormData();
      fd.append('file', doc.file);
      fd.append('type', type);
      await uploadDocument({ id: currentId, formData: fd }).unwrap();
    }
    if (entries.length) {
      setPendingDocuments((prev) => {
        Object.values(prev).forEach((d) => {
          if (d?.previewUrl) URL.revokeObjectURL(d.previewUrl);
        });
        return {};
      });
    }
  };

  const persistToServer = async (status = 'draft') => {
    const payload = buildPayload(status);
    let currentId = patientId;

    if (currentId) {
      await updatePatient({ id: currentId, ...payload }).unwrap();
    } else {
      const res = await createPatient(payload).unwrap();
      currentId = res.data.patient.id;
      setPatientId(currentId);
    }

    await uploadPendingDocuments(currentId);
    setDraftSaved(true);
    return currentId;
  };

  const showStepErrors = (errors, stepNum) => {
    touchStep(stepNum);
    const messages = Object.values(errors);
    toast.error(messages[0] ?? t('validation.completeFields'));
    setStep(stepNum);
  };

  const handleNext = () => {
    const errors = validateWizardStep(step, form, t);
    if (Object.keys(errors).length) {
      showStepErrors(errors, step);
      return;
    }
    setFurthestStep((f) => Math.max(f, step));
    setStep((s) => Math.min(s + 1, WIZARD_STEPS));
  };

  const handlePrevious = () => setStep((s) => Math.max(s - 1, 1));

  const handleStepClick = (target) => {
    if (target === step) return;

    if (target < step) {
      setStep(target);
      return;
    }

    if (target > furthestStep + 1 && !draftSaved) {
      toast.error(t('validation.completePreviousSteps'));
      return;
    }

    for (let s = step; s < target; s += 1) {
      const errors = validateWizardStep(s, form, t);
      if (Object.keys(errors).length) {
        showStepErrors(errors, s);
        return;
      }
    }

    setFurthestStep((f) => Math.max(f, target - 1));
    setStep(target);
  };

  const handleSaveDraft = async () => {
    try {
      const idSaved = await persistToServer('draft');
      clearWizardCache();
      toast.success(t('messages.draftSaved'));
      navigate(ROUTES.PATIENT_DETAIL.replace(':id', idSaved));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleSubmit = async () => {
    touchAll();
    const firstErrorStep = validation.getFirstErrorStep();
    if (firstErrorStep) {
      setStep(firstErrorStep);
      const errs = Object.values(validation.allSubmitErrors);
      toast.error(errs[0] ?? t('validation.completeFields'));
      return;
    }

    try {
      const idSaved = await persistToServer('draft');
      await submitPatient(idSaved).unwrap();
      clearWizardCache();
      toast.success(t('messages.submitted'));
      navigate(ROUTES.PATIENT_DETAIL.replace(':id', idSaved));
    } catch (err) {
      const details = err?.data?.details;
      if (Array.isArray(details)) toast.error(details.join(', '));
      else toast.error(getApiErrorMessage(err));
    }
  };

  const handleCancel = () => {
    if (!isEdit && window.confirm(t('review.discardConfirm'))) {
      clearWizardCache();
    }
    navigate(ROUTES.PATIENTS);
  };

  const onDocumentChange = (type, file, error) => {
    setPendingDocuments((prev) => {
      if (prev[type]?.previewUrl) URL.revokeObjectURL(prev[type].previewUrl);
      const previewUrl = file?.type?.startsWith('image/') ? URL.createObjectURL(file) : null;
      return {
        ...prev,
        [type]: { file, previewUrl, error: error || '' },
      };
    });
  };

  const onDocumentRemove = (type) => {
    setPendingDocuments((prev) => {
      const next = { ...prev };
      if (next[type]?.previewUrl) URL.revokeObjectURL(next[type].previewUrl);
      delete next[type];
      return next;
    });
    touch(`documents.${type}`);
  };

  if ((isEdit && loadingPatient) || !hydrated) {
    return <div className="py-20 text-center text-ios-secondary">{tc('loading')}</div>;
  }

  const onReviewStep = step === WIZARD_STEPS;

  return (
    <>
      <PageMeta title={t('wizardTitle')} />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="ios-page-title">{t('wizardTitle')}</h1>
          <p className="mt-1 text-[15px] text-ios-secondary">{t('moduleSubtitle')}</p>
        </div>
        <Button variant="secondary" onClick={handleCancel}>
          {tc('cancel')}
        </Button>
      </div>

      <div className="rounded-ios-lg bg-ios-card p-4 shadow-ios sm:p-6 lg:p-8">
        {!isEdit && !onReviewStep && (
          <p className="mb-5 rounded-ios bg-ios-bg px-4 py-3 text-[13px] leading-relaxed text-ios-secondary">
            {t('review.localCacheHint')}
          </p>
        )}

        <WizardProgress
          steps={WIZARD_STEPS}
          currentStep={step}
          labels={stepLabels}
          furthestStep={draftSaved ? WIZARD_STEPS : furthestStep}
          stepsWithErrors={stepsWithErrors}
          onStepClick={handleStepClick}
        />

        <div className="min-h-[320px] w-full space-y-4">
          {step === 1 && <BasicInfoStep form={form} setField={setField} v={v} />}
          {step === 2 && <AddressStep form={form} setField={setField} v={v} />}
          {step === 3 && <GuardianStep form={form} setNested={setNested} v={v} />}
          {step === 4 && (
            <EmergencyContactsStep
              form={form}
              setField={setField}
              emptyContact={emptyContact}
              v={v}
            />
          )}
          {step === 5 && <AdmissionStep form={form} setField={setField} setNested={setNested} v={v} />}
          {step === 6 && <MedicalStep form={form} setNested={setNested} setField={setField} t={t} />}
          {step === 7 && (
            <SubstanceStep form={form} setField={setField} emptyAddiction={emptyAddiction} t={t} />
          )}
          {step === 8 && (
            <DocumentsUploadStep
              pendingDocuments={pendingDocuments}
              existingDocuments={existingDocuments}
              onDocumentChange={onDocumentChange}
              onDocumentRemove={onDocumentRemove}
              getFieldError={getFieldError}
              touch={touch}
            />
          )}
          {step === 9 && <ConsentStep form={form} setNested={setNested} v={v} />}
          {onReviewStep && (
            <PatientReviewStep
              form={form}
              pendingDocuments={pendingDocuments}
              existingDocuments={existingDocuments}
            />
          )}
        </div>

        <div className="sticky bottom-0 mt-8 flex flex-wrap gap-3 border-t border-ios-separator/30 bg-ios-card pt-4">
          <Button variant="secondary" disabled={step <= 1} onClick={handlePrevious}>
            {tc('previous')}
          </Button>

          {!onReviewStep ? (
            <Button onClick={handleNext} className="ml-auto">
              {tc('next')}
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleSaveDraft} isLoading={isSaving}>
                {t('saveDraft')}
              </Button>
              <Button onClick={handleSubmit} isLoading={isSaving} className="ml-auto">
                {t('reviewSubmitAdmission')}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
