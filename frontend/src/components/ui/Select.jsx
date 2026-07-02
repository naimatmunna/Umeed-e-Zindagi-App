import { forwardRef, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/classNames.js';
import { FieldFooter } from '@/components/patients/wizard/formLayout.jsx';

const Select = forwardRef(function Select(
  { label, error, hint, required, showRequiredLabel, className, id, children, footerHint, ...props },
  ref,
) {
  const { t } = useTranslation('common');
  const autoId = useId();
  const selectId = id ?? autoId;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;
  const belowHint = footerHint ?? (!error ? hint : undefined);

  return (
    <div className={cn('flex w-full flex-col self-start', className)}>
      {label && (
        <div className="mb-2 flex min-h-[1.25rem] flex-wrap items-center gap-x-2 gap-y-1">
          <label htmlFor={selectId} className="text-[13px] font-medium leading-snug text-ios-secondary">
            {label}
            {required && (
              <span className="ml-0.5 text-ios-red" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {required && showRequiredLabel && (
            <span className="rounded-full bg-ios-red/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ios-red">
              {t('required')}
            </span>
          )}
        </div>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={[belowHint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined}
        className={cn(
          'w-full min-h-[44px] appearance-none rounded-ios border bg-ios-card px-3 py-2.5 text-[16px] leading-normal text-ios-label transition sm:text-[17px]',
          'focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15',
          error
            ? 'border-ios-red bg-ios-red/5 focus:border-ios-red focus:ring-ios-red/20'
            : 'border-ios-separator/60',
        )}
        {...props}
      >
        {children}
      </select>
      <FieldFooter error={error} hint={belowHint} />
    </div>
  );
});

export default Select;
