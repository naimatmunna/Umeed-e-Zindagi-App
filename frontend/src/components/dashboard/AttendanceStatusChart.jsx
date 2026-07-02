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

const STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  half_day: 'Half day',
  leave_paid: 'Paid leave',
  leave_unpaid: 'Unpaid leave',
  weekend: 'Weekend',
  holiday: 'Holiday',
};

const STATUS_COLORS = {
  present: '#34C759',
  absent: '#FF3B30',
  late: '#FF9500',
  half_day: '#AF52DE',
  leave_paid: '#007AFF',
  leave_unpaid: '#5856D6',
  weekend: '#8E8E93',
  holiday: '#5AC8FA',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-ios border border-ios-separator/40 bg-ios-card px-3 py-2 shadow-ios-lg">
      <p className="text-[13px] font-semibold text-ios-label">{item.label}</p>
      <p className="text-[13px] text-ios-secondary">{item.count} days</p>
    </div>
  );
};

export default function AttendanceStatusChart({ data = [], isLoading }) {
  const chartData = data
    .filter((d) => d.count > 0 && !['totalHours', 'totalRecords'].includes(d.status))
    .map((d) => ({
      ...d,
      label: STATUS_LABELS[d.status] ?? d.status,
      color: STATUS_COLORS[d.status] ?? '#8E8E93',
    }));

  if (isLoading) {
    return <ChartShell title="Attendance breakdown" skeleton />;
  }

  if (!chartData.length) {
    return (
      <ChartShell title="Attendance breakdown">
        <div className="flex h-[240px] items-center justify-center rounded-ios bg-ios-bg text-[15px] text-ios-secondary">
          No attendance data this month
        </div>
      </ChartShell>
    );
  }

  return (
    <ChartShell title="Attendance breakdown">
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
              angle={-20}
              textAnchor="end"
              height={52}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#8E8E93' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,122,255,0.06)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

function ChartShell({ title, children, skeleton }) {
  return (
    <div className="rounded-ios-lg bg-ios-card p-4 shadow-ios sm:p-5">
      <h3 className="mb-4 text-[17px] font-semibold text-ios-label">{title}</h3>
      {skeleton ? (
        <div className="h-[240px] animate-pulse rounded-ios bg-ios-bg sm:h-[260px]" />
      ) : (
        children
      )}
    </div>
  );
}
