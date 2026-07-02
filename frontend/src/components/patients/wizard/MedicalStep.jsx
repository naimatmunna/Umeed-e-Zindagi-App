import { EXISTING_DISEASES, BLOOD_GROUPS } from '@/constants/patient.js';
import { FormGrid, FormSection } from '@/components/patients/wizard/formLayout.jsx';
import Input from '@/components/ui/Input.jsx';
import Select from '@/components/ui/Select.jsx';

function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-start gap-2 rounded-ios border border-ios-separator/20 px-3 py-2.5">
      <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-ios-blue" checked={checked} onChange={onChange} />
      <span className="whitespace-normal text-[14px] leading-snug text-ios-label">{label}</span>
    </label>
  );
}

export default function MedicalStep({ form, setNested, setField, t }) {
  const toggleDisease = (disease) => {
    const current = form.medical.existingDiseases ?? [];
    const next = current.includes(disease)
      ? current.filter((d) => d !== disease)
      : [...current, disease];
    setNested('medical', 'existingDiseases', next);
  };

  const toggleMental = (key) => {
    setNested('mentalHealth', key, !form.mentalHealth[key]);
  };

  return (
    <div className="space-y-8">
      <FormSection title={t('sections.medical')}>
        <FormGrid>
          <Select label={t('fields.bloodGroup')} value={form.medical.bloodGroup} onChange={(e) => setNested('medical', 'bloodGroup', e.target.value)}>
            {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
          </Select>
          <Input label={t('fields.height')} type="number" value={form.medical.height} onChange={(e) => setNested('medical', 'height', e.target.value)} />
          <Input label={t('fields.weight')} type="number" value={form.medical.weight} onChange={(e) => setNested('medical', 'weight', e.target.value)} />
          <Input label={t('fields.allergies')} value={form.medical.allergies} onChange={(e) => setNested('medical', 'allergies', e.target.value)} />
        </FormGrid>
        <div className="mt-6">
          <p className="mb-3 text-[13px] font-medium text-ios-secondary">{t('fields.existingDiseases')}</p>
          <FormGrid columns={3}>
            {EXISTING_DISEASES.map((d) => (
              <CheckboxField
                key={d}
                label={d.replace(/_/g, ' ')}
                checked={(form.medical.existingDiseases ?? []).includes(d)}
                onChange={() => toggleDisease(d)}
              />
            ))}
          </FormGrid>
        </div>
        <FormGrid className="mt-6">
          <Input className="sm:col-span-2" label={t('fields.currentMedications')} value={form.medical.currentMedications ?? ''} onChange={(e) => setNested('medical', 'currentMedications', e.target.value)} />
          <Input label={t('fields.surgeries')} value={form.medical.surgeries ?? ''} onChange={(e) => setNested('medical', 'surgeries', e.target.value)} />
          <Input label={t('fields.previousHospitalizations')} value={form.medical.previousHospitalizations ?? ''} onChange={(e) => setNested('medical', 'previousHospitalizations', e.target.value)} />
          <Input label={t('fields.disability')} value={form.medical.disability ?? ''} onChange={(e) => setNested('medical', 'disability', e.target.value)} />
          <Input label={t('fields.infectiousDisease')} value={form.medical.infectiousDisease ?? ''} onChange={(e) => setNested('medical', 'infectiousDisease', e.target.value)} />
          <Input className="sm:col-span-2" label={t('fields.medicalNotes')} value={form.medical.medicalNotes ?? ''} onChange={(e) => setNested('medical', 'medicalNotes', e.target.value)} />
        </FormGrid>
      </FormSection>

      <FormSection title={t('sections.mentalHealth')}>
        <FormGrid columns={3}>
          {['depression', 'anxiety', 'aggression', 'suicidalHistory', 'hallucinations', 'selfHarmHistory'].map((key) => (
            <CheckboxField
              key={key}
              label={t(`mental.${key}`)}
              checked={Boolean(form.mentalHealth[key])}
              onChange={() => toggleMental(key)}
            />
          ))}
        </FormGrid>
        <FormGrid className="mt-6">
          <Input label={t('fields.psychiatricTreatment')} value={form.mentalHealth.psychiatricTreatment ?? ''} onChange={(e) => setNested('mentalHealth', 'psychiatricTreatment', e.target.value)} />
          <Input label={t('fields.psychiatricNotes')} value={form.mentalHealth.psychiatricNotes ?? ''} onChange={(e) => setNested('mentalHealth', 'psychiatricNotes', e.target.value)} />
        </FormGrid>
      </FormSection>

      <FormSection title={t('sections.social')}>
        <FormGrid>
          <Input label={t('fields.employmentStatus')} value={form.social.employmentStatus ?? ''} onChange={(e) => setNested('social', 'employmentStatus', e.target.value)} />
          <Input label={t('fields.educationLevel')} value={form.social.educationLevel ?? ''} onChange={(e) => setNested('social', 'educationLevel', e.target.value)} />
          <Input label={t('fields.familySupport')} value={form.social.familySupport ?? ''} onChange={(e) => setNested('social', 'familySupport', e.target.value)} />
          <Input label={t('fields.livingSituation')} value={form.social.livingSituation ?? ''} onChange={(e) => setNested('social', 'livingSituation', e.target.value)} />
          <Input label={t('fields.financialCondition')} value={form.social.financialCondition ?? ''} onChange={(e) => setNested('social', 'financialCondition', e.target.value)} />
          <Input label={t('fields.criminalHistory')} value={form.social.criminalHistory ?? ''} onChange={(e) => setNested('social', 'criminalHistory', e.target.value)} />
          <Input className="sm:col-span-2" label={t('fields.legalCases')} value={form.social.legalCases ?? ''} onChange={(e) => setNested('social', 'legalCases', e.target.value)} />
          <Input className="sm:col-span-2" label={t('fields.socialNotes')} value={form.social.socialNotes ?? ''} onChange={(e) => setNested('social', 'socialNotes', e.target.value)} />
        </FormGrid>
      </FormSection>
    </div>
  );
}
