import { FiLogIn, FiLogOut, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCheckInMutation, useCheckOutMutation } from '@/features/attendance/attendanceApi.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import { formatDateTime } from '@/helpers/format.js';
import StatusBadge from './StatusBadge.jsx';
import Button from '@/components/ui/Button.jsx';

export default function TodayAttendanceCard({ today, isLoading }) {
  const [checkIn, { isLoading: checkingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: checkingOut }] = useCheckOutMutation();

  if (isLoading) {
    return (
      <div className="ios-grouped animate-pulse p-6">
        <div className="h-24 rounded-ios bg-ios-bg" />
      </div>
    );
  }

  const handleCheckIn = async () => {
    try {
      await checkIn({}).unwrap();
      toast.success('Checked in successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut({}).unwrap();
      toast.success('Checked out successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const office = today?.office;
  const isOffDay = today?.isOffDay;

  return (
    <div className="ios-grouped overflow-hidden">
      <div className="border-b border-ios-separator/30 bg-gradient-to-r from-ios-blue/10 to-transparent p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-wide text-ios-secondary">Today</p>
            <h2 className="mt-1 text-[22px] font-bold text-ios-label">
              {today?.dateKey ?? '—'}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={today?.status ?? (isOffDay ? 'weekend' : undefined)} />
              {today?.workingHours != null && (
                <span className="text-[13px] text-ios-secondary">
                  {today.workingHours}h worked
                </span>
              )}
            </div>
          </div>
          {!isOffDay && (
            <div className="flex gap-3">
              <Button
                onClick={handleCheckIn}
                disabled={!today?.canCheckIn}
                isLoading={checkingIn}
                className="min-w-[130px]"
              >
                <FiLogIn /> Check in
              </Button>
              <Button
                variant="secondary"
                onClick={handleCheckOut}
                disabled={!today?.canCheckOut}
                isLoading={checkingOut}
                className="min-w-[130px]"
              >
                <FiLogOut /> Check out
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-px bg-ios-separator/30 sm:grid-cols-3">
        <div className="bg-ios-card p-4">
          <p className="text-[12px] text-ios-secondary">Office hours</p>
          <p className="mt-1 flex items-center gap-1.5 text-[15px] font-semibold text-ios-label">
            <FiClock className="text-ios-blue" />
            {office?.workStartTime} – {office?.workEndTime}
          </p>
        </div>
        <div className="bg-ios-card p-4">
          <p className="text-[12px] text-ios-secondary">Check in</p>
          <p className="mt-1 text-[15px] font-semibold text-ios-label">
            {today?.checkIn ? formatDateTime(today.checkIn) : '—'}
          </p>
        </div>
        <div className="bg-ios-card p-4">
          <p className="text-[12px] text-ios-secondary">Check out</p>
          <p className="mt-1 text-[15px] font-semibold text-ios-label">
            {today?.checkOut ? formatDateTime(today.checkOut) : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
