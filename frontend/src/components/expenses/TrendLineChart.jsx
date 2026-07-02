import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatMonthLabel } from '@/helpers/format.js';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-ios border border-ios-separator/40 bg-ios-card px-3 py-2 shadow-ios-lg">
      <p className="text-[13px] font-semibold text-ios-label">{formatMonthLabel(item.month)}</p>
      <p className="text-[13px] text-ios-secondary">{formatCurrency(item.amount)}</p>
    </div>
  );
};

export default function TrendLineChart({ data = [], isLoading }) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.month?.slice(5) ?? '',
  }));

  if (isLoading) {
    return (
      <div className="rounded-ios-lg bg-ios-card p-5 shadow-ios">
        <h3 className="mb-4 text-[17px] font-semibold text-ios-label">6-month trend</h3>
        <div className="h-[220px] animate-pulse rounded-ios bg-ios-bg" />
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="rounded-ios-lg bg-ios-card p-5 shadow-ios">
        <h3 className="mb-4 text-[17px] font-semibold text-ios-label">6-month trend</h3>
        <div className="flex h-[220px] items-center justify-center rounded-ios bg-ios-bg text-[15px] text-ios-secondary">
          Not enough history yet
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-ios-lg bg-ios-card p-4 shadow-ios sm:p-5">
      <h3 className="mb-4 text-[17px] font-semibold text-ios-label">6-month trend</h3>
      <div className="h-[220px] w-full sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false} />
            <XAxis
              dataKey="label"
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
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#34C759"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#34C759', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
