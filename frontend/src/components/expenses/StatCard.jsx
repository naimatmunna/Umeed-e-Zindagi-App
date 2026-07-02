import { cn } from '@/lib/classNames.js';

export default function StatCard({ label, value, sub, trend, icon: Icon, accent = 'blue', className }) {
  const accents = {
    blue: 'from-ios-blue/15 to-ios-blue/5 text-ios-blue',
    green: 'from-ios-green/15 to-ios-green/5 text-ios-green',
    orange: 'from-[#FF9500]/15 to-[#FF9500]/5 text-[#FF9500]',
    red: 'from-ios-red/15 to-ios-red/5 text-ios-red',
    purple: 'from-[#AF52DE]/15 to-[#AF52DE]/5 text-[#AF52DE]',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-ios-lg bg-ios-card p-4 shadow-ios sm:p-5',
        className,
      )}
    >
      <div className={cn('absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br opacity-80', accents[accent])} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ios-secondary">{label}</p>
          <p className="mt-1 truncate text-[22px] font-bold tracking-tight text-ios-label sm:text-[26px]">
            {value}
          </p>
          {(sub || trend != null) && (
            <p
              className={cn(
                'mt-1 text-[13px] font-medium',
                trend > 0 ? 'text-ios-red' : trend < 0 ? 'text-ios-green' : 'text-ios-secondary',
              )}
            >
              {sub}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-ios bg-gradient-to-br', accents[accent])}>
            <Icon className="text-xl" />
          </div>
        )}
      </div>
    </div>
  );
}
