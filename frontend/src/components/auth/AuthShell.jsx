import { Link } from 'react-router-dom';
import Logo from '@/components/common/Logo.jsx';

export default function AuthShell({ title, subtitle, children, footer, wide = false }) {
  return (
    <div className="grid min-h-[calc(100vh-5rem)] w-full lg:grid-cols-2 lg:gap-0">
      <div className="relative hidden overflow-hidden rounded-ios-xl bg-gradient-to-br from-brand-forest via-brand-forestDark to-[#0d3d28] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" aria-hidden />
        <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-brand-lime/10" aria-hidden />
        <div className="relative">
          <Logo size="md" className="[&_p]:text-white [&_span]:text-white/80" />
        </div>
        <div className="relative space-y-4">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">
            Hope of Life
          </h2>
          <p className="max-w-sm text-[15px] leading-relaxed text-white/85">
            Secure access to patient records, attendance, expenses, and your team workspace at
            Umeed-e-Zindagi Institute.
          </p>
          <ul className="space-y-2 text-[14px] text-white/75">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-lime" />
              Patient admission &amp; care records
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
              Staff attendance &amp; finance tools
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-heart" />
              Role-based secure access
            </li>
          </ul>
        </div>
        <p className="relative text-[12px] text-white/50">© Umeed-e-Zindagi Institute</p>
      </div>

      <div className="flex flex-col justify-center py-4 lg:py-8">
        <div className="mb-6 flex justify-center lg:hidden">
          <Logo size="md" />
        </div>
        <div
          className={`mx-auto w-full ${wide ? 'max-w-lg' : 'max-w-md'} rounded-ios-xl border border-ios-separator/40 bg-ios-card p-6 shadow-ios-card sm:p-8`}
        >
          <div className="mb-6 text-center lg:text-left">
            <h1 className="font-display text-[26px] font-bold tracking-tight text-ios-label">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-[15px] leading-relaxed text-ios-secondary">{subtitle}</p>
            )}
          </div>
          {children}
          {footer && <div className="mt-6 border-t border-ios-separator/30 pt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function AuthLink({ to, children }) {
  return (
    <Link to={to} className="font-semibold text-brand-forest hover:text-brand-forestDark hover:underline">
      {children}
    </Link>
  );
}
