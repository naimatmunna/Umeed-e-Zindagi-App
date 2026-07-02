import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { loginSchema } from '@/schemas/auth.schema.js';
import { useLoginMutation } from '@/features/auth/authApi.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import { ROUTES } from '@/constants';
import Input from '@/components/ui/Input.jsx';
import Button from '@/components/ui/Button.jsx';
import PageMeta from '@/components/common/PageMeta.jsx';
import AuthShell, { AuthLink } from '@/components/auth/AuthShell.jsx';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const onSubmit = async (values) => {
    try {
      await login(values).unwrap();
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <>
      <PageMeta title="Sign in" />
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to your Umeed-e-Zindagi workspace"
        footer={
          <p className="text-center text-[15px] text-ios-secondary">
            New here? <AuthLink to={ROUTES.REGISTER}>Create an account</AuthLink>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            label="Email address"
            type="email"
            id="email"
            autoComplete="email"
            placeholder="you@example.com"
            hint="Use the email registered with your account"
            error={errors.email?.message}
            {...register('email')}
          />
          <div>
            <Input
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="mt-2 text-right">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-[14px] font-semibold text-brand-forest hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
            <FiLock aria-hidden /> Sign in
          </Button>
        </form>
        <div className="mt-6 flex items-center gap-3 rounded-ios-lg bg-brand-forestLight/50 px-4 py-3 text-[13px] text-ios-secondary">
          <FiMail className="shrink-0 text-brand-forest" aria-hidden />
          <span>Your session is secured with encrypted authentication.</span>
        </div>
      </AuthShell>
    </>
  );
}
