import { Link } from 'react-router-dom';
import { FiArrowRight, FiActivity } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/constants';
import { formatDate } from '@/helpers/format.js';
import PatientStatusBadge from '@/components/patients/PatientStatusBadge.jsx';

export default function RecentPatients({ patients = [], isLoading }) {
  const { t } = useTranslation('patient');

  if (isLoading) {
    return (
      <Panel title={t('recentPatients')}>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-ios bg-ios-bg" />
          ))}
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title={t('recentPatients')}
      action={
        <Link to={ROUTES.PATIENTS} className="flex items-center gap-1 text-[13px] font-medium text-ios-blue hover:underline">
          {t('allPatients')} <FiArrowRight />
        </Link>
      }
    >
      {!patients.length ? (
        <div className="flex flex-col items-center justify-center rounded-ios bg-ios-bg py-10 text-center">
          <FiActivity className="mb-2 text-3xl text-ios-secondary" />
          <p className="text-[15px] text-ios-secondary">{t('empty')}</p>
          <Link to={ROUTES.PATIENT_NEW} className="mt-3 text-[13px] font-medium text-ios-blue">
            {t('addPatient')}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-ios-separator/30">
          {patients.map((patient) => (
            <li key={patient.id}>
              <Link
                to={ROUTES.PATIENT_DETAIL.replace(':id', patient.id)}
                className="flex items-center gap-3 py-3 transition hover:opacity-80"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ios-blue/10 text-sm font-bold text-ios-blue">
                  {patient.profilePhoto?.url ? (
                    <img src={patient.profilePhoto.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (patient.firstName?.[0] ?? 'P').toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-ios-label">{patient.fullName}</p>
                  <p className="text-[12px] text-ios-secondary">
                    {patient.patientId} · {patient.city ?? '—'} · {formatDate(patient.admissionDate) || '—'}
                  </p>
                </div>
                <PatientStatusBadge status={patient.status} label={t(`status.${patient.status}`)} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Panel({ title, action, children }) {
  return (
    <div className="h-full rounded-ios-lg bg-ios-card p-4 shadow-ios sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[17px] font-semibold text-ios-label">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
