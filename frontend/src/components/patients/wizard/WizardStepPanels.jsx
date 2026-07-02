import { ADMISSION_TYPES, GENDERS, MARITAL_STATUSES, formatLabel } from '@/constants/patient.js';
import { formatCnicInput, formatPhoneInput, PAKISTAN_PROVINCES } from './wizardValidation.js';
import { FormGrid } from '@/components/patients/wizard/formLayout.jsx';
import Input from '@/components/ui/Input.jsx';
import Select from '@/components/ui/Select.jsx';
import SearchableSelect from '@/components/ui/SearchableSelect.jsx';
import Button from '@/components/ui/Button.jsx';

const fieldProps = (v, path, { getFieldError, touch, onBlurValidate }) => ({
  error: getFieldError(path),
  onBlur: () => {
    touch(path);
    onBlurValidate?.(path);
  },
});

export function BasicInfoStep({ form, setField, v }) {
  const { t, getFieldError, touch } = v;
  const fp = (path) => fieldProps(v, path, v);

  return (
    <FormGrid>
      <Input
        label={t('fields.firstName')}
        value={form.firstName}
        required
        showRequiredLabel
        maxLength={80}
        hint={t('hints.firstName')}
        placeholder={t('placeholders.firstName')}
        autoComplete="given-name"
        onChange={(e) => setField('firstName', e.target.value)}
        onBlur={fp('firstName').onBlur}
        error={getFieldError('firstName')}
      />
      <Input
        label={t('fields.middleName')}
        value={form.middleName}
        maxLength={80}
        autoComplete="additional-name"
        onChange={(e) => setField('middleName', e.target.value)}
      />
      <Input
        label={t('fields.lastName')}
        value={form.lastName}
        maxLength={80}
        hint={t('hints.lastName')}
        placeholder={t('placeholders.lastName')}
        autoComplete="family-name"
        onChange={(e) => setField('lastName', e.target.value)}
      />
      <Select
        label={t('fields.gender')}
        value={form.gender}
        required
        showRequiredLabel
        hint={t('hints.gender')}
        onChange={(e) => {
          setField('gender', e.target.value);
          touch('gender');
        }}
        onBlur={fp('gender').onBlur}
        error={getFieldError('gender')}
      >
        <option value="">{t('placeholders.select')}</option>
        {GENDERS.map((g) => (
          <option key={g} value={g}>
            {formatLabel(g)}
          </option>
        ))}
      </Select>
      <Input
        type="date"
        label={t('fields.dateOfBirth')}
        value={form.dateOfBirth}
        hint={t('hints.dateOfBirth')}
        max={new Date().toISOString().slice(0, 10)}
        onChange={(e) => setField('dateOfBirth', e.target.value)}
      />
      <Input
        label={t('fields.cnic')}
        value={form.cnic}
        hint={t('hints.cnic')}
        placeholder={t('placeholders.cnic')}
        inputMode="numeric"
        onChange={(e) => setField('cnic', formatCnicInput(e.target.value))}
        onBlur={fp('cnic').onBlur}
        error={getFieldError('cnic')}
      />
      <Input
        label={t('fields.phone')}
        value={form.phone}
        required
        showRequiredLabel
        hint={t('hints.phone')}
        placeholder={t('placeholders.phone')}
        inputMode="tel"
        autoComplete="tel"
        onChange={(e) => setField('phone', formatPhoneInput(e.target.value))}
        onBlur={fp('phone').onBlur}
        error={getFieldError('phone')}
      />
      <Input
        label={t('fields.alternatePhone')}
        value={form.alternatePhone}
        hint={t('hints.phone')}
        placeholder={t('placeholders.phone')}
        inputMode="tel"
        onChange={(e) => setField('alternatePhone', formatPhoneInput(e.target.value))}
      />
      <Input
        label={t('fields.email')}
        type="email"
        value={form.email}
        hint={t('hints.email')}
        placeholder={t('placeholders.email')}
        autoComplete="email"
        onChange={(e) => setField('email', e.target.value)}
        onBlur={fp('email').onBlur}
        error={getFieldError('email')}
      />
      <Select
        label={t('fields.maritalStatus')}
        value={form.maritalStatus}
        onChange={(e) => setField('maritalStatus', e.target.value)}
      >
        <option value="">{t('placeholders.select')}</option>
        {MARITAL_STATUSES.map((m) => (
          <option key={m} value={m}>
            {formatLabel(m)}
          </option>
        ))}
      </Select>
      <Input
        label={t('fields.nationality')}
        value={form.nationality}
        hint={t('hints.nationality')}
        onChange={(e) => setField('nationality', e.target.value)}
      />
      <Input
        label={t('fields.occupation')}
        value={form.occupation}
        maxLength={120}
        placeholder={t('placeholders.occupation')}
        onChange={(e) => setField('occupation', e.target.value)}
      />
    </FormGrid>
  );
}

