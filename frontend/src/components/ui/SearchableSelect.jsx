import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/classNames.js';
import { FieldFooter } from '@/components/patients/wizard/formLayout.jsx';

export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  hint,
  error,
  required,
  showRequiredLabel,
  allowCustom = false,
  className,
}) {
  const { t } = useTranslation('common');
  const listId = useId();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ?? '');

  useEffect(() => {
    setQuery(value ?? '');
  }, [value]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
  }, [options, query]);

  const pick = (val) => {
    onChange(val);
    setQuery(val);
    setOpen(false);
  };

  const onInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (allowCustom) onChange(val);
    setOpen(true);
  };

  const onBlur = () => {
    if (allowCustom && query !== value) onChange(query);
  };

  const belowHint = !error ? hint : undefined;

  return (
    <div ref={wrapRef} className={cn('relative flex w-full flex-col self-start', className)}>
      {label && (
        <div className="mb-2 flex min-h-[1.25rem] flex-wrap items-center gap-x-2 gap-y-1">
          <label htmlFor={listId} className="text-[13px] font-medium leading-snug text-ios-secondary">
            {label}
            {required && <span className="ml-0.5 text-ios-red">*</span>}
          </label>
          {required && showRequiredLabel && (
            <span className="rounded-full bg-ios-red/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ios-red">
              {t('required')}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ios-secondary" />
        <input
          id={listId}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          value={query}
          onChange={onInputChange}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'w-full min-h-[44px] rounded-ios border bg-ios-card py-2.5 pl-9 pr-9 text-[16px] leading-normal text-ios-label transition sm:text-[17px]',
            'placeholder:text-ios-secondary/70 focus:border-ios-blue focus:outline-none focus:ring-2 focus:ring-ios-blue/20',
            error ? 'border-ios-red bg-ios-red/5' : 'border-ios-separator/60',
          )}
        />
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ios-secondary" />
      </div>
      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-ios border border-ios-separator/40 bg-ios-card py-1 shadow-ios-lg"
        >
          {filtered.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === opt.value}
                className={cn(
                  'w-full px-3 py-2.5 text-left text-[15px] leading-snug hover:bg-ios-bg',
                  value === opt.value && 'bg-ios-blue/10 font-medium text-ios-blue',
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(opt.value)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <FieldFooter error={error} hint={belowHint} />
    </div>
  );
}
