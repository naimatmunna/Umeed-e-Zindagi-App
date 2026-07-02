import { cn } from '@/lib/classNames.js';
import Spinner from './Spinner.jsx';

/**
 * Full-width data table with brand styling.
 * Columns may set `className` (th) and `cellClassName` (td).
 */
export default function Table({
  columns,
  data = [],
  isLoading,
  emptyLabel = 'No records found',
  stickyHeader = true,
  compact = false,
}) {
  const cellPad = compact ? 'px-3 py-2.5' : 'px-4 py-3.5';
  const headPad = compact ? 'px-3 py-3' : 'px-4 py-3.5';

  if (isLoading) {
    return (
      <div className="brand-table-wrap flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="brand-table-wrap px-6 py-16 text-center">
        <p className="text-[15px] font-medium text-ios-label">No data yet</p>
        <p className="mt-1 text-[14px] text-ios-secondary">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="brand-table-wrap w-full overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full border-collapse text-left">
          <thead
            className={cn(
              'border-b border-ios-separator/60 bg-brand-forestLight/80',
              stickyHeader && 'sticky top-0 z-10 backdrop-blur-sm',
            )}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    headPad,
                    'text-table-head uppercase text-brand-forestDark',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ios-separator/35 bg-ios-card">
            {data.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="transition-colors hover:bg-brand-forestLight/35"
              >
                {columns.map((col) => {
                  const shouldNowrap = col.nowrap ?? !['name', 'guardian', 'actions'].includes(col.key);
                  return (
                  <td
                    key={col.key}
                    className={cn(
                      cellPad,
                      'text-table-cell text-ios-label',
                      shouldNowrap && 'whitespace-nowrap',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.cellClassName,
                    )}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
