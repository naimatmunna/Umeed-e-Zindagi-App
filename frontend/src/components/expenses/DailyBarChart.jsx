import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/helpers/format.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-ios border border-ios-separator/40 bg-ios-card px-3 py-2 shadow-ios-lg">
      <p className="text-[13px] font-semibold text-ios-label">Day {label?.slice(-2)}</p>
      <p className="text-[13px] text-ios-secondary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export default function DailyBarChart({ data = [], isLoading }) {
  const chartData = data.map((d) => ({
    ...d,
    day: d.date?.slice(-2) ?? '',
  }));

  if (isLoading) {
    return (
      <div className="rounded-ios-lg bg-ios-card p-5 shadow-ios">
        <h3 className="mb-4 text-[17px] font-semibold text-ios-label">Daily spending</h3>
        <div className="h-[260px] animate-pulse rounded-ios bg-ios-bg" />
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="rounded-ios-lg bg-ios-card p-5 shadow-ios">
        <h3 className="mb-4 text-[17px] font-semibold text-ios-label">Daily spending</h3>
        <div className="flex h-[260px] items-center justify-center rounded-ios bg-ios-bg text-[15px] text-ios-secondary">
          No daily data for this month
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-ios-lg bg-ios-card p-4 shadow-ios sm:p-5">
      <h3 className="mb-4 text-[17px] font-semibold text-ios-label">Daily spending</h3>
      <div className="h-[260px] w-full sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#8E8E93' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#8E8E93' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,122,255,0.08)' }} />
            <Bar dataKey="amount" fill="#007AFF" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
