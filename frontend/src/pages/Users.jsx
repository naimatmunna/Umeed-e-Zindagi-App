import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/features/users/usersApi.js';
import { useDebounce } from '@/hooks/useDebounce.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import { formatDate, formatCurrency } from '@/helpers/format.js';
import Table from '@/components/ui/Table.jsx';
import Pagination from '@/components/ui/Pagination.jsx';
import SearchInput from '@/components/ui/SearchInput.jsx';
import Button from '@/components/ui/Button.jsx';
import Modal from '@/components/ui/Modal.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import UserForm from '@/components/users/UserForm.jsx';
import PageMeta from '@/components/common/PageMeta.jsx';

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const { data, isLoading, isFetching } = useGetUsersQuery({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = data?.data ?? [];
  const totalPages = data?.meta?.pagination?.totalPages ?? 1;

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateUser({ id: editing.id, ...values }).unwrap();
        toast.success('User updated');
      } else {
        await createUser(values).unwrap();
        toast.success('User created');
      }
      closeModal();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(toDelete.id).unwrap();
      toast.success('User deleted');
      setToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (u) => u.fullName ?? `${u.firstName} ${u.lastName}`,
    },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (u) => u.role?.name ?? '—' },
    { key: 'salary', header: 'Salary', render: (u) => formatCurrency(u.salary) },
    { key: 'joiningDate', header: 'Joined', render: (u) => formatDate(u.joiningDate) },
    {
      key: 'actions',
      header: '',
      render: (u) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setToDelete(u)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Users" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="ios-page-title">Users</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
          <Button onClick={openCreate} className="shrink-0">
            <FiPlus className="text-lg" /> Add user
          </Button>
        </div>
      </div>

      <Table columns={columns} data={users} isLoading={isLoading || isFetching} emptyLabel="No users yet" />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit user' : 'New user'}
        size="lg"
      >
        <UserForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isLoading={isCreating || isUpdating}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete user?"
        message={`This will permanently remove ${toDelete?.fullName ?? toDelete?.firstName}.`}
        confirmLabel="Delete"
      />
    </>
  );
}
