import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { userFormSchema } from '@/schemas/auth.schema.js';
import { useGetRolesQuery } from '@/features/roles/rolesApi.js';
import Input from '@/components/ui/Input.jsx';
import Select from '@/components/ui/Select.jsx';
import Button from '@/components/ui/Button.jsx';

const toDateInput = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
};

export default function UserForm({ initial, onSubmit, onCancel, isLoading }) {
  const { data: rolesData } = useGetRolesQuery({ limit: 100, activeOnly: 'true' });
  const roles = rolesData?.data ?? [];
  const isEdit = Boolean(initial?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      joiningDate: toDateInput(),
      salary: 0,
      roleId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        firstName: initial.firstName ?? '',
        lastName: initial.lastName ?? '',
        email: initial.email ?? '',
        password: '',
        joiningDate: toDateInput(initial.joiningDate),
        salary: initial.salary ?? 0,
        roleId: initial.roleId ?? initial.role?.id ?? '',
        isActive: initial.isActive ?? true,
      });
    }
  }, [initial, reset]);

  const submit = (values) => {
    if (!isEdit && !values.password) {
      toast.error('Password is required');
      return;
    }
    const payload = { ...values };
    if (isEdit && !payload.password) delete payload.password;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="First name" id="firstName" error={errors.firstName?.message} {...register('firstName')} />
        <Input label="Last name" id="lastName" error={errors.lastName?.message} {...register('lastName')} />
      </div>
      <Input label="Email" type="email" id="email" error={errors.email?.message} {...register('email')} disabled={isEdit} />
      <Input
        label={isEdit ? 'New password (optional)' : 'Password'}
        type="password"
        id="password"
        error={errors.password?.message}
        {...register('password')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Joining date" type="date" id="joiningDate" error={errors.joiningDate?.message} {...register('joiningDate')} />
        <Input label="Salary" type="number" min="0" step="0.01" id="salary" error={errors.salary?.message} {...register('salary')} />
      </div>
      <Select label="Role" id="roleId" error={errors.roleId?.message} {...register('roleId')}>
        <option value="">Select a role</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </Select>
      {isEdit && (
        <label className="flex min-h-[44px] items-center gap-3 text-[15px] text-ios-label">
          <input type="checkbox" className="h-5 w-5 rounded border-ios-separator text-ios-blue" {...register('isActive')} />
          Active account
        </label>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" isLoading={isLoading}>
          {isEdit ? 'Save changes' : 'Create user'}
        </Button>
      </div>
    </form>
  );
}
