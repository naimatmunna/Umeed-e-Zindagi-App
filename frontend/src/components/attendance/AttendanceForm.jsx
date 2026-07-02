import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetUsersQuery } from '@/features/users/usersApi.js';
import Input from '@/components/ui/Input.jsx';
import Select from '@/components/ui/Select.jsx';
import Button from '@/components/ui/Button.jsx';
import { STATUS_OPTIONS } from '@/helpers/attendance.js';

const schema = z.object({
  userId: z.string().min(1, 'Employee is required'),
  dateKey: z.string().min(1, 'Date is required'),
  status: z.string().min(1, 'Status is required'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  notes: z.string().max(500).optional(),
  leaveReason: z.string().max(280).optional(),
});

const toLocalInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AttendanceForm({ initial, onSubmit, onCancel, isLoading }) {
  const isEdit = Boolean(initial?.id);
  const { data: usersData } = useGetUsersQuery({ limit: 100 });
  const users = usersData?.data ?? [];

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: '',
      dateKey: new Date().toISOString().slice(0, 10),
      status: 'present',
      checkIn: '',
      checkOut: '',
      notes: '',
      leaveReason: '',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (initial) {
      reset({
        userId: initial.userId ?? initial.user?.id ?? '',
        dateKey: initial.dateKey ?? '',
        status: initial.status ?? 'present',
        checkIn: toLocalInput(initial.checkIn),
        checkOut: toLocalInput(initial.checkOut),
        notes: initial.notes ?? '',
        leaveReason: initial.leaveReason ?? '',
      });
    }
  }, [initial, reset]);

  const submit = (values) => {
    const payload = { ...values };
    if (payload.checkIn) payload.checkIn = new Date(payload.checkIn).toISOString();
    else delete payload.checkIn;
    if (payload.checkOut) payload.checkOut = new Date(payload.checkOut).toISOString();
    else delete payload.checkOut;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {!isEdit && (
        <Select label="Employee" id="userId" error={errors.userId?.message} {...register('userId')}>
          <option value="">Select employee</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName ?? `${u.firstName} ${u.lastName}`}
            </option>
          ))}
        </Select>
      )}
      <Input label="Date" type="date" id="dateKey" error={errors.dateKey?.message} {...register('dateKey')} disabled={isEdit} />
      <Select label="Status" id="status" error={errors.status?.message} {...register('status')}>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>
      {['present', 'late', 'half_day'].includes(status) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Check in" type="datetime-local" id="checkIn" {...register('checkIn')} />
          <Input label="Check out" type="datetime-local" id="checkOut" {...register('checkOut')} />
        </div>
      )}
      {status?.includes('leave') && (
        <Input label="Leave reason" id="leaveReason" error={errors.leaveReason?.message} {...register('leaveReason')} />
      )}
      <Input label="Notes" id="notes" error={errors.notes?.message} {...register('notes')} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" isLoading={isLoading}>{isEdit ? 'Save' : 'Add record'}</Button>
      </div>
    </form>
  );
}
