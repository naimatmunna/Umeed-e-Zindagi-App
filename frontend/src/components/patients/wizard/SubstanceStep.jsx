import { FREQUENCIES, ROUTES_OF_USE, SUBSTANCE_TYPES, formatLabel } from '@/constants/patient.js';
import { FormGrid } from '@/components/patients/wizard/formLayout.jsx';
import Select from '@/components/ui/Select.jsx';
import Button from '@/components/ui/Button.jsx';

export function SubstanceStep({ form, setField, emptyAddiction, t }) {
  const update = (i, key, value) => {
    const list = [...form.addictions];
    list[i] = { ...list[i], [key]: value };
    setField('addictions', list);
  };

  return (
    <div className="space-y-5">
      <p className="text-[13px] leading-relaxed text-ios-secondary">{t('hints.substance')}</p>
      {form.addictions.map((a, i) => (
        <div key={i} className="rounded-ios-lg border border-ios-separator/30 bg-ios-bg/30 p-4 sm:p-5">
          <FormGrid columns={3}>
          <Select
            label={t('fields.substanceType')}
            value={a.substanceType}
            onChange={(e) => update(i, 'substanceType', e.target.value)}
          >
            <option value="">{t('placeholders.select')}</option>
            {SUBSTANCE_TYPES.map((s) => (
              <option key={s} value={s}>
                {formatLabel(s)}
              </option>
            ))}
          </Select>
          <Select label={t('fields.frequency')} value={a.frequency} onChange={(e) => update(i, 'frequency', e.target.value)}>
            <option value="">{t('placeholders.select')}</option>
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {formatLabel(f)}
              </option>
            ))}
          </Select>
          <Select label={t('fields.route')} value={a.route} onChange={(e) => update(i, 'route', e.target.value)}>
            <option value="">{t('placeholders.select')}</option>
            {ROUTES_OF_USE.map((r) => (
              <option key={r} value={r}>
                {formatLabel(r)}
              </option>
            ))}
          </Select>
          </FormGrid>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={() => setField('addictions', [...form.addictions, emptyAddiction()])}>
        + {t('actions.addSubstance')}
      </Button>
    </div>
  );
}
