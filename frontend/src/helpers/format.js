export const formatDate = (value, locale = 'en-PK') =>
  value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value)) : '';

export const formatDateTime = (value, locale = 'en-PK') =>
  value
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value),
      )
    : '';

export const formatFullDate = (value = new Date(), locale = 'en-PK') =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
  }).format(value instanceof Date ? value : new Date(value));

export const formatLiveTime = (value = new Date(), locale = 'en-PK') =>
  new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Karachi',
  }).format(value instanceof Date ? value : new Date(value));

export const formatShortDate = (value = new Date(), locale = 'en-PK') =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Karachi',
  }).format(value instanceof Date ? value : new Date(value));

export const formatCurrency = (amount, currency = 'PKR', locale = 'en-PK') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    amount ?? 0,
  );

export const formatMonthLabel = (month) => {
  const [y, m] = (month ?? '').split('-').map(Number);
  if (!y || !m) return '';
  return new Intl.DateTimeFormat('en-PK', { month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
};

export const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const shiftMonth = (month, delta) => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const PAYMENT_LABELS = {
  cash: 'Cash',
  card: 'Card',
  bank: 'Bank',
  mobile_wallet: 'Wallet',
  other: 'Other',
};
