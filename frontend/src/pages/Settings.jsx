import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiSettings, FiUsers, FiShield, FiTag, FiDollarSign, FiLock } from 'react-icons/fi';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGetOfficeSettingsQuery, useUpdateOfficeSettingsMutation } from '@/features/settings/settingsApi.js';
import { usePermissions } from '@/hooks/usePermissions.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import { ROUTES } from '@/constants';
import { WEEKDAYS, TIMEZONES } from '@/helpers/attendance.js';
import { config } from '@/config/env.js';
import PageMeta from '@/components/common/PageMeta.jsx';
import Button from '@/components/ui/Button.jsx';
import Input from '@/components/ui/Input.jsx';
import Select from '@/components/ui/Select.jsx';
import { cn } from '@/lib/classNames.js';

const TABS = [
  { id: 'office', label: 'Office', icon: FiClock },
  { id: 'app', label: 'Application', icon: FiSettings },
  { id: 'modules', label: 'Modules', icon: FiDollarSign },
];

function OfficeSettingsForm({ settings, canEdit, onSave, isLoading }) {
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      timezone: settings?.timezone ?? 'Asia/Karachi',
      workStartTime: settings?.workStartTime ?? '09:00',
      workEndTime: settings?.workEndTime ?? '18:00',
      gracePeriodMinutes: settings?.gracePeriodMinutes ?? 15,
      halfDayThresholdHours: settings?.halfDayThresholdHours ?? 4,
      lateThresholdMinutes: settings?.lateThresholdMinutes ?? 15,
      autoMarkAbsent: settings?.autoMarkAbsent ?? true,
      offDays: settings?.offDays ?? [0, 6],
    },
  });

  const offDays = watch('offDays') ?? [];

  useEffect(() => {
    if (settings) {
      reset({
        timezone: settings.timezone ?? 'Asia/Karachi',
        workStartTime: settings.workStartTime ?? '09:00',
        workEndTime: settings.workEndTime ?? '18:00',
        gracePeriodMinutes: settings.gracePeriodMinutes ?? 15,
        halfDayThresholdHours: settings.halfDayThresholdHours ?? 4,
        lateThresholdMinutes: settings.lateThresholdMinutes ?? 15,
        autoMarkAbsent: settings.autoMarkAbsent ?? true,
        offDays: settings.offDays ?? [0, 6],
      });
    }
  }, [settings, reset]);

  const toggleOffDay = (day) => {
    const next = offDays.includes(day)
      ? offDays.filter((d) => d !== day)
      : [...offDays, day].sort();
    setValue('offDays', next);
  };

  return (
    <form onSubmit={handleSubmit((values) => onSave({ ...values, offDays }))} className="space-y-5">
      {!canEdit && (
        <div className="flex items-center gap-2 rounded-ios bg-amber-50 px-4 py-3 text-[14px] text-amber-800">
          <FiLock /> Only Super Admin can edit office settings.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Timezone" id="timezone" disabled={!canEdit} {...register('timezone')}>
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </Select>
        <Input label="Grace period (minutes)" type="number" min="0" disabled={!canEdit} {...register('gracePeriodMinutes')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Check-in time" type="time" disabled={!canEdit} {...register('workStartTime')} />
        <Input label="Check-out time" type="time" disabled={!canEdit} {...register('workEndTime')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Late threshold (min)" type="number" disabled={!canEdit} {...register('lateThresholdMinutes')} />
        <Input label="Half-day threshold (hours)" type="number" step="0.5" disabled={!canEdit} {...register('halfDayThresholdHours')} />
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-ios-secondary">Weekly off days</p>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              disabled={!canEdit}
              onClick={() => toggleOffDay(d.value)}
              className={cn(
                'min-h-[40px] rounded-ios px-3 text-[13px] font-medium transition',
                offDays.includes(d.value)
                  ? 'bg-ios-blue text-white'
                  : 'bg-ios-bg text-ios-secondary hover:bg-black/5',
                !canEdit && 'opacity-60',
              )}
            >
              {d.label.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <label className="flex min-h-[44px] items-center gap-3 text-[15px] text-ios-label">
        <input type="checkbox" disabled={!canEdit} className="h-5 w-5 rounded text-ios-blue" {...register('autoMarkAbsent')} />
        Auto-mark absent on working days without check-in
      </label>

      {canEdit && (
        <Button type="submit" isLoading={isLoading}>Save office settings</Button>
      )}
    </form>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('office');
  const { isAdmin, isSuperAdmin } = usePermissions();
  const { data, isLoading } = useGetOfficeSettingsQuery();
  const [updateOffice, { isLoading: saving }] = useUpdateOfficeSettingsMutation();
  const settings = data?.data?.settings;

  const handleSaveOffice = async (values) => {
    try {
      await updateOffice({
        ...values,
        gracePeriodMinutes: Number(values.gracePeriodMinutes),
        halfDayThresholdHours: Number(values.halfDayThresholdHours),
        lateThresholdMinutes: Number(values.lateThresholdMinutes),
        offDays: values.offDays,
      }).unwrap();
      toast.success('Office settings saved');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const moduleLinks = [
    { to: ROUTES.USERS, label: 'Users', icon: FiUsers, adminOnly: true },
    { to: ROUTES.ROLES, label: 'Roles', icon: FiShield, adminOnly: true },
    { to: ROUTES.CATEGORIES, label: 'Expense categories', icon: FiTag, adminOnly: true },
    { to: ROUTES.EXPENSES, label: 'Expenses', icon: FiDollarSign },
    { to: ROUTES.ATTENDANCE, label: 'Attendance', icon: FiClock },
  ];

  return (
    <>
      <PageMeta title="Settings" />
      <h1 className="ios-page-title mb-2">Settings</h1>
      <p className="mb-6 text-[15px] text-ios-secondary">Manage application and office configuration</p>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex min-h-[44px] shrink-0 items-center gap-2 rounded-ios px-4 text-[15px] font-medium transition',
              tab === id ? 'bg-ios-blue text-white' : 'bg-ios-card text-ios-secondary shadow-ios hover:bg-black/5',
            )}
          >
            <Icon /> {label}
          </button>
        ))}
      </div>

      <div className="ios-grouped p-5 sm:p-6">
        {tab === 'office' && (
          <div>
            <h2 className="mb-4 text-[20px] font-bold text-ios-label">Office & attendance</h2>
            {isLoading ? (
              <div className="h-48 animate-pulse rounded-ios bg-ios-bg" />
            ) : (
              <OfficeSettingsForm
                settings={settings}
                canEdit={isSuperAdmin}
                onSave={handleSaveOffice}
                isLoading={saving}
              />
            )}
          </div>
        )}

        {tab === 'app' && (
          <div>
            <h2 className="mb-4 text-[20px] font-bold text-ios-label">Application</h2>
            <div className="space-y-3">
              <div className="ios-row !border-0 !px-0">
                <span className="text-ios-secondary">App name</span>
                <span className="font-medium">{config.appName}</span>
              </div>
              <div className="ios-row !border-0 !px-0">
                <span className="text-ios-secondary">API URL</span>
                <span className="font-medium text-[13px]">{config.apiUrl}</span>
              </div>
              <div className="ios-row !border-0 !px-0">
                <span className="text-ios-secondary">Theme</span>
                <span className="font-medium">Light (iOS)</span>
              </div>
              <div className="ios-row !border-0 !px-0">
                <span className="text-ios-secondary">Currency</span>
                <span className="font-medium">PKR</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'modules' && (
          <div>
            <h2 className="mb-4 text-[20px] font-bold text-ios-label">Quick links</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {moduleLinks
                .filter((m) => !m.adminOnly || isAdmin)
                .map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex min-h-[52px] items-center gap-3 rounded-ios border border-ios-separator/40 px-4 text-[15px] font-medium text-ios-label transition hover:bg-ios-blue/5 hover:text-ios-blue"
                  >
                    <Icon className="text-lg text-ios-blue" />
                    {label}
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
