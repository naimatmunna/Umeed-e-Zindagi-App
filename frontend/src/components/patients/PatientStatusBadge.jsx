import { cn } from '@/lib/classNames.js';

const STATUS_STYLES = {
  draft: 'bg-ios-secondary/12 text-ios-secondary ring-1 ring-ios-secondary/20',
  admitted: 'bg-brand-forestLight text-brand-forestDark ring-1 ring-brand-forest/20',
  under_treatment: 'bg-brand-gold/15 text-[#B45309] ring-1 ring-brand-gold/25',
  recovered: 'bg-brand-lime/15 text-brand-forestDark ring-1 ring-brand-lime/30',
  discharged: 'bg-brand-sky/12 text-brand-sky ring-1 ring-brand-sky/25',
  transferred: 'bg-[#7C6BB8]/12 text-[#5B4D9E] ring-1 ring-[#7C6BB8]/20',
  inactive: 'bg-ios-secondary/12 text-ios-secondary ring-1 ring-ios-secondary/20',
};

export default function PatientStatusBadge({ status, label, className }) {
  const key = status ?? 'draft';
  return (
    <span
      className={cn(
        'inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
        STATUS_STYLES[key] ?? STATUS_STYLES.draft,
        className,
      )}
    >
      {label ?? key.replace(/_/g, ' ')}
    </span>
  );
}
