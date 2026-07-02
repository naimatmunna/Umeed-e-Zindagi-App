import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCreditCard,
  FiPieChart,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiActivity,
  FiUserPlus,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth.js';
import { usePermissions } from '@/hooks/usePermissions.js';
import { ROUTES, ROLES } from '@/constants';
import { useGetExpenseSummaryQuery, useGetExpensesQuery } from '@/features/expenses/expensesApi.js';
import {
  useGetAttendanceSummaryQuery,
  useGetTodayAttendanceQuery,
} from '@/features/attendance/attendanceApi.js';
import { useGetUsersQuery } from '@/features/users/usersApi.js';
import { useGetPatientSummaryQuery } from '@/features/patients/patientsApi.js';
import { formatCurrency, formatMonthLabel, currentMonth } from '@/helpers/format.js';
import PageMeta from '@/components/common/PageMeta.jsx';
import StatCard from '@/components/expenses/StatCard.jsx';
import CategoryDonutChart from '@/components/expenses/CategoryDonutChart.jsx';
import DailyBarChart from '@/components/expenses/DailyBarChart.jsx';
import TrendLineChart from '@/components/expenses/TrendLineChart.jsx';
import LiveClock from '@/components/dashboard/LiveClock.jsx';
import AttendanceStatusChart from '@/components/dashboard/AttendanceStatusChart.jsx';
import PatientStatusChart from '@/components/dashboard/PatientStatusChart.jsx';
import RecentExpenses from '@/components/dashboard/RecentExpenses.jsx';
import RecentPatients from '@/components/dashboard/RecentPatients.jsx';
import QuickActions from '@/components/dashboard/QuickActions.jsx';
import TodayAttendanceCard from '@/components/attendance/TodayAttendanceCard.jsx';
import StatusBadge from '@/components/attendance/StatusBadge.jsx';

const fadeUp = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.05, duration: 0.35 },
});

