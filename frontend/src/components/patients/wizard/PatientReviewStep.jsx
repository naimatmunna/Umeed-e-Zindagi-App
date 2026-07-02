import { useTranslation } from 'react-i18next';
import { FiCheck, FiX } from 'react-icons/fi';
import { formatLabel } from '@/constants/patient.js';

function Section({ title, children }) {
  return (
    <section className="rounded-ios border border-ios-separator/25 bg-ios-bg/40 p-4">
      <h4 className="mb-3 text-[14px] font-semibold uppercase tracking-wide text-ios-blue">{title}</h4>
      {children}
    </section>
  );
}

function Row({ label, value }) {
  const display = value === undefined || value === null || value === '' ? '—' : String(value);
  return (
    <div className="grid gap-1 border-b border-ios-separator/15 py-2 last:border-0 sm:grid-cols-[180px_1fr]">
      <dt className="text-[13px] text-ios-secondary">{label}</dt>
      <dd className="text-[14px] font-medium text-ios-label">{display}</dd>
    </div>
  );
}

function BoolRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-ios-separator/15 py-2 last:border-0">
      <span className="text-[13px] text-ios-secondary">{label}</span>
      {value ? (
        <FiCheck className="text-lg text-ios-green" aria-label="Yes" />
      ) : (
        <FiX className="text-lg text-ios-secondary" aria-label="No" />
      )}
    </div>
  );
}

export default function PatientReviewStep({ form, pendingDocuments = {}, existingDocuments = {} }) {
  const { t } = useTranslation('patient');
  const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ');

  const mentalFlags = ['depression', 'anxiety', 'aggression', 'suicidalHistory', 'hallucinations', 'selfHarmHistory']
    .filter((k) => form.mentalHealth?.[k])
    .map((k) => t(`mental.${k}`));

  const substances = (form.addictions ?? [])
    .filter((a) => a.substanceType)
    .map((a) => `${formatLabel(a.substanceType)} (${a.frequency || '—'}, ${a.route || '—'})`);

  const documentEntries = [
    ...Object.entries(existingDocuments).map(([type, doc]) => ({
      type,
      name: doc.label || doc.url?.split('/').pop(),
      existing: true,
    })),
    ...Object.entries(pendingDocuments)
      .filter(([, d]) => d?.file)
      .map(([type, d]) => ({ type, name: d.file.name, existing: false })),
  ];

  const uniqueDocs = documentEntries.reduce((acc, item) => {
    if (!acc.find((x) => x.type === item.type)) acc.push(item);
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-ios bg-ios-blue/8 px-4 py-3">
        <p className="text-[15px] font-semibold text-ios-label">{t('review.title')}</p>
        <p className="mt-1 text-[13px] text-ios-secondary">{t('review.subtitle')}</p>
      </div>

      <Section title={t('steps.1')}>
        <dl>
          <Row label={t('fields.firstName')} value={fullName} />
          <Row label={t('fields.gender')} value={formatLabel(form.gender)} />
          <Row label={t('fields.dateOfBirth')} value={form.dateOfBirth} />
          <Row label={t('fields.cnic')} value={form.cnic} />
          <Row label={t('fields.phone')} value={form.phone} />
          <Row label={t('fields.email')} value={form.email} />
          <Row label={t('fields.occupation')} value={form.occupation} />
        </dl>
      </Section>

      <Section title={t('steps.2')}>
        <dl>
          <Row label={t('fields.currentAddress')} value={form.currentAddress} />
          <Row label={t('fields.permanentAddress')} value={form.permanentAddress} />
          <Row label={t('fields.city')} value={form.city} />
          <Row label={t('fields.province')} value={form.province} />
        </dl>
      </Section>

      <Section title={t('steps.3')}>
        <dl>
          <Row label={t('fields.guardianName')} value={form.guardian?.guardianName} />
          <Row label={t('fields.relationship')} value={form.guardian?.relationship} />
          <Row label={t('fields.phone')} value={form.guardian?.phone} />
          <Row label={t('fields.cnic')} value={form.guardian?.cnic} />
        </dl>
      </Section>

      <Section title={t('steps.4')}>
        {(form.emergencyContacts ?? []).map((c, i) => (
          <dl key={i} className={i > 0 ? 'mt-3 border-t border-ios-separator/20 pt-3' : ''}>
            <Row label={t('fields.firstName')} value={c.name} />
            <Row label={t('fields.relationship')} value={c.relationship} />
            <Row label={t('fields.phone')} value={c.phone} />
          </dl>
        ))}
      </Section>

      <Section title={t('steps.5')}>
        <dl>
          <Row label={t('fields.admissionDate')} value={form.admissionDate} />
          <Row label={t('fields.admissionType')} value={formatLabel(form.admission?.admissionType)} />
          <Row label={t('fields.doctorName')} value={form.admission?.doctorName} />
          <Row label={t('fields.reasonForAdmission')} value={form.admission?.reasonForAdmission} />
          <Row label={t('fields.chiefComplaint')} value={form.admission?.chiefComplaint} />
        </dl>
      </Section>

      <Section title={t('steps.6')}>
        <dl>
          <Row label={t('fields.bloodGroup')} value={form.medical?.bloodGroup} />
          <Row label={t('fields.height')} value={form.medical?.height ? `${form.medical.height} cm` : null} />
          <Row label={t('fields.weight')} value={form.medical?.weight ? `${form.medical.weight} kg` : null} />
          <Row label={t('fields.allergies')} value={form.medical?.allergies} />
          <Row
            label={t('fields.existingDiseases')}
            value={(form.medical?.existingDiseases ?? []).map(formatLabel).join(', ')}
          />
          <Row label={t('fields.currentMedications')} value={form.medical?.currentMedications} />
          <Row label={t('sections.mentalHealth')} value={mentalFlags.join(', ') || '—'} />
          <Row label={t('fields.employmentStatus')} value={form.social?.employmentStatus} />
          <Row label={t('fields.familySupport')} value={form.social?.familySupport} />
        </dl>
      </Section>

      <Section title={t('steps.7')}>
        {substances.length ? (
          <ul className="list-inside list-disc space-y-1 text-[14px] text-ios-label">
            {substances.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-ios-secondary">—</p>
        )}
      </Section>

      <Section title={t('steps.8')}>
        {uniqueDocs.length ? (
          <ul className="space-y-2 text-[14px] text-ios-label">
            {uniqueDocs.map((d) => (
              <li key={d.type} className="flex justify-between gap-2 border-b border-ios-separator/15 py-2 last:border-0">
                <span>{t(`documents.types.${d.type}`)}</span>
                <span className="truncate font-medium">{d.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-ios-secondary">{t('review.noDocument')}</p>
        )}
      </Section>

      <Section title={t('steps.9')}>
        <BoolRow label={t('consent.patientConsent')} value={form.consent?.patientConsent} />
        <BoolRow label={t('consent.guardianConsent')} value={form.consent?.guardianConsent} />
        <BoolRow label={t('consent.treatmentAgreement')} value={form.consent?.treatmentAgreement} />
        <BoolRow label={t('consent.hospitalRules')} value={form.consent?.hospitalRulesAgreement} />
        <BoolRow label={t('consent.privacyAgreement')} value={form.consent?.privacyAgreement} />
        <Row label={t('consent.digitalSignature')} value={form.consent?.digitalSignature} />
        <Row label={t('consent.signedDate')} value={form.consent?.signedDate} />
      </Section>
    </div>
  );
}
