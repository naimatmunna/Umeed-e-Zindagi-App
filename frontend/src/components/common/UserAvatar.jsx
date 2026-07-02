import { cn } from '@/lib/classNames.js';

const SIZES = {
  xs: 'h-8 w-8 text-[11px]',
  sm: 'h-10 w-10 text-[13px]',
  md: 'h-12 w-12 text-[15px]',
  lg: 'h-20 w-20 text-[22px]',
  xl: 'h-28 w-28 text-[32px]',
};

export default function UserAvatar({ user, size = 'md', className, ring = true }) {
  const name = user?.fullName ?? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';
  const src = user?.avatar?.url;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full bg-brand-forestLight font-bold text-brand-forestDark',
        SIZES[size] ?? SIZES.md,
        ring && 'ring-2 ring-white shadow-sm',
        className,
      )}
      title={name || undefined}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{initials}</span>
      )}
    </div>
  );
}
