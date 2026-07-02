import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/helpers/format.js';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-ios border border-ios-separator/40 bg-ios-card px-3 py-2 shadow-ios-lg">
      <p className="text-[13px] font-semibold text-ios-label">{item.name}</p>
      <p className="text-[13px] text-ios-secondary">
        {formatCurrency(item.amount)} · {item.percentage}%
      </p>
    </div>
  );
};

export default function CategoryDonutChart({ data = [], isLoading }) {
  if (isLoading) {
    return <ChartSkeleton title="By category" />;
  }

  if (!data.length) {
    return <ChartEmpty title="By category" message="No spending this month" />;
  }

  return (
    <div className="rounded-ios-lg bg-ios-card p-4 shadow-ios sm:p-5">
      <h3 className="mb-4 text-[17px] font-semibold text-ios-label">Spending by category</h3>
      <div className="h-[260px] w-full sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.categoryId ?? entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={48}
              formatter={(value) => (
                <span className="text-[12px] text-ios-secondary">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartSkeleton({ title }) {
  return (
    <div className="rounded-ios-lg bg-ios-card p-5 shadow-ios">
      <h3 className="mb-4 text-[17px] font-semibold text-ios-label">{title}</h3>
      <div className="flex h-[260px] animate-pulse items-center justify-center rounded-ios bg-ios-bg" />
    </div>
  );
}

function ChartEmpty({ title, message }) {
  return (
    <div className="rounded-ios-lg bg-ios-card p-5 shadow-ios">
      <h3 className="mb-4 text-[17px] font-semibold text-ios-label">{title}</h3>
      <div className="flex h-[260px] items-center justify-center rounded-ios bg-ios-bg text-[15px] text-ios-secondary">
        {message}
      </div>
    </div>
  );
}
