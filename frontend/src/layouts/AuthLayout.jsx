import { Link, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ios-bg">
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-forest via-brand-lime to-brand-heart" aria-hidden />
      <main className="flex flex-1 flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mb-4 lg:hidden">
          <Link to={ROUTES.HOME} className="text-[14px] font-semibold text-brand-forest">
            ← Home
          </Link>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