export default function Dashboard() {
  const { user } = useAuth();
  const { isAdmin, hasRole } = usePermissions();
  const { t: tp } = useTranslation('patient');
  const isStaff = isAdmin || hasRole(ROLES.MANAGER);
  const month = currentMonth();

  const { data: summaryData, isLoading: summaryLoading, isFetching: summaryFetching } =
    useGetExpenseSummaryQuery({ month });
  const { data: expensesData, isLoading: expensesLoading, isFetching: expensesFetching } =
    useGetExpensesQuery({ month, limit: 5, page: 1 });
  const { data: attendanceSummaryData, isLoading: attendanceLoading, isFetching: attendanceFetching } =
    useGetAttendanceSummaryQuery({ month });
  const { data: todayData, isLoading: todayLoading } = useGetTodayAttendanceQuery();
  const { data: usersData } = useGetUsersQuery({ limit: 1, page: 1 }, { skip: !isAdmin });
  const { data: patientSummaryData, isLoading: patientLoading, isFetching: patientFetching } =
    useGetPatientSummaryQuery(undefined, { skip: !isStaff });

  const summary = summaryData?.data;
  const attendance = attendanceSummaryData?.data;
  const today = todayData?.data;
  const recentExpenses = expensesData?.data ?? [];
  const teamCount = usersData?.meta?.pagination?.total;
  const patientSummary = patientSummaryData?.data;

  const change = summary?.previousMonth?.changePercent ?? 0;
  const changeLabel =
    change === 0
      ? 'Same as last month'
      : `${change > 0 ? '+' : ''}${change}% vs last month`;

  const attendanceStats = attendance?.stats;
  const attendanceRate = attendanceStats?.attendanceRate ?? 0;

  const expenseStats = [
    {
      label: 'Total spent',
      value: formatCurrency(summary?.totalAmount ?? 0),
      sub: changeLabel,
      trend: change,
      icon: FiCreditCard,
      accent: 'blue',
      link: ROUTES.EXPENSES,
    },
    {
      label: 'Transactions',
      value: summary?.expenseCount ?? 0,
      sub: formatMonthLabel(month),
      icon: FiPieChart,
      accent: 'purple',
      link: ROUTES.EXPENSES,
    },
    {
      label: 'Daily average',
      value: formatCurrency(summary?.avgPerDay ?? 0),
      sub: 'Per calendar day',
      icon: FiCalendar,
      accent: 'orange',
      link: ROUTES.EXPENSES,
    },
    {
      label: 'Month change',
      value: `${change > 0 ? '+' : ''}${change}%`,
      sub: formatCurrency(summary?.previousMonth?.changeAmount ?? 0),
      trend: change,
      icon: change > 0 ? FiTrendingUp : FiTrendingDown,
      accent: change > 0 ? 'red' : 'green',
      link: ROUTES.EXPENSES,
    },
    {
      label: 'Attendance rate',
      value: `${attendanceRate}%`,
      sub: `${attendanceStats?.present ?? 0} present days`,
      icon: FiClock,
      accent: 'green',
      link: ROUTES.ATTENDANCE,
    },
    {
      label: 'Hours logged',
      value: `${attendanceStats?.totalHours ?? 0}h`,
      sub: `Avg ${attendanceStats?.avgHoursPerDay ?? 0}h / day`,
      icon: FiClock,
      accent: 'blue',
      link: ROUTES.ATTENDANCE,
    },
  ];

  const patientStats = isStaff
    ? [
        {
          label: tp('dashboard.totalPatients'),
          value: patientSummary?.total ?? 0,
          sub: `${patientSummary?.active ?? 0} ${tp('dashboard.activePatients').toLowerCase()}`,
          icon: FiActivity,
          accent: 'blue',
          link: ROUTES.PATIENTS,
        },
        {
          label: tp('dashboard.admittedThisMonth'),
          value: patientSummary?.admittedThisMonth ?? 0,
          sub: formatMonthLabel(month),
          icon: FiUserPlus,
          accent: 'green',
          link: ROUTES.PATIENTS,
        },
        {
          label: tp('dashboard.draftRecords'),
          value: patientSummary?.drafts ?? 0,
          sub: tp('saveDraft'),
          icon: FiActivity,
          accent: 'orange',
          link: ROUTES.PATIENTS,
        },
        {
          label: tp('dashboard.recovered'),
          value: patientSummary?.recovered ?? 0,
          sub: `${patientSummary?.discharged ?? 0} ${tp('dashboard.discharged').toLowerCase()}`,
          icon: FiCheckCircle,
          accent: 'purple',
          link: ROUTES.PATIENTS,
        },
      ]
    : [];

  const adminStats = isAdmin
    ? [
        {
          label: 'Team members',
          value: teamCount ?? '—',
          sub: 'Active users',
          icon: FiUsers,
          accent: 'purple',
          link: ROUTES.USERS,
        },
      ]
    : [];

  const stats = [...patientStats, ...expenseStats, ...adminStats];

  const chartsLoading = summaryLoading || summaryFetching;
  const attendanceChartLoading = attendanceLoading || attendanceFetching;
  const patientChartLoading = patientLoading || patientFetching;

  return (
    <>
      <PageMeta title="Dashboard" />

      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <motion.div {...fadeUp(0)}>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-ios-blue">
            {formatMonthLabel(month)}
          </p>
          <h1 className="ios-page-title mt-1">
            Welcome back, {user?.firstName ?? 'there'}
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ios-secondary">
            {isStaff
              ? 'Hospital operations at a glance — patients, finances, attendance, and quick actions.'
              : 'Your financial and attendance overview at a glance. Track spending trends, monitor attendance, and jump to key actions below.'}
          </p>
          {today && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-ios-separator/30 bg-ios-card px-3 py-1.5 shadow-ios">
              <span className="text-[12px] font-medium text-ios-secondary">Today</span>
              <StatusBadge status={today.status ?? (today.isOffDay ? 'weekend' : undefined)} />
              {today.workingHours != null && (
                <span className="text-[12px] text-ios-secondary">{today.workingHours}h logged</span>
              )}
            </div>
          )}
        </motion.div>
        <motion.div {...fadeUp(1)}>
          <LiveClock />
        </motion.div>
      </div>

      <motion.div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" {...fadeUp(2)}>
        {stats.map((stat) => {
          const card = (
            <StatCard
              label={stat.label}
              value={stat.value}
              sub={stat.sub}
              trend={stat.trend}
              icon={stat.icon}
              accent={stat.accent}
              className="h-full transition hover:shadow-ios-lg"
            />
          );
          return stat.link ? (
            <Link key={stat.label} to={stat.link} className="block h-full">
              {card}
            </Link>
          ) : (
            <div key={stat.label} className="h-full">
              {card}
            </div>
          );
        })}
      </motion.div>

      {isStaff && (
        <motion.div className="mb-6 grid gap-4 lg:grid-cols-2" {...fadeUp(3)}>
          <PatientStatusChart data={patientSummary?.byStatus ?? []} isLoading={patientChartLoading} />
          <RecentPatients patients={patientSummary?.recentPatients ?? []} isLoading={patientChartLoading} />
        </motion.div>
      )}

      <motion.div className="mb-6 grid gap-4 lg:grid-cols-2" {...fadeUp(4)}>
        <DailyBarChart data={summary?.byDay ?? []} isLoading={chartsLoading} />
        <CategoryDonutChart data={summary?.byCategory ?? []} isLoading={chartsLoading} />
      </motion.div>

      <motion.div className="mb-6 grid gap-4 lg:grid-cols-2" {...fadeUp(5)}>
        <TrendLineChart data={summary?.trend ?? []} isLoading={chartsLoading} />
        <AttendanceStatusChart
          data={attendance?.byStatus ?? []}
          isLoading={attendanceChartLoading}
        />
      </motion.div>

      <motion.div className="mb-6" {...fadeUp(6)}>
        <TodayAttendanceCard today={today} isLoading={todayLoading} />
      </motion.div>

      <motion.div className="grid gap-4 lg:grid-cols-2" {...fadeUp(7)}>
        <RecentExpenses
          expenses={recentExpenses}
          isLoading={expensesLoading || expensesFetching}
        />
        <QuickActions isAdmin={isAdmin} isStaff={isStaff} />
      </motion.div>

      {isAdmin && (
        <motion.div
          className="mt-6 flex items-center gap-3 rounded-ios-lg border border-ios-blue/20 bg-ios-blue/5 px-4 py-3"
          {...fadeUp(8)}
        >
          <FiCheckCircle className="shrink-0 text-xl text-ios-blue" />
          <p className="text-[14px] text-ios-label">
            <span className="font-semibold">Admin access enabled.</span>{' '}
            Manage users, roles, categories, and patients from the sidebar.
          </p>
        </motion.div>
      )}
    </>
  );
}
