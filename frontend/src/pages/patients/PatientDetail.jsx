import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiEdit2, FiDownload, FiPrinter, FiGlobe } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  useGetPatientQuery,
  useGetPatientTimelineQuery,
  useGetPatientPdfHistoryQuery,
} from '@/features/patients/patientsApi.js';
import { ROUTES } from '@/constants';
import { formatDate, formatDateTime } from '@/helpers/format.js';
import { downloadPatientPdf, printPatientPdf } from '@/lib/downloadPatientPdf.js';
import PageMeta from '@/components/common/PageMeta.jsx';
import PatientStatusBadge from '@/components/patients/PatientStatusBadge.jsx';
import Button from '@/components/ui/Button.jsx';
import { cn } from '@/lib/classNames.js';
import i18n from '@/lib/i18n.js';

const TABS = ['overview', 'admission', 'medical', 'substance', 'guardian', 'emergency', 'social', 'documents', 'timeline', 'pdf'];

function InfoGrid({ items }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ label, value }) => (
        <div key={label} className="rounded-ios border border-ios-separator/20 bg-ios-bg/50 p-3">
          <dt className="text-[12px] font-medium text-ios-secondary">{label}</dt>
          <dd className="mt-1 text-[15px] font-medium text-ios-label">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('patient');
  const [tab, setTab] = useState('overview');
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useGetPatientQuery(id);
  const { data: timelineData } = useGetPatientTimelineQuery({ id }, { skip: tab !== 'timeline' });
  const { data: pdfData } = useGetPatientPdfHistoryQuery(id, { skip: tab !== 'pdf' });

  const patient = data?.data?.patient;
  const timeline = timelineData?.data ?? [];
  const pdfHistory = pdfData?.data ?? [];

  const handlePdf = async (lang, preview = false) => {
    setExporting(true);
    try {
      if (preview) await printPatientPdf({ patientId: id, lang });
      else await downloadPatientPdf({ patientId: id, lang });
      toast.success(t('pdf.download'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return <div className="py-20 text-center text-ios-secondary">Loading…</div>;
  if (!patient) return <div className="py-20 text-center text-ios-secondary">Patient not found</div>;

  const primaryContact = patient.emergencyContacts?.find((c) => c.priority === 'primary') ?? patient.emergencyContacts?.[0];

  return (
    <>
      <PageMeta title={patient.fullName ?? t('patientDetails')} />

      <div className="mb-6 overflow-hidden rounded-ios-lg bg-ios-card shadow-ios">
        <div className="bg-gradient-to-r from-ios-blue/10 to-transparent p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-ios-lg bg-ios-bg text-2xl font-bold text-ios-blue">
                {patient.profilePhoto?.url ? (
                  <img src={patient.profilePhoto.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (patient.firstName?.[0] ?? 'P').toUpperCase()
                )}
              </div>
              <div>
                <PatientStatusBadge status={patient.status} label={t(`status.${patient.status}`)} className="mb-2" />
                <h1 className="text-[28px] font-bold text-ios-label">{patient.fullName}</h1>
                <p className="mt-1 font-mono text-[13px] text-ios-secondary">{patient.patientId} · {patient.admissionNumber}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-[14px] text-ios-secondary">
                  <span>{patient.gender}</span>
                  <span>{patient.age != null ? `${patient.age} yrs` : ''}</span>
                  <span>{patient.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => i18n.changeLanguage(i18n.language === 'ur' ? 'en' : 'ur')}>
                <FiGlobe /> {i18n.language === 'ur' ? 'EN' : 'اردو'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.PATIENT_EDIT.replace(':id', id))}>
                <FiEdit2 /> {t('editPatient')}
              </Button>
              <Button size="sm" isLoading={exporting} onClick={() => handlePdf('en')}>
                <FiDownload /> {t('pdf.download')}
              </Button>
              <Button variant="secondary" size="sm" isLoading={exporting} onClick={() => handlePdf('en', true)}>
                <FiPrinter /> {t('pdf.print')}
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-ios bg-ios-card/80 p-3">
              <p className="text-[12px] text-ios-secondary">Guardian</p>
              <p className="font-medium">{patient.guardian?.guardianName ?? '—'}</p>
            </div>
            <div className="rounded-ios bg-ios-card/80 p-3">
              <p className="text-[12px] text-ios-secondary">Emergency</p>
              <p className="font-medium">{primaryContact?.name ?? '—'} · {primaryContact?.phone ?? ''}</p>
            </div>
            <div className="rounded-ios bg-ios-card/80 p-3">
              <p className="text-[12px] text-ios-secondary">Admission</p>
              <p className="font-medium">{formatDate(patient.admissionDate)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-t border-ios-separator/30 px-2 py-2">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'shrink-0 rounded-ios px-3 py-2 text-[13px] font-medium transition',
                tab === key ? 'bg-ios-blue/10 text-ios-blue' : 'text-ios-secondary hover:bg-ios-bg',
              )}
            >
              {t(`tabs.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-ios-lg bg-ios-card p-5 shadow-ios">
        {tab === 'overview' && (
          <InfoGrid items={[
            { label: t('fields.cnic'), value: patient.cnic },
            { label: t('fields.dateOfBirth'), value: formatDate(patient.dateOfBirth) },
            { label: t('fields.email'), value: patient.email },
            { label: t('fields.city'), value: patient.city },
            { label: t('fields.occupation'), value: patient.occupation },
            { label: t('fields.education'), value: patient.education },
          ]} />
        )}

        {tab === 'admission' && (
          <InfoGrid items={[
            { label: t('fields.admissionType'), value: patient.admission?.admissionType?.replace(/_/g, ' ') },
            { label: t('fields.doctorName'), value: patient.admission?.doctorName },
            { label: t('fields.reasonForAdmission'), value: patient.admission?.reasonForAdmission },
            { label: t('fields.chiefComplaint'), value: patient.admission?.chiefComplaint },
          ]} />
        )}

        {tab === 'medical' && (
          <InfoGrid items={[
            { label: t('fields.bloodGroup'), value: patient.medical?.bloodGroup },
            { label: t('fields.height'), value: patient.medical?.height ? `${patient.medical.height} cm` : null },
            { label: t('fields.weight'), value: patient.medical?.weight ? `${patient.medical.weight} kg` : null },
            { label: 'BMI', value: patient.medical?.bmi },
            { label: t('fields.allergies'), value: patient.medical?.allergies },
            { label: t('fields.existingDiseases'), value: (patient.medical?.existingDiseases ?? []).join(', ') || null },
            { label: t('fields.currentMedications'), value: patient.medical?.currentMedications },
            { label: t('fields.psychiatricTreatment'), value: patient.mentalHealth?.psychiatricTreatment },
          ]} />
        )}

        {tab === 'substance' && (
          <ul className="space-y-2">
            {(patient.addictions ?? []).map((a, i) => (
              <li key={i} className="rounded-ios border border-ios-separator/20 p-3 text-[14px]">
                <span className="font-medium capitalize">{a.substanceType?.replace(/_/g, ' ')}</span>
                {' · '}{a.frequency} · {a.route}
              </li>
            ))}
            {!patient.addictions?.length && <p className="text-ios-secondary">No substance history recorded</p>}
          </ul>
        )}

        {tab === 'guardian' && (
          <InfoGrid items={[
            { label: t('fields.guardianName'), value: patient.guardian?.guardianName },
            { label: t('fields.relationship'), value: patient.guardian?.relationship },
            { label: t('fields.phone'), value: patient.guardian?.phone },
            { label: t('fields.cnic'), value: patient.guardian?.cnic },
          ]} />
        )}

        {tab === 'emergency' && (
          <ul className="space-y-3">
            {(patient.emergencyContacts ?? []).map((c, i) => (
              <li key={i} className="rounded-ios border border-ios-separator/20 p-3">
                <p className="font-medium">{c.name}</p>
                <p className="text-[13px] text-ios-secondary">{c.relationship} · {c.phone} · {c.priority}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === 'social' && (
          <InfoGrid items={[
            { label: t('fields.employmentStatus'), value: patient.social?.employmentStatus },
            { label: t('fields.educationLevel'), value: patient.social?.educationLevel },
            { label: t('fields.familySupport'), value: patient.social?.familySupport },
            { label: t('fields.livingSituation'), value: patient.social?.livingSituation },
            { label: t('fields.financialCondition'), value: patient.social?.financialCondition },
            { label: t('fields.criminalHistory'), value: patient.social?.criminalHistory },
            { label: t('fields.legalCases'), value: patient.social?.legalCases },
            { label: t('fields.socialNotes'), value: patient.social?.socialNotes },
          ]} />
        )}

        {tab === 'documents' && (
          <ul className="space-y-2">
            {(patient.documents ?? []).map((d) => (
              <li key={d.id ?? d._id} className="flex items-center justify-between rounded-ios border border-ios-separator/20 p-3">
                <span className="capitalize text-[14px]">{d.type?.replace(/_/g, ' ')}</span>
                <a href={d.url} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-ios-blue">View</a>
              </li>
            ))}
            {!patient.documents?.length && <p className="text-ios-secondary">No documents uploaded</p>}
          </ul>
        )}

        {tab === 'timeline' && (
          <ul className="space-y-3">
            {timeline.map((ev) => (
              <li key={ev.id} className="flex gap-3 border-l-2 border-ios-blue/30 pl-4">
                <div>
                  <p className="font-medium text-ios-label">{ev.title}</p>
                  <p className="text-[12px] text-ios-secondary">{formatDateTime(ev.createdAt)}</p>
                  {ev.description && <p className="mt-1 text-[13px] text-ios-secondary">{ev.description}</p>}
                </div>
              </li>
            ))}
            {!timeline.length && <p className="text-ios-secondary">No timeline events yet</p>}
          </ul>
        )}

        {tab === 'pdf' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" isLoading={exporting} onClick={() => handlePdf('en')}>
                <FiDownload /> {t('pdf.download')}
              </Button>
              <Button size="sm" variant="secondary" isLoading={exporting} onClick={() => handlePdf('en', true)}>
                <FiPrinter /> {t('pdf.print')}
              </Button>
            </div>
            <ul className="space-y-2">
              {pdfHistory.map((pdf) => (
                <li key={pdf.id} className="flex justify-between rounded-ios bg-ios-bg p-3 text-[13px]">
                  <span>{pdf.fileName ?? pdf.language} · v{pdf.version}</span>
                  <span className="text-ios-secondary">{formatDateTime(pdf.createdAt)}</span>
                </li>
              ))}
              {!pdfHistory.length && <p className="text-ios-secondary">Generate a PDF to see history</p>}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link to={ROUTES.PATIENTS} className="text-[15px] font-medium text-ios-blue hover:underline">
          ← {t('allPatients')}
        </Link>
      </div>
    </>
  );
}
