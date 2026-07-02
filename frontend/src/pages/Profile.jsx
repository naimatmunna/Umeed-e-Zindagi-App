import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FiSave, FiShield } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth.js';
import {
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useChangePasswordMutation,
} from '@/features/auth/authApi.js';
import { profileSchema, changePasswordSchema } from '@/schemas/auth.schema.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import { formatDate, formatDateTime, formatCurrency } from '@/helpers/format.js';
import PageMeta from '@/components/common/PageMeta.jsx';
import ProfileAvatarUpload from '@/components/profile/ProfileAvatarUpload.jsx';
import UserAvatar from '@/components/common/UserAvatar.jsx';
import Input from '@/components/ui/Input.jsx';
import Button from '@/components/ui/Button.jsx';
import { FormGrid } from '@/components/patients/wizard/formLayout.jsx';

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-ios-separator/25 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[13px] font-medium text-ios-secondary">{label}</span>
      <span className="text-[15px] font-medium text-ios-label">{value || '—'}</span>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation();
  const [removeAvatar, { isLoading: removing }] = useRemoveAvatarMutation();
  const [changePassword, { isLoading: changingPw }] = useChangePasswordMutation();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
    });
  }, [user, profileForm]);

  const onSaveProfile = async (values) => {
    try {
      await updateProfile(values).unwrap();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const onChangePassword = async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      toast.success('Password changed — please sign in again if prompted');
      passwordForm.reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (!user) return null;

  const displayName = user.fullName ?? `${user.firstName} ${user.lastName}`.trim();

  return (
    <>
      <PageMeta title="My profile" />

      <div className="brand-page-header">
        <div>
          <h1 className="ios-page-title">My profile</h1>
          <p className="ios-page-subtitle">Manage your photo, contact details, and password</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="brand-card p-6">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <ProfileAvatarUpload
              user={user}
              isUploading={uploading || removing}
              onUpload={(file) => uploadAvatar(file).unwrap()}
              onRemove={() => removeAvatar().unwrap()}
            />
            <div className="mt-6 w-full border-t border-ios-separator/30 pt-5">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size="md" />
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-bold text-ios-label">{displayName}</p>
                  <p className="truncate text-[14px] text-ios-secondary">{user.email}</p>
                </div>
              </div>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-forestLight px-3 py-1 text-[12px] font-bold uppercase tracking-wide text-brand-forestDark">
                <FiShield aria-hidden />
                {user.role?.name ?? 'User'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="brand-card p-6 sm:p-8">
            <h2 className="mb-1 font-display text-section-title text-ios-label">Personal information</h2>
            <p className="mb-6 text-[14px] text-ios-secondary">Update how your name and email appear across the app</p>
            <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-5" noValidate>
              <FormGrid>
                <Input
                  label="First name"
                  id="profile-firstName"
                  required
                  showRequiredLabel
                  error={profileForm.formState.errors.firstName?.message}
                  {...profileForm.register('firstName')}
                />
                <Input
                  label="Last name"
                  id="profile-lastName"
                  required
                  showRequiredLabel
                  error={profileForm.formState.errors.lastName?.message}
                  {...profileForm.register('lastName')}
                />
              </FormGrid>
              <Input
                label="Email address"
                type="email"
                id="profile-email"
                required
                showRequiredLabel
                hint="Used for login and notifications"
                error={profileForm.formState.errors.email?.message}
                {...profileForm.register('email')}
              />
              <div className="flex justify-end">
                <Button type="submit" isLoading={saving}>
                  <FiSave aria-hidden /> Save changes
                </Button>
              </div>
            </form>
          </section>

          <section className="brand-card p-6 sm:p-8">
            <h2 className="mb-1 font-display text-section-title text-ios-label">Account details</h2>
            <p className="mb-4 text-[14px] text-ios-secondary">Read-only information managed by your administrator</p>
            <InfoRow label="Role" value={user.role?.name} />
            <InfoRow label="Salary" value={user.salary != null ? formatCurrency(user.salary) : '—'} />
            <InfoRow label="Joining date" value={formatDate(user.joiningDate)} />
            <InfoRow label="Email verified" value={user.isEmailVerified ? 'Yes' : 'No'} />
            <InfoRow label="Last login" value={formatDateTime(user.lastLoginAt)} />
          </section>

          <section className="brand-card p-6 sm:p-8">
            <h2 className="mb-1 font-display text-section-title text-ios-label">Change password</h2>
            <p className="mb-6 text-[14px] text-ios-secondary">Choose a strong password you do not use elsewhere</p>
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4" noValidate>
              <Input
                label="Current password"
                type="password"
                id="currentPassword"
                autoComplete="current-password"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register('currentPassword')}
              />
              <FormGrid>
                <Input
                  label="New password"
                  type="password"
                  id="newPassword"
                  autoComplete="new-password"
                  error={passwordForm.formState.errors.newPassword?.message}
                  {...passwordForm.register('newPassword')}
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  id="confirmNewPassword"
                  autoComplete="new-password"
                  error={passwordForm.formState.errors.confirmPassword?.message}
                  {...passwordForm.register('confirmPassword')}
                />
              </FormGrid>
              <div className="flex justify-end">
                <Button type="submit" variant="secondary" isLoading={changingPw}>
                  Update password
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
