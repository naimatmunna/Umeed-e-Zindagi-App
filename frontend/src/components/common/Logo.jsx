import logoSrc from '@/assets/logo.png';

/**
 * Brand logo — colors align with forest green & heart red from the institute emblem.
 */
export default function Logo({ size = 'md', showName = true, className = '' }) {
  const sizes = {
    sm: { img: 'h-11 w-11', text: 'text-[15px]' },
    md: { img: 'h-14 w-14', text: 'text-[18px]' },
    lg: { img: 'h-20 w-20', text: 'text-[22px]' },
    xl: { img: 'h-24 w-24', text: 'text-[26px]' },
  };
  const s = sizes[size] ?? sizes.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="shrink-0 overflow-hidden rounded-ios-lg border border-ios-separator/40 bg-brand-cream shadow-ios">
        <img
          src={logoSrc}
          alt="Umeed-e-Zindagi logo"
          className={`${s.img} object-contain p-0.5`}
        />
      </div>
      {showName && (
        <div className="min-w-0">
          <p className={`${s.text} font-display font-bold leading-tight tracking-tight text-brand-forestDark`}>
            Umeed-e-Zindagi
          </p>
          <p className="text-[12px] font-medium text-ios-secondary">Hope of Life</p>
        </div>
      )}
    </div>
  );
}
