import { cn } from '@/lib/classNames.js';

/** Consistent two-column form grid — fields align at the top; inputs line up per row. */
export function FormGrid({ children, className, columns = 2 }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 items-start gap-x-6 gap-y-6',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FormSection({ title, hint, children, className }) {
  return (
    <section className={cn('space-y-5', className)}>
      {(title || hint) && (
        <div className="border-b border-ios-separator/25 pb-3">
          {title && <h3 className="text-[15px] font-semibold text-ios-label">{title}</h3>}
          {hint && <p className="mt-1 text-[13px] leading-relaxed text-ios-secondary">{hint}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function FieldFooter({ error, hint, count }) {
  return (
    <div className="mt-1.5 flex min-h-[2.25rem] items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        {error ? (
          <p className="text-[13px] leading-snug text-ios-red" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="text-[12px] leading-snug text-ios-secondary">{hint}</p>
        ) : null}
      </div>
      {count}
    </div>
  );
}
