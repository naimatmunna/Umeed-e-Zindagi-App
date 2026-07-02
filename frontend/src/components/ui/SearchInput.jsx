import { FiSearch } from 'react-icons/fi';

export default function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative w-full ${className}`}>
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ios-secondary" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[44px] rounded-ios border border-ios-separator/60 bg-ios-card py-2 pl-10 pr-3 text-[15px] text-ios-label placeholder:text-ios-secondary/70 focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15"
      />
    </div>
  );
}