export function AddressStep({ form, setField, v }) {
  const { t, getFieldError, touch } = v;
  const provinceOptions = PAKISTAN_PROVINCES.map((p) => ({ value: p, label: p }));

  return (
    <FormGrid>
      <Input
        className="sm:col-span-2"
        label={t('fields.currentAddress')}
        value={form.currentAddress}
        required
        showRequiredLabel
        maxLength={300}
        hint={t('hints.address')}
        placeholder={t('placeholders.address')}
        autoComplete="street-address"
        onChange={(e) => setField('currentAddress', e.target.value)}
        onBlur={() => touch('currentAddress')}
        error={getFieldError('currentAddress')}
      />
      <Input
        className="sm:col-span-2"
        label={t('fields.permanentAddress')}
        value={form.permanentAddress}
        maxLength={300}
        hint={t('hints.permanentAddress')}
        placeholder={t('placeholders.address')}
        onChange={(e) => setField('permanentAddress', e.target.value)}
      />
      <Input
        label={t('fields.city')}
        value={form.city}
        required
        showRequiredLabel
        maxLength={80}
        placeholder={t('placeholders.city')}
        autoComplete="address-level2"
        onChange={(e) => setField('city', e.target.value)}
        onBlur={() => touch('city')}
        error={getFieldError('city')}
      />
      <SearchableSelect
        label={t('fields.province')}
        value={form.province}
        onChange={(val) => setField('province', val)}
        options={provinceOptions}
        placeholder={t('placeholders.province')}
        hint={t('hints.province')}
        allowCustom
      />
      <Input
        label={t('fields.postalCode')}
        value={form.postalCode}
        maxLength={10}
        placeholder={t('placeholders.postalCode')}
        inputMode="numeric"
        autoComplete="postal-code"
        onChange={(e) => setField('postalCode', e.target.value.replace(/\D/g, '').slice(0, 10))}
      />
    </FormGrid>
  );
}

export function GuardianStep({ form, setNested, v }) {
  const { t, getFieldError, touch } = v;

  return (
    <FormGrid>
      <Input
        label={t('fields.guardianName')}
        value={form.guardian.guardianName}
        required
        showRequiredLabel
        maxLength={120}
        hint={t('hints.guardianName')}
        onChange={(e) => setNested('guardian', 'guardianName', e.target.value)}
        onBlur={() => touch('guardian.guardianName')}
        error={getFieldError('guardian.guardianName')}
      />
      <Input
        label={t('fields.relationship')}
        value={form.guardian.relationship}
        placeholder={t('placeholders.relationship')}
        onChange={(e) => setNested('guardian', 'relationship', e.target.value)}
      />
      <Input
        label={t('fields.phone')}
        value={form.guardian.phone}
        required
        showRequiredLabel
        hint={t('hints.phone')}
        placeholder={t('placeholders.phone')}
        inputMode="tel"
        onChange={(e) => setNested('guardian', 'phone', formatPhoneInput(e.target.value))}
        onBlur={() => touch('guardian.phone')}
        error={getFieldError('guardian.phone')}
      />
      <Input
        label={t('fields.cnic')}
        value={form.guardian.cnic}
        hint={t('hints.cnic')}
        placeholder={t('placeholders.cnic')}
        onChange={(e) => setNested('guardian', 'cnic', formatCnicInput(e.target.value))}
        onBlur={() => touch('guardian.cnic')}
        error={getFieldError('guardian.cnic')}
      />
      <Input
        className="sm:col-span-2"
        label={t('fields.currentAddress')}
        value={form.guardian.address}
        maxLength={300}
        placeholder={t('placeholders.address')}
        onChange={(e) => setNested('guardian', 'address', e.target.value)}
      />
    </FormGrid>
  );
}

