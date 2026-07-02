import { Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiClock,
  FiSettings,
  FiUsers,
  FiUser,
  FiPlus,
  FiActivity,
} from 'react-icons/fi';
import { ROUTES } from '@/constants';

const actions = [
  {
    to: ROUTES.PATIENT_NEW,
    label: 'Register patient',
    desc: 'New admission wizard',
    icon: FiActivity,
    accent: 'bg-ios-blue/12 text-ios-blue',
    staffOnly: true,
  },
  {
    to: ROUTES.EXPENSES,
    label: 'Add expense',
    desc: 'Log a new transaction',
    icon: FiPlus,
    accent: 'bg-[#FF9500]/12 text-[#FF9500]',
  },
  {
    to: ROUTES.ATTENDANCE,
    label: 'Attendance',
    desc: 'Check in or view records',
    icon: FiClock,
    accent: 'bg-ios-blue/12 text-ios-blue',
  },
  {
    to: ROUTES.EXPENSES,
    label: 'Expense reports',
    desc: 'Charts and PDF export',
    icon: FiDollarSign,
    accent: 'bg-ios-green/12 text-ios-green',
  },
  {
    to: ROUTES.PROFILE,
    label: 'Profile',
    desc: 'Update your account',
    icon: FiUser,
    accent: 'bg-[#AF52DE]/12 text-[#AF52DE]',
  },
  {
    to: ROUTES.SETTINGS,
    label: 'Settings',
    desc: 'Office and app preferences',
    icon: FiSettings,
    accent: 'bg-ios-secondary/12 text-ios-secondary',
  },
  {
    to: ROUTES.USERS,
    label: 'Manage users',
    desc: 'Team administration',
    icon: FiUsers,
    accent: 'bg-ios-red/12 text-ios-red',
    adminOnly: true,
  },
];

export default function QuickActions({ isAdmin, isStaff }) {
  const items = actions.filter((a) => {
    if (a.adminOnly && !isAdmin) return false;
    if (a.staffOnly && !isStaff) return false;
    return true;
  });

  return (
    <div className="rounded-ios-lg bg-ios-card p-4 shadow-ios sm:p-5">
      <h3 className="mb-4 text-[17px] font-semibold text-ios-label">Quick actions</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(({ to, label, desc, icon: Icon, accent }) => (
          <Link
            key={label}
            to={to}
            className="group flex items-center gap-3 rounded-ios border border-ios-separator/20 bg-ios-bg/50 p-3 transition hover:border-ios-blue/30 hover:bg-ios-blue/5"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-ios ${accent}`}>
              <Icon className="text-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ios-label group-hover:text-ios-blue">
                {label}
              </p>
              <p className="truncate text-[12px] text-ios-secondary">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
