import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/features/roles/rolesApi.js';
import { useDebounce } from '@/hooks/useDebounce.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import Table from '@/components/ui/Table.jsx';
import Pagination from '@/components/ui/Pagination.jsx';
import SearchInput from '@/components/ui/SearchInput.jsx';
import Button from '@/components/ui/Button.jsx';
import Modal from '@/components/ui/Modal.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import RoleForm from '@/components/roles/RoleForm.jsx';
import PageMeta from '@/components/common/PageMeta.jsx';

export default function Roles() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const { data, isLoading, isFetching } = useGetRolesQuery({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const roles = data?.data ?? [];
  const totalPages = data?.meta?.pagination?.totalPages ?? 1;

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (role) => {
    setEditing(role);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateRole({ id: editing.id, ...values }).unwrap();
        toast.success('Role updated');
      } else {
        await createRole(values).unwrap();
        toast.success('Role created');
      }
      closeModal();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteRole(toDelete.id).unwrap();
      toast.success('Role deleted');
      setToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'slug', header: 'Slug' },
    { key: 'description', header: 'Description', render: (r) => r.description || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={r.isActive ? 'text-ios-green' : 'text-ios-secondary'}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setToDelete(r)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Roles" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="ios-page-title">Roles</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
          <Button onClick={openCreate} className="shrink-0">
            <FiPlus className="text-lg" /> Add role
          </Button>
        </div>
      </div>

      <Table columns={columns} data={roles} isLoading={isLoading || isFetching} emptyLabel="No roles yet" />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit role' : 'New role'}
      >
        <RoleForm
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
        title="Delete role?"
        message={`This will permanently remove the "${toDelete?.name}" role.`}
        confirmLabel="Delete"
      />
    </>
  );
}
