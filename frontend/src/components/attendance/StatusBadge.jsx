import { cn } from '@/lib/classNames.js';
import { statusMeta } from '@/helpers/attendance.js';

export default function StatusBadge({ status, size = 'md' }) {
  const meta = statusMeta(status);
  if (!status) {
    return <span className="text-[12px] text-ios-secondary">—</span>;
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        meta.bg,
        meta.text,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]',
      )}
    >
      <span
        className="mr-1.5 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}
