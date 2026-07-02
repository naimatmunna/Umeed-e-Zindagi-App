import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS = {
  draft: '#8E8E93',
  admitted: '#007AFF',
  under_treatment: '#FF9500',
  recovered: '#34C759',
  discharged: '#AF52DE',
  transferred: '#5856D6',
  inactive: '#C7C7CC',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-ios border border-ios-separator/40 bg-ios-card px-3 py-2 shadow-ios-lg">
      <p className="text-[13px] font-semibold text-ios-label">{item.label}</p>
      <p className="text-[13px] text-ios-secondary">{item.count} patients</p>
    </div>
  );
};

export default function PatientStatusChart({ data = [], isLoading }) {
  const { t } = useTranslation('patient');

  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      ...d,
      label: t(`status.${d.status}`, { defaultValue: d.status?.replace(/_/g, ' ') }),
      color: STATUS_COLORS[d.status] ?? '#8E8E93',
    }));

  if (isLoading) {
    return (
      <div className="rounded-ios-lg bg-ios-card p-5 shadow-ios">
        <h3 className="mb-4 text-[17px] font-semibold text-ios-label">Patients by status</h3>
        <div className="h-[240px] animate-pulse rounded-ios bg-ios-bg" />
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="rounded-ios-lg bg-ios-card p-5 shadow-ios">
        <h3 className="mb-4 text-[17px] font-semibold text-ios-label">Patients by status</h3>
        <div className="flex h-[240px] items-center justify-center rounded-ios bg-ios-bg text-[15px] text-ios-secondary">
          No patient data yet
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-ios-lg bg-ios-card p-4 shadow-ios sm:p-5">
      <h3 className="mb-4 text-[17px] font-semibold text-ios-label">Patients by status</h3>
      <div className="h-[240px] w-full sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#8E8E93' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={48}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,122,255,0.06)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