export function EmergencyContactsStep({ form, setField, emptyContact, v }) {
  const { t, getFieldError, touch } = v;

  const updateContact = (i, key, value) => {
    const list = [...form.emergencyContacts];
    list[i] = { ...list[i], [key]: value };
    setField('emergencyContacts', list);
  };

  return (
    <div className="space-y-5">
      <p className="text-[13px] leading-relaxed text-ios-secondary">{t('hints.emergencyContact')}</p>
      {form.emergencyContacts.map((c, i) => (
        <div
          key={i}
          className="rounded-ios-lg border border-ios-separator/30 bg-ios-bg/30 p-4 sm:p-5"
        >
          <p className="mb-4 text-[14px] font-semibold leading-snug text-ios-label">
            {i === 0 ? t('documents.primaryContact') : `${t('fields.firstName')} ${i + 1}`}
            {i === 0 && (
              <span className="ml-2 rounded-full bg-ios-red/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-ios-red">
                {t('documents.required')}
              </span>
            )}
          </p>
          <FormGrid>
            <Input
              label={t('fields.firstName')}
              value={c.name}
              required={i === 0}
              showRequiredLabel={i === 0}
              onChange={(e) => updateContact(i, 'name', e.target.value)}
              onBlur={() => touch(`emergencyContacts.${i}.name`)}
              error={getFieldError(`emergencyContacts.${i}.name`)}
            />
            <Input
              label={t('fields.relationship')}
              value={c.relationship}
              placeholder={t('placeholders.relationship')}
              onChange={(e) => updateContact(i, 'relationship', e.target.value)}
            />
            <Input
              className="sm:col-span-2"
              label={t('fields.phone')}
              value={c.phone}
              required={i === 0}
              showRequiredLabel={i === 0}
              hint={t('hints.phone')}
              placeholder={t('placeholders.phone')}
              inputMode="tel"
              onChange={(e) => updateContact(i, 'phone', formatPhoneInput(e.target.value))}
              onBlur={() => touch(`emergencyContacts.${i}.phone`)}
              error={getFieldError(`emergencyContacts.${i}.phone`)}
            />
          </FormGrid>
        </div>
      ))}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setField('emergencyContacts', [...form.emergencyContacts, emptyContact()])}
      >
        + {t('actions.addContact')}
      </Button>
    </div>
  );
}

