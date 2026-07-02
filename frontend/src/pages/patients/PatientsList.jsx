import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  useGetPatientsQuery,
  useDeletePatientMutation,
} from '@/features/patients/patientsApi.js';
import { useDebounce } from '@/hooks/useDebounce.js';
import { ROUTES } from '@/constants';
import { PATIENT_STATUSES, GENDERS, ADMISSION_TYPES } from '@/constants/patient.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import { formatDate } from '@/helpers/format.js';
import PageMeta from '@/components/common/PageMeta.jsx';
import PatientStatusBadge from '@/components/patients/PatientStatusBadge.jsx';
import Table from '@/components/ui/Table.jsx';
import Pagination from '@/components/ui/Pagination.jsx';
import SearchInput from '@/components/ui/SearchInput.jsx';
import Select from '@/components/ui/Select.jsx';
import Input from '@/components/ui/Input.jsx';
import Button from '@/components/ui/Button.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';

export default function PatientsList() {
  const { t } = useTranslation('patient');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [admissionType, setAdmissionType] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isFetching } = useGetPatientsQuery({
    page,
    limit: 15,
    search: debouncedSearch || undefined,
    status: status || undefined,
    gender: gender || undefined,
    city: city || undefined,
    admissionType: admissionType || undefined,
    sort: '-admissionDate',
  });

  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation();

  const patients = data?.data ?? [];
  const total = data?.meta?.pagination?.total ?? patients.length;
  const totalPages = data?.meta?.pagination?.totalPages ?? 1;

  const confirmDelete = async () => {
    try {
      await deletePatient(toDelete.id).unwrap();
      toast.success(t('messages.deleted'));
      setToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const columns = [
    {
      key: 'photo',
      header: '',
      className: 'w-14',
      cellClassName: 'w-14',
      nowrap: true,
      render: (p) => (
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-forestLight text-[13px] font-bold text-brand-forest ring-2 ring-white">
          {p.profilePhoto?.url ? (
            <img src={p.profilePhoto.url} alt="" className="h-full w-full object-cover" />
          ) : (
            (p.firstName?.[0] ?? '?').toUpperCase()
          )}
        </div>
      ),
    },
    {
      key: 'patientId',
      header: 'Patient ID',
      render: (p) => <span className="font-mono text-[13px] font-semibold text-brand-forestDark">{p.patientId}</span>,
    },
    { key: 'admissionNumber', header: 'Admission #', render: (p) => p.admissionNumber ?? '—' },
    {
      key: 'name',
      header: 'Name',
      nowrap: false,
      cellClassName: 'min-w-[140px] max-w-[220px]',
      render: (p) => (
        <span className="font-semibold leading-snug">
          {p.fullName ?? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()}
        </span>
      ),
    },
    { key: 'cnic', header: 'CNIC', render: (p) => p.cnic ?? '—' },
    { key: 'phone', header: 'Phone', render: (p) => p.phone ?? '—' },
    {
      key: 'guardian',
      header: 'Guardian',
      nowrap: false,
      cellClassName: 'max-w-[160px]',
      render: (p) => <span className="text-ios-secondary">{p.guardian?.guardianName ?? '—'}</span>,
    },
    { key: 'admissionDate', header: 'Admission', render: (p) => formatDate(p.admissionDate) || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <PatientStatusBadge status={p.status} label={t(`status.${p.status}`)} />,
    },
    {
      key: 'actions',
      header: tc('actions'),
      align: 'right',
      className: 'text-right',
      cellClassName: 'text-right',
      nowrap: true,
      render: (p) => (
        <div className="inline-flex items-center gap-0.5">
          <Button
            size="sm"
            variant="ghost"
            aria-label="View"
            onClick={() => navigate(ROUTES.PATIENT_DETAIL.replace(':id', p.id))}
          >
            <FiEye />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Edit"
            onClick={() => navigate(ROUTES.PATIENT_EDIT.replace(':id', p.id))}
          >
            <FiEdit2 />
          </Button>
          <Button size="sm" variant="danger" aria-label="Delete" onClick={() => setToDelete(p)}>
            <FiTrash2 />
          </Button>
        </div>
      ),
    },
  ];

  const hasFilters = Boolean(status || gender || city || admissionType || search);
  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setGender('');
    setCity('');
    setAdmissionType('');
    setPage(1);
  };

  return (
    <>
      <PageMeta title={t('moduleTitle')} />

      <div className="brand-page-header">
        <div>
          <h1 className="ios-page-title">{t('moduleTitle')}</h1>
          <p className="ios-page-subtitle">{t('moduleSubtitle')}</p>
        </div>
        <Link to={ROUTES.PATIENT_NEW} className="shrink-0">
          <Button size="lg">
            <FiPlus className="text-lg" /> {t('addPatient')}
          </Button>
        </Link>
      </div>

      <div className="brand-filter-bar mb-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-brand-forestDark">
            <FiFilter aria-hidden />
            Filters
          </div>
          {hasFilters && (
            <div className="flex items-center gap-3">
              <p className="text-[13px] text-ios-secondary">
                Showing filtered results · {total} record{total !== 1 ? 's' : ''}
              </p>
              <Button size="sm" variant="secondary" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder={`${tc('search')} patients…`}
            className="xl:col-span-2"
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            aria-label={t('filters.status')}
          >
            <option value="">{t('filters.status')}</option>
            {PATIENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </Select>
          <Select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t('filters.gender')}</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
          <Select
            value={admissionType}
            onChange={(e) => {
              setAdmissionType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t('filters.admissionType')}</option>
            {ADMISSION_TYPES.map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
          <Input
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            placeholder={t('filters.city')}
            aria-label={t('filters.city')}
          />
        </div>
      </div>

      <Table columns={columns} data={patients} isLoading={isLoading || isFetching} emptyLabel={t('empty')} />

      <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete patient?"
        message={`Remove ${toDelete?.fullName ?? 'this patient'}? This cannot be undone.`}
        confirmLabel={tc('delete')}
      />
    </>
  );
}
