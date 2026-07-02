import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import { useMeQuery } from '@/features/auth/authApi.js';
import { ROUTES } from '@/constants';
import Spinner from '@/components/ui/Spinner.jsx';

/** Requires authentication; hydrates user from /me on refresh. */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { isLoading } = useMeQuery(undefined, { skip: !isAuthenticated });

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ios-bg">
        <Spinner />
      </div>
    );
  }

  return <Outlet />;
}
