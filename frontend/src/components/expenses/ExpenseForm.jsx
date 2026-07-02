import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseFormSchema } from '@/schemas/expense.schema.js';
import { useGetCategoriesQuery } from '@/features/categories/categoriesApi.js';
import Input from '@/components/ui/Input.jsx';
import Select from '@/components/ui/Select.jsx';
import Button from '@/components/ui/Button.jsx';

const toDateInput = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
};

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'mobile_wallet', label: 'Mobile wallet' },
  { value: 'other', label: 'Other' },
];

export default function ExpenseForm({ initial, onSubmit, onCancel, isLoading }) {
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100, activeOnly: 'true' });
  const categories = categoriesData?.data ?? [];
  const isEdit = Boolean(initial?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: '',
      amount: '',
      description: '',
      date: toDateInput(),
      categoryId: '',
      paymentMethod: 'cash',
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        title: initial.title ?? '',
        amount: initial.amount ?? '',
        description: initial.description ?? '',
        date: toDateInput(initial.date),
        categoryId: initial.categoryId ?? initial.category?.id ?? '',
        paymentMethod: initial.paymentMethod ?? 'cash',
      });
    }
  }, [initial, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Title" id="title" error={errors.title?.message} {...register('title')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Amount (PKR)"
          type="number"
          min="1"
          step="1"
          id="amount"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <Input label="Date" type="date" id="date" error={errors.date?.message} {...register('date')} />
      </div>
      <Select label="Category" id="categoryId" error={errors.categoryId?.message} {...register('categoryId')}>
        <option value="">Select category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </Select>
      <Select label="Payment method" id="paymentMethod" error={errors.paymentMethod?.message} {...register('paymentMethod')}>
        {PAYMENT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      <Input label="Notes (optional)" id="description" error={errors.description?.message} {...register('description')} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" isLoading={isLoading}>
          {isEdit ? 'Save expense' : 'Add expense'}
        </Button>
      </div>
    </form>
  );
}
