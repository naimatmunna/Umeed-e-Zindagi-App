import { forwardRef, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/classNames.js';
import { FieldFooter } from '@/components/patients/wizard/formLayout.jsx';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    required,
    showRequiredLabel,
    maxLength,
    value,
    className,
    id,
    footerHint,
    ...props
  },
  ref,
) {
  const { t } = useTranslation('common');
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const strValue = value ?? '';
  const showCount = typeof maxLength === 'number';
  const belowHint = footerHint ?? (!error ? hint : undefined);

  return (
    <div className={cn('flex w-full flex-col self-start', className)}>
      {label && (
        <div className="mb-2 flex min-h-[1.25rem] flex-wrap items-center gap-x-2 gap-y-1">
          <label htmlFor={inputId} className="text-[13px] font-medium leading-snug text-ios-secondary">
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
      <input
        ref={ref}
        id={inputId}
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={[belowHint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined}
        className={cn(
          'w-full min-h-[44px] rounded-ios border bg-ios-card px-3 py-2.5 text-[16px] leading-normal text-ios-label transition sm:text-[17px]',
          'placeholder:text-ios-secondary/70',
          'focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15',
          error
            ? 'border-ios-red bg-ios-red/5 focus:border-ios-red focus:ring-ios-red/20'
            : 'border-ios-separator/60',
        )}
        {...props}
      />
      <FieldFooter
        error={error}
        hint={belowHint}
        count={
          showCount ? (
            <span id={hintId} className="shrink-0 text-[12px] tabular-nums text-ios-secondary" aria-live="polite">
              {String(strValue).length}/{maxLength}
            </span>
          ) : null
        }
      />
    </div>
  );
});

export default Input;
