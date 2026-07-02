import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiUsers, FiCheckCircle, FiXCircle, FiClock, FiCalendar } from 'react-icons/fi';
import {
  useGetTodayAttendanceQuery,
  useGetAttendanceQuery,
  useGetAttendanceSummaryQuery,
  useGetAttendanceMatrixQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} from '@/features/attendance/attendanceApi.js';
import { usePermissions } from '@/hooks/usePermissions.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import { currentMonth, formatDate, formatDateTime } from '@/helpers/format.js';
import MonthPicker from '@/components/expenses/MonthPicker.jsx';
import StatCard from '@/components/expenses/StatCard.jsx';
import TodayAttendanceCard from '@/components/attendance/TodayAttendanceCard.jsx';
import AttendanceMatrix from '@/components/attendance/AttendanceMatrix.jsx';
import AttendanceForm from '@/components/attendance/AttendanceForm.jsx';
import StatusBadge from '@/components/attendance/StatusBadge.jsx';
import Table from '@/components/ui/Table.jsx';
import Pagination from '@/components/ui/Pagination.jsx';
import Button from '@/components/ui/Button.jsx';
import Modal from '@/components/ui/Modal.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import PageMeta from '@/components/common/PageMeta.jsx';

export default function Attendance() {
  const { isAdmin } = usePermissions();
  const [month, setMonth] = useState(currentMonth());
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const { data: todayData, isLoading: todayLoading } = useGetTodayAttendanceQuery();
  const { data: summaryData, isLoading: summaryLoading } = useGetAttendanceSummaryQuery({ month });
  const { data: matrixData, isLoading: matrixLoading } = useGetAttendanceMatrixQuery(
    { month },
    { skip: !isAdmin },
  );
  const { data: listData, isLoading: listLoading, isFetching } = useGetAttendanceQuery({
    month,
    page,
    limit: 10,
  });

  const [createAttendance, { isLoading: isCreating }] = useCreateAttendanceMutation();
  const [updateAttendance, { isLoading: isUpdating }] = useUpdateAttendanceMutation();
  const [deleteAttendance, { isLoading: isDeleting }] = useDeleteAttendanceMutation();

  const summary = summaryData?.data;
  const stats = summary?.stats ?? {};
  const records = listData?.data ?? [];
  const totalPages = listData?.meta?.pagination?.totalPages ?? 1;
  const today = todayData?.data;

  const handleSubmit = async (values) => {
    try {
      if (editing?.id) {
        await updateAttendance({ id: editing.id, ...values }).unwrap();
        toast.success('Attendance updated');
      } else {
        await createAttendance(values).unwrap();
        toast.success('Attendance record added');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleCellClick = (day, emp) => {
    if (!day.id) return;
    setEditing({
      id: day.id,
      userId: emp.userId,
      dateKey: day.dateKey,
      status: day.status,
      checkIn: day.checkIn,
      checkOut: day.checkOut,
    });
    setModalOpen(true);
  };

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (r) => (
        <div>
          <p className="font-medium">{r.dateKey}</p>
          {isAdmin && r.user && (
            <p className="text-[12px] text-ios-secondary">{r.user.fullName}</p>
          )}
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'checkIn',
      header: 'Check in',
      render: (r) => (r.checkIn ? formatDateTime(r.checkIn) : '—'),
    },
    {
      key: 'checkOut',
      header: 'Check out',
      render: (r) => (r.checkOut ? formatDateTime(r.checkOut) : '—'),
    },
    {
      key: 'hours',
      header: 'Hours',
      render: (r) => (r.workingHours != null ? `${r.workingHours}h` : '—'),
    },
    ...(isAdmin
      ? [{
          key: 'actions',
          header: '',
          render: (r) => (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setModalOpen(true); }}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => setToDelete(r)}>Delete</Button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <>
      <PageMeta title="Attendance" />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="ios-page-title">Attendance</h1>
          <p className="mt-1 text-[15px] text-ios-secondary">
            {isAdmin ? 'Team attendance overview' : 'Your attendance records'}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <MonthPicker month={month} onChange={(m) => { setMonth(m); setPage(1); }} />
          {isAdmin && (
            <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
              <FiPlus /> Add record
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <TodayAttendanceCard today={today} isLoading={todayLoading} />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Attendance rate"
          value={`${stats.attendanceRate ?? 0}%`}
          sub={`${stats.workingDays ?? 0} working days`}
          icon={FiCheckCircle}
          accent="green"
        />
        <StatCard
          label="Present"
          value={stats.present ?? 0}
          sub={`Late: ${stats.late ?? 0}`}
          icon={FiUsers}
          accent="blue"
        />
        <StatCard
          label="Absent"
          value={stats.absent ?? 0}
          sub={`Leave: ${(stats.leave_paid ?? 0) + (stats.leave_unpaid ?? 0)}`}
          icon={FiXCircle}
          accent="red"
        />
        <StatCard
          label="Total hours"
          value={`${stats.totalHours ?? 0}h`}
          sub={`Avg ${stats.avgHoursPerDay ?? 0}h/day`}
          icon={FiClock}
          accent="orange"
        />
      </div>

      {isAdmin && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-ios-label">Team matrix</h2>
            <span className="text-[13px] text-ios-secondary">
              <FiCalendar className="mr-1 inline" />
              {summary?.monthLabel}
            </span>
          </div>
          <AttendanceMatrix
            data={matrixData?.data}
            isLoading={matrixLoading || summaryLoading}
            onCellClick={handleCellClick}
          />
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-[20px] font-bold text-ios-label">
          {isAdmin ? 'All records' : 'My records'}
        </h2>
      </div>
      <Table
        columns={columns}
        data={records}
        isLoading={listLoading || isFetching}
        emptyLabel="No attendance records this month"
      />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {isAdmin && (
        <>
          <Modal
            open={modalOpen}
            onClose={() => { setModalOpen(false); setEditing(null); }}
            title={editing?.id ? 'Edit attendance' : 'Add attendance record'}
            size="lg"
          >
            <AttendanceForm
              initial={editing}
              onSubmit={handleSubmit}
              onCancel={() => { setModalOpen(false); setEditing(null); }}
              isLoading={isCreating || isUpdating}
            />
          </Modal>
          <ConfirmDialog
            open={Boolean(toDelete)}
            onClose={() => setToDelete(null)}
            onConfirm={async () => {
              try {
                await deleteAttendance(toDelete.id).unwrap();
                toast.success('Record deleted');
                setToDelete(null);
              } catch (err) {
                toast.error(getApiErrorMessage(err));
              }
            }}
            isLoading={isDeleting}
            title="Delete record?"
            message={`Remove attendance for ${toDelete?.dateKey}?`}
            confirmLabel="Delete"
          />
        </>
      )}
    </>
  );
}
