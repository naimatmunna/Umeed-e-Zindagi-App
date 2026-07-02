import { ATTENDANCE_STATUS, statusMeta } from '@/helpers/attendance.js';
import { cn } from '@/lib/classNames.js';

const cellCode = (status) => {
  const map = {
    present: 'P',
    absent: 'A',
    late: 'L',
    half_day: 'H',
    leave_paid: 'PL',
    leave_unpaid: 'UL',
    weekend: '·',
    holiday: 'HD',
  };
  return map[status] ?? '';
};

export default function AttendanceMatrix({ data, isLoading, onCellClick }) {
  if (isLoading) {
    return (
      <div className="ios-grouped animate-pulse p-4">
        <div className="h-64 rounded-ios bg-ios-bg" />
      </div>
    );
  }

  if (!data?.employees?.length) {
    return (
      <div className="ios-grouped p-8 text-center text-[15px] text-ios-secondary">
        No employees found
      </div>
    );
  }

  const { days, employees } = data;

  return (
    <div className="ios-grouped overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-ios-separator/40 bg-ios-bg/60">
              <th className="sticky left-0 z-10 min-w-[160px] bg-ios-bg/95 px-3 py-3 text-left font-semibold text-ios-secondary backdrop-blur">
                Employee
              </th>
              {days.map((d) => (
                <th
                  key={d.dateKey}
                  className={cn(
                    'min-w-[36px] px-1 py-3 text-center font-semibold',
                    d.isOffDay ? 'text-ios-secondary/60' : 'text-ios-secondary',
                  )}
                  title={d.dateKey}
                >
                  {d.day}
                </th>
              ))}
              <th className="min-w-[72px] px-2 py-3 text-center font-semibold text-ios-secondary">Hours</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.userId} className="border-b border-ios-separator/20 hover:bg-black/[0.02]">
                <td className="sticky left-0 z-10 bg-ios-card px-3 py-2.5 backdrop-blur">
                  <p className="font-medium text-ios-label">{emp.fullName}</p>
                  <p className="text-[11px] text-ios-secondary">{emp.email}</p>
                </td>
                {emp.days.map((day) => {
                  const meta = statusMeta(day.status);
                  return (
                    <td key={day.dateKey} className="px-0.5 py-1 text-center">
                      <button
                        type="button"
                        title={`${day.dateKey}: ${meta.label}${day.workingHours ? ` (${day.workingHours}h)` : ''}`}
                        onClick={() => day.id && onCellClick?.(day, emp)}
                        className={cn(
                          'mx-auto flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-bold transition',
                          day.status ? meta.bg : 'bg-transparent',
                          day.status ? meta.text : 'text-ios-secondary/40',
                          day.id && 'hover:ring-2 hover:ring-ios-blue/30',
                        )}
                        style={day.status ? { borderLeft: `3px solid ${meta.color}` } : undefined}
                      >
                        {cellCode(day.status)}
                      </button>
                    </td>
                  );
                })}
                <td className="px-2 py-2 text-center font-semibold text-ios-label">
                  {emp.summary?.hours?.toFixed?.(1) ?? emp.summary?.hours ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 border-t border-ios-separator/30 bg-ios-bg/40 px-4 py-3">
        {Object.keys(ATTENDANCE_STATUS).map((key) => {
          const meta = statusMeta(key);
          return (
            <span key={key} className="flex items-center gap-1.5 text-[11px] text-ios-secondary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
              {meta.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
