import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/features/categories/categoriesApi.js';
import { useDebounce } from '@/hooks/useDebounce.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import Table from '@/components/ui/Table.jsx';
import Pagination from '@/components/ui/Pagination.jsx';
import SearchInput from '@/components/ui/SearchInput.jsx';
import Button from '@/components/ui/Button.jsx';
import Modal from '@/components/ui/Modal.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import CategoryForm from '@/components/categories/CategoryForm.jsx';
import PageMeta from '@/components/common/PageMeta.jsx';

export default function Categories() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const { data, isLoading, isFetching } = useGetCategoriesQuery({ page, limit: 10, search: debouncedSearch || undefined });
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const categories = data?.data ?? [];
  const totalPages = data?.meta?.pagination?.totalPages ?? 1;

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateCategory({ id: editing.id, ...values }).unwrap();
        toast.success('Category updated');
      } else {
        await createCategory(values).unwrap();
        toast.success('Category created');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Category',
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} />
          <span className="font-medium">{c.name}</span>
        </div>
      ),
    },
    { key: 'slug', header: 'Slug' },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <span className={c.isActive ? 'text-ios-green' : 'text-ios-secondary'}>
          {c.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (c) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => { setEditing(c); setModalOpen(true); }}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => setToDelete(c)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Categories" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="ios-page-title">Categories</h1>
          <p className="mt-1 text-[15px] text-ios-secondary">Organize your spending</p>
        </div>
        <div className="flex gap-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <FiPlus /> Add
          </Button>
        </div>
      </div>
      <Table columns={columns} data={categories} isLoading={isLoading || isFetching} />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit category' : 'New category'}>
        <CategoryForm key={editing?.id ?? 'new'} initial={editing} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} isLoading={isCreating || isUpdating} />
      </Modal>
      <ConfirmDialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={async () => {
        try {
          await deleteCategory(toDelete.id).unwrap();
          toast.success('Category deleted');
          setToDelete(null);
        } catch (err) {
          toast.error(getApiErrorMessage(err));
        }
      }} isLoading={isDeleting} title="Delete category?" message={`Remove "${toDelete?.name}"?`} confirmLabel="Delete" />
    </>
  );
}
