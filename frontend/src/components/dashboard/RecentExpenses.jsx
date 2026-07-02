import { Link } from 'react-router-dom';
import { FiArrowRight, FiDollarSign } from 'react-icons/fi';
import { ROUTES } from '@/constants';
import { formatCurrency, formatDate } from '@/helpers/format.js';

export default function RecentExpenses({ expenses = [], isLoading }) {
  if (isLoading) {
    return (
      <Panel title="Recent expenses">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-ios bg-ios-bg" />
          ))}
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title="Recent expenses"
      action={
        <Link
          to={ROUTES.EXPENSES}
          className="flex items-center gap-1 text-[13px] font-medium text-ios-blue hover:underline"
        >
          View all <FiArrowRight />
        </Link>
      }
    >
      {!expenses.length ? (
        <div className="flex flex-col items-center justify-center rounded-ios bg-ios-bg py-10 text-center">
          <FiDollarSign className="mb-2 text-3xl text-ios-secondary" />
          <p className="text-[15px] text-ios-secondary">No expenses recorded yet</p>
          <Link to={ROUTES.EXPENSES} className="mt-3 text-[13px] font-medium text-ios-blue">
            Add your first expense
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-ios-separator/30">
          {expenses.map((expense) => (
            <li key={expense.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: expense.category?.color ?? '#8E8E93' }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-ios-label">{expense.title}</p>
                <p className="text-[12px] text-ios-secondary">
                  {expense.category?.name ?? 'Uncategorized'} · {formatDate(expense.date)}
                </p>
              </div>
              <p className="shrink-0 text-[15px] font-semibold tabular-nums text-ios-label">
                {formatCurrency(expense.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Panel({ title, action, children }) {
  return (
    <div className="h-full rounded-ios-lg bg-ios-card p-4 shadow-ios sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[17px] font-semibold text-ios-label">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
