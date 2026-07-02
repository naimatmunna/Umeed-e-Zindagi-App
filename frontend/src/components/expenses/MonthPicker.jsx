import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { formatMonthLabel } from '@/helpers/format.js';
import { cn } from '@/lib/classNames.js';

export default function MonthPicker({ month, onChange, className }) {
  const go = (delta) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-ios-lg bg-ios-card p-1 shadow-ios',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => go(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-ios text-ios-blue transition hover:bg-ios-blue/10"
        aria-label="Previous month"
      >
        <FiChevronLeft className="text-xl" />
      </button>
      <div className="min-w-[160px] px-3 text-center text-[15px] font-semibold text-ios-label sm:min-w-[200px] sm:text-[17px]">
        {formatMonthLabel(month)}
      </div>
      <button
        type="button"
        onClick={() => go(1)}
        className="flex h-10 w-10 items-center justify-center rounded-ios text-ios-blue transition hover:bg-ios-blue/10"
        aria-label="Next month"
      >
        <FiChevronRight className="text-xl" />
      </button>
    </div>
  );
}
