import { FiClock } from 'react-icons/fi';
import { useLiveClock } from '@/hooks/useLiveClock.js';
import { formatFullDate, formatLiveTime } from '@/helpers/format.js';
import { cn } from '@/lib/classNames.js';

export default function LiveClock({ variant = 'default', className }) {
  const now = useLiveClock();

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-[13px] text-ios-secondary', className)}>
        <FiClock className="shrink-0 text-ios-blue" aria-hidden />
        <span className="tabular-nums">{formatLiveTime(now)}</span>
        <span className="hidden text-ios-separator sm:inline">·</span>
        <span className="hidden sm:inline">{formatFullDate(now)}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-ios-lg border border-ios-separator/30 bg-gradient-to-br from-ios-card to-ios-bg/80 p-4 shadow-ios sm:p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-ios-secondary">
            Pakistan Standard Time
          </p>
          <p className="mt-1 text-[15px] font-medium text-ios-label sm:text-[17px]">
            {formatFullDate(now)}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-ios bg-ios-blue/10 text-ios-blue">
          <FiClock className="text-xl" aria-hidden />
        </div>
      </div>
      <p className="mt-3 font-mono text-[28px] font-bold tabular-nums tracking-tight text-ios-label sm:text-[32px]">
        {formatLiveTime(now)}
      </p>
    </div>
  );
}
