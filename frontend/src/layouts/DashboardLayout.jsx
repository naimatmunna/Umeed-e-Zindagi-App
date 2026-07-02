import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiHome,
  FiUser,
  FiLogOut,
  FiShield,
  FiDollarSign,
  FiTag,
  FiClock,
  FiSettings,
  FiActivity,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ROUTES, ROLES } from '@/constants';
import { useAuth } from '@/hooks/useAuth.js';
import { usePermissions } from '@/hooks/usePermissions.js';
import { useLogoutMutation } from '@/features/auth/authApi.js';
import { cn } from '@/lib/classNames.js';
import Logo from '@/components/common/Logo.jsx';
import UserAvatar from '@/components/common/UserAvatar.jsx';
import LiveClock from '@/components/dashboard/LiveClock.jsx';

const nav = [
  { to: ROUTES.DASHBOARD, label: 'Overview', icon: FiHome, end: true },
  { to: ROUTES.PATIENTS, label: 'Patients', icon: FiActivity, staffOnly: true },
  { to: ROUTES.ATTENDANCE, label: 'Attendance', icon: FiClock },
  { to: ROUTES.EXPENSES, label: 'Expenses', icon: FiDollarSign },
  { to: ROUTES.USERS, label: 'Users', icon: FiUsers, adminOnly: true },
  { to: ROUTES.ROLES, label: 'Roles', icon: FiShield, adminOnly: true },
  { to: ROUTES.CATEGORIES, label: 'Categories', icon: FiTag, adminOnly: true },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: FiSettings },
  { to: ROUTES.PROFILE, label: 'Profile', icon: FiUser },
];

export default function DashboardLayout() {
  const { user } = useAuth();
  const { isAdmin, hasRole } = usePermissions();
  const isStaff = isAdmin || hasRole(ROLES.MANAGER);
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout().unwrap().catch(() => {});
    toast.success('Signed out');
    navigate(ROUTES.LOGIN);
  };

  const displayName = user?.fullName ?? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  const visibleNav = nav.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.staffOnly && !isStaff) return false;
    return true;
  });

  return (
    <div className="flex h-dvh overflow-hidden bg-ios-bg">
      <aside className="sticky top-0 hidden h-dvh w-[17.5rem] shrink-0 flex-col border-r border-ios-separator/50 bg-ios-card md:flex">
        <div className="flex h-full flex-col overflow-y-auto p-5">
          <Link to={ROUTES.DASHBOARD} className="mb-8 block shrink-0">
            <Logo size="sm" />
          </Link>

          <nav className="flex-1 space-y-1">
            {visibleNav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn('ios-nav-link', isActive && 'ios-nav-link-active')
                }
              >
                <Icon className="text-lg shrink-0" aria-hidden />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 shrink-0 rounded-ios-lg border border-ios-separator/40 bg-brand-forestLight/50 p-4">
            <Link to={ROUTES.PROFILE} className="flex items-center gap-3 transition hover:opacity-90">
              <UserAvatar user={user} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ios-label">{displayName}</p>
                <p className="truncate text-[12px] text-ios-secondary">{user?.role?.name ?? user?.email}</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 shrink-0 border-b border-ios-separator/50 bg-ios-card/95 backdrop-blur-md">
          <div className="h-1 w-full bg-gradient-to-r from-brand-forest via-brand-lime to-brand-heart" aria-hidden />
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link to={ROUTES.DASHBOARD} className="shrink-0 md:hidden">
              <Logo size="sm" showName={false} />
            </Link>

            <div className="hidden min-w-0 flex-1 md:block">
              <LiveClock variant="compact" />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-3">
              <Link
                to={ROUTES.PROFILE}
                className="hidden items-center gap-2 rounded-ios-lg border border-ios-separator/40 bg-ios-bg/60 px-3 py-1.5 transition hover:bg-brand-forestLight/60 lg:flex"
              >
                <UserAvatar user={user} size="xs" ring={false} />
                <span className="max-w-[140px] truncate text-[14px] font-medium text-ios-label">{displayName}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[44px] items-center gap-1.5 rounded-ios px-3 text-[14px] font-semibold text-brand-heart transition hover:bg-brand-heart/8"
              >
                <FiLogOut aria-hidden /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-ios-separator/50 bg-ios-card/98 backdrop-blur-md md:hidden">
          <div className="flex justify-around px-1 py-1">
            {visibleNav.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[52px] min-w-[52px] flex-col items-center justify-center gap-0.5 rounded-ios px-1 text-[10px] font-semibold',
                    isActive ? 'text-brand-forest' : 'text-ios-secondary',
                  )
                }
              >
                <Icon className="text-xl" aria-hidden />
                <span className="max-w-[56px] truncate">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
