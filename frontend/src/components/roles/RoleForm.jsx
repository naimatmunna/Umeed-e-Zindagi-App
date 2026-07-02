import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roleFormSchema } from '@/schemas/auth.schema.js';
import Input from '@/components/ui/Input.jsx';
import Button from '@/components/ui/Button.jsx';

export default function RoleForm({ initial, onSubmit, onCancel, isLoading }) {
  const isEdit = Boolean(initial?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name ?? '',
        slug: initial.slug ?? '',
        description: initial.description ?? '',
        isActive: initial.isActive ?? true,
      });
    }
  }, [initial, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" id="name" error={errors.name?.message} {...register('name')} />
      <Input
        label="Slug"
        id="slug"
        placeholder="e.g. team_lead"
        error={errors.slug?.message}
        {...register('slug')}
        disabled={isEdit}
      />
      <Input label="Description" id="description" error={errors.description?.message} {...register('description')} />
      {isEdit && (
        <label className="flex min-h-[44px] items-center gap-3 text-[15px] text-ios-label">
          <input type="checkbox" className="h-5 w-5 rounded border-ios-separator text-ios-blue" {...register('isActive')} />
          Active role
        </label>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" isLoading={isLoading}>
          {isEdit ? 'Save changes' : 'Create role'}
        </Button>
      </div>
    </form>
  );
}
