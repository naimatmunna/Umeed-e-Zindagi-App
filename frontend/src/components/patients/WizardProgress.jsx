import { cn } from '@/lib/classNames.js';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';

export default function WizardProgress({
  steps,
  currentStep,
  labels,
  furthestStep,
  stepsWithErrors,
  onStepClick,
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3 text-[13px] text-ios-secondary">
        <span className="font-medium">
          Step {currentStep} of {steps}
        </span>
        <span className="shrink-0 tabular-nums">{Math.round((currentStep / steps) * 100)}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-ios-bg">
        <div
          className="h-full rounded-full bg-ios-blue transition-all duration-300"
          style={{ width: `${(currentStep / steps) * 100}%` }}
        />
      </div>

      <p className="mt-3 text-[16px] font-semibold leading-snug text-ios-label sm:text-[17px]">
        {labels[currentStep]}
      </p>

      <nav
        aria-label="Registration steps"
        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5"
      >
        {Array.from({ length: steps }, (_, i) => i + 1).map((step) => {
          const reachable = step <= furthestStep + 1;
          const hasError = stepsWithErrors[step];
          const isCurrent = step === currentStep;
          const isComplete = step < currentStep && !hasError;

          return (
            <button
              key={step}
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onStepClick?.(step)}
              className={cn(
                'flex min-h-[4.5rem] flex-col items-center justify-start gap-2 rounded-ios-lg border px-2 py-2.5 text-center transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue/40',
                isCurrent && 'border-ios-blue bg-ios-blue text-white shadow-sm',
                !isCurrent && isComplete && 'border-ios-green/30 bg-ios-green/10 text-ios-green',
                !isCurrent && !isComplete && reachable && 'border-ios-separator/40 bg-ios-bg text-ios-label hover:border-ios-blue/40 hover:bg-ios-blue/5',
                !reachable && 'cursor-not-allowed border-ios-separator/25 bg-ios-bg/40 text-ios-secondary/60',
                hasError && !isCurrent && 'border-ios-red/40 ring-1 ring-ios-red/25',
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold',
                  isCurrent && 'bg-white/20 text-white',
                  !isCurrent && isComplete && 'bg-ios-green/20 text-ios-green',
                  !isCurrent && !isComplete && reachable && 'bg-ios-card text-ios-secondary',
                  !reachable && 'bg-ios-bg text-ios-secondary/70',
                  hasError && !isCurrent && 'bg-ios-red/15 text-ios-red',
                )}
              >
                {hasError && !isCurrent ? (
                  <FiAlertCircle className="text-sm" aria-hidden />
                ) : isComplete ? (
                  <FiCheck className="text-sm" aria-hidden />
                ) : (
                  step
                )}
              </span>
              <span
                className={cn(
                  'w-full whitespace-normal break-words text-[11px] font-medium leading-snug sm:text-[12px]',
                  isCurrent && 'text-white',
                )}
              >
                {labels[step]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
