import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { registerSchema } from '@/schemas/auth.schema.js';
import { useRegisterMutation } from '@/features/auth/authApi.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import { ROUTES } from '@/constants';
import Input from '@/components/ui/Input.jsx';
import Button from '@/components/ui/Button.jsx';
import PageMeta from '@/components/common/PageMeta.jsx';
import AuthShell, { AuthLink } from '@/components/auth/AuthShell.jsx';
import { FormGrid } from '@/components/patients/wizard/formLayout.jsx';

function PasswordHints({ password = '' }) {
  const rules = useMemo(
    () => [
      { ok: password.length >= 8, label: 'At least 8 characters' },
      { ok: /[A-Z]/.test(password), label: 'One uppercase letter' },
      { ok: /[a-z]/.test(password), label: 'One lowercase letter' },
      { ok: /[0-9]/.test(password), label: 'One number' },
    ],
    [password],
  );

  return (
    <ul className="grid gap-1 text-[12px]">
      {rules.map((r) => (
        <li key={r.label} className={r.ok ? 'text-brand-forest' : 'text-ios-secondary'}>
          {r.ok ? '✓' : '○'} {r.label}
        </li>
      ))}
    </ul>
  );
}

export default function Register() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const [registerUser, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const onSubmit = async ({ confirmPassword: _c, ...values }) => {
    try {
      await registerUser(values).unwrap();
      toast.success('Account created — please sign in');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <>
      <PageMeta title="Create account" />
      <AuthShell
        wide
        title="Create your account"
        subtitle="Join the Umeed-e-Zindagi platform — staff accounts may require admin approval"
        footer={
          <p className="text-center text-[15px] text-ios-secondary">
            Already registered? <AuthLink to={ROUTES.LOGIN}>Sign in</AuthLink>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormGrid>
            <Input
              label="First name"
              id="firstName"
              autoComplete="given-name"
              required
              showRequiredLabel
              placeholder="Ali"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last name"
              id="lastName"
              autoComplete="family-name"
              required
              showRequiredLabel
              placeholder="Khan"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </FormGrid>
          <Input
            label="Email address"
            type="email"
            id="email"
            autoComplete="email"
            required
            showRequiredLabel
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                required
                showRequiredLabel
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="mt-2 rounded-ios bg-ios-bg px-3 py-2">
                <PasswordHints password={password} />
              </div>
            </div>
            <Input
              label="Confirm password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              required
              showRequiredLabel
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
          <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
            <FiUserPlus aria-hidden /> Create account
          </Button>
        </form>
      </AuthShell>
    </>
  );
}
