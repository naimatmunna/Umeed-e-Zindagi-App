import { cn } from '@/lib/classNames.js';

const VARIANTS = {
  primary: 'bg-brand-forest text-white shadow-sm hover:bg-brand-forestDark active:opacity-95',
  secondary: 'border border-ios-separator/60 bg-brand-forestLight/60 text-brand-forestDark hover:bg-brand-forestLight',
  danger: 'bg-brand-heart text-white hover:opacity-90',
  ghost: 'bg-transparent text-brand-forest hover:bg-brand-forestLight/80',
};

const SIZES = {
  sm: 'min-h-[36px] px-3 text-[14px] rounded-ios',
  md: 'min-h-[44px] px-4 text-[15px] rounded-ios',
  lg: 'min-h-[48px] px-5 text-[15px] rounded-ios-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/35',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
