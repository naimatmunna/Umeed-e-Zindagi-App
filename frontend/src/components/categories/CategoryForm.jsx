import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryFormSchema } from '@/schemas/expense.schema.js';
import Input from '@/components/ui/Input.jsx';
import Button from '@/components/ui/Button.jsx';

export default function CategoryForm({ initial, onSubmit, onCancel, isLoading }) {
  const isEdit = Boolean(initial?.id);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', slug: '', color: '#007AFF', icon: 'tag', isActive: true },
  });

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name ?? '',
        slug: initial.slug ?? '',
        color: initial.color ?? '#007AFF',
        icon: initial.icon ?? 'tag',
        isActive: initial.isActive ?? true,
      });
    }
  }, [initial, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" id="name" error={errors.name?.message} {...register('name')} />
      <Input label="Slug" id="slug" error={errors.slug?.message} {...register('slug')} disabled={isEdit} />
      <Input label="Color" id="color" type="color" error={errors.color?.message} {...register('color')} className="h-12 p-1" />
      {isEdit && (
        <label className="flex min-h-[44px] items-center gap-3 text-[15px] text-ios-label">
          <input type="checkbox" className="h-5 w-5 rounded border-ios-separator text-ios-blue" {...register('isActive')} />
          Active category
        </label>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" isLoading={isLoading}>{isEdit ? 'Save' : 'Create'}</Button>
      </div>
    </form>
  );
}
