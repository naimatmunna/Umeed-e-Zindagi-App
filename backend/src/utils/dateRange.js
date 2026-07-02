/** Parse YYYY-MM into inclusive UTC month boundaries. */
export const parseMonthParam = (month) => {
  const match = /^(\d{4})-(\d{2})$/.exec(month ?? '');
  if (!match) return null;
  const year = Number(match[1]);
  const mon = Number(match[2]);
  if (mon < 1 || mon > 12) return null;
  const start = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, mon, 0, 23, 59, 59, 999));
  return { year, month: mon, start, end, label: month };
};

export const currentMonthParam = () => {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const shiftMonth = (month, delta) => {
  const parsed = parseMonthParam(month);
  if (!parsed) return currentMonthParam();
  const d = new Date(Date.UTC(parsed.year, parsed.month - 1 + delta, 1));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};