export function AdmissionStep({ form, setField, setNested, v }) {
  const { t, getFieldError, touch } = v;
  const doctorOptions = (v.doctorSuggestions ?? []).map((d) => ({ value: d, label: d }));

  return (
    <FormGrid>
      <Input
        type="date"
        label={t('fields.admissionDate')}
        value={form.admissionDate}
        required
        showRequiredLabel
        onChange={(e) => setField('admissionDate', e.target.value)}
        onBlur={() => touch('admissionDate')}
        error={getFieldError('admissionDate')}
      />
      <Select
        label={t('fields.admissionType')}
        value={form.admission.admissionType}
        hint={t('hints.admissionType')}
        onChange={(e) => setNested('admission', 'admissionType', e.target.value)}
      >
        {ADMISSION_TYPES.map((a) => (
          <option key={a} value={a}>
            {formatLabel(a)}
          </option>
        ))}
      </Select>
      <SearchableSelect
        className="sm:col-span-2"
        label={t('fields.doctorName')}
        value={form.admission.doctorName}
        onChange={(val) => setNested('admission', 'doctorName', val)}
        options={doctorOptions}
        placeholder={t('placeholders.doctorName')}
        hint={t('hints.doctorName')}
        required
        showRequiredLabel
        allowCustom
        error={getFieldError('admission.doctorName')}
      />
      <Input
        className="sm:col-span-2"
        label={t('fields.reasonForAdmission')}
        value={form.admission.reasonForAdmission}
        maxLength={500}
        hint={t('hints.reasonForAdmission')}
        onChange={(e) => setNested('admission', 'reasonForAdmission', e.target.value)}
      />
      <Input
        className="sm:col-span-2"
        label={t('fields.chiefComplaint')}
        value={form.admission.chiefComplaint}
        maxLength={500}
        onChange={(e) => setNested('admission', 'chiefComplaint', e.target.value)}
      />
    </FormGrid>
  );
}

export function ConsentStep({ form, setNested, v }) {
  const { t, getFieldError, touch } = v;

  const consentItems = [
    { key: 'patientConsent', label: t('consent.patientConsent'), required: false },
    { key: 'guardianConsent', label: t('consent.guardianConsent'), required: false },
    { key: 'treatmentAgreement', label: t('consent.treatmentAgreement'), required: true },
    { key: 'hospitalRulesAgreement', label: t('consent.hospitalRules'), required: true },
    { key: 'privacyAgreement', label: t('consent.privacyAgreement'), required: true },
    { key: 'emergencyTreatmentPermission', label: t('consent.emergencyTreatment'), required: false },
    { key: 'dataProcessingConsent', label: t('consent.dataProcessing'), required: false },
  ];

  const consentGroupError = getFieldError('consent.patientOrGuardian');

  return (
    <div className="space-y-5">
      <p className="text-[13px] leading-relaxed text-ios-secondary">{t('hints.consent')}</p>
      {consentGroupError && (
        <p className="rounded-ios bg-ios-red/8 px-3 py-2 text-[13px] leading-snug text-ios-red" role="alert">
          {consentGroupError}
        </p>
      )}
      <div className="space-y-3">
        {consentItems.map(({ key, label, required }) => {
          const path = `consent.${key}`;
          const error = ['treatmentAgreement', 'hospitalRulesAgreement', 'privacyAgreement'].includes(key)
            ? getFieldError(path)
            : '';
          return (
            <label
              key={key}
              className={`flex min-h-[48px] cursor-pointer items-start gap-3 rounded-ios border px-4 py-3 ${
                error ? 'border-ios-red bg-ios-red/5' : 'border-ios-separator/30'
              }`}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 accent-ios-blue"
                checked={Boolean(form.consent[key])}
                onChange={(e) => {
                  setNested('consent', key, e.target.checked);
                  touch(path);
                  if (key === 'patientConsent' || key === 'guardianConsent') touch('consent.patientOrGuardian');
                }}
                onBlur={() => touch(path)}
              />
              <span className="flex-1 whitespace-normal text-[15px] leading-snug text-ios-label">
                {label}
                {required && <span className="ml-1 text-ios-red">*</span>}
              </span>
            </label>
          );
        })}
      </div>
      <FormGrid>
        <Input
          label={t('consent.digitalSignature')}
          value={form.consent.digitalSignature}
          maxLength={200}
          hint={t('hints.digitalSignature')}
          placeholder={t('placeholders.digitalSignature')}
          onChange={(e) => setNested('consent', 'digitalSignature', e.target.value)}
        />
        <Input
          type="date"
          label={t('consent.signedDate')}
          value={form.consent.signedDate}
          onChange={(e) => setNested('consent', 'signedDate', e.target.value)}
        />
      </FormGrid>
    </div>
  );
}
