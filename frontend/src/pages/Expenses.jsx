import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrendingUp, FiTrendingDown, FiCreditCard, FiCalendar, FiPieChart, FiDownload } from 'react-icons/fi';
import {
  useGetExpensesQuery,
  useGetExpenseSummaryQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '@/features/expenses/expensesApi.js';
import { useDebounce } from '@/hooks/useDebounce.js';
import { getApiErrorMessage } from '@/helpers/apiError.js';
import { formatCurrency, formatDate, currentMonth, PAYMENT_LABELS } from '@/helpers/format.js';
import MonthPicker from '@/components/expenses/MonthPicker.jsx';
import StatCard from '@/components/expenses/StatCard.jsx';
import CategoryDonutChart from '@/components/expenses/CategoryDonutChart.jsx';
import DailyBarChart from '@/components/expenses/DailyBarChart.jsx';
import TrendLineChart from '@/components/expenses/TrendLineChart.jsx';
import ExpenseForm from '@/components/expenses/ExpenseForm.jsx';
import Table from '@/components/ui/Table.jsx';
import Pagination from '@/components/ui/Pagination.jsx';
import SearchInput from '@/components/ui/SearchInput.jsx';
import Button from '@/components/ui/Button.jsx';
import Modal from '@/components/ui/Modal.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import Select from '@/components/ui/Select.jsx';
import PageMeta from '@/components/common/PageMeta.jsx';
import { useGetCategoriesQuery } from '@/features/categories/categoriesApi.js';
import { downloadExpenseReportPdf } from '@/lib/downloadReport.js';

export default function Expenses() {
  const [tab, setTab] = useState('dashboard'); // dashboard | transactions
  const [month, setMonth] = useState(currentMonth());
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const debouncedSearch = useDebounce(search);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [exporting, setExporting] = useState(false);

  const { data: summaryData, isLoading: summaryLoading, isFetching: summaryFetching } =
    useGetExpenseSummaryQuery({ month });
  const { data: expensesData, isLoading, isFetching } = useGetExpensesQuery({
    page,
    limit: 10,
    month,
    search: debouncedSearch || undefined,
    categoryId: categoryFilter || undefined,
  });
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100, activeOnly: 'true' });

  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const summary = summaryData?.data;
  const expenses = expensesData?.data ?? [];
  const categories = categoriesData?.data ?? [];
  const totalPages = expensesData?.meta?.pagination?.totalPages ?? 1;

  const change = summary?.previousMonth?.changePercent ?? 0;
  const changeLabel =
    change === 0
      ? 'Same as last month'
      : `${change > 0 ? '+' : ''}${change}% vs last month`;

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (expense) => {
    setEditing(expense);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateExpense({ id: editing.id, ...values }).unwrap();
        toast.success('Expense updated');
      } else {
        await createExpense(values).unwrap();
        toast.success('Expense added');
      }
      closeModal();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteExpense(toDelete.id).unwrap();
      toast.success('Expense deleted');
      setToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await downloadExpenseReportPdf({
        month,
        categoryId: categoryFilter || undefined,
      });
      toast.success('PDF report downloaded');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Expense',
      render: (e) => (
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: e.category?.color ?? '#8E8E93' }}
          />
          <div>
            <p className="font-medium text-ios-label">{e.title}</p>
            <p className="text-[12px] text-ios-secondary">{e.category?.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (e) => <span className="font-semibold">{formatCurrency(e.amount)}</span>,
    },
    { key: 'date', header: 'Date', render: (e) => formatDate(e.date) },
    {
      key: 'payment',
      header: 'Payment',
      render: (e) => PAYMENT_LABELS[e.paymentMethod] ?? e.paymentMethod,
    },
    {
      key: 'actions',
      header: '',
      render: (e) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(e)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setToDelete(e)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Expenses" />

      <div className="brand-page-header">
        <div>
          <h1 className="ios-page-title">Expenses</h1>
          <p className="ios-page-subtitle">Track spending month by month</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <MonthPicker month={month} onChange={(m) => { setMonth(m); setPage(1); }} />
          <Button variant="secondary" onClick={handleExportPdf} isLoading={exporting} className="shrink-0">
            <FiDownload /> Export PDF
          </Button>
          <Button onClick={openCreate} className="shrink-0">
            <FiPlus className="text-lg" /> Add expense
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-ios-lg border border-ios-separator/30 bg-ios-card p-2 shadow-ios">
        <button
          type="button"
          onClick={() => setTab('dashboard')}
          className={`rounded-ios px-4 py-2 text-[13px] font-semibold transition ${
            tab === 'dashboard' ? 'bg-brand-forestLight text-brand-forestDark' : 'text-ios-secondary hover:bg-ios-bg'
          }`}
        >
          Expense dashboard
        </button>
        <button
          type="button"
          onClick={() => setTab('transactions')}
          className={`rounded-ios px-4 py-2 text-[13px] font-semibold transition ${
            tab === 'transactions' ? 'bg-brand-forestLight text-brand-forestDark' : 'text-ios-secondary hover:bg-ios-bg'
          }`}
        >
          Transactions
        </button>
      </div>

      {tab === 'dashboard' && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total spent"
              value={formatCurrency(summary?.totalAmount ?? 0)}
              sub={changeLabel}
              trend={change}
              icon={FiCreditCard}
              accent="blue"
            />
            <StatCard
              label="Transactions"
              value={summary?.expenseCount ?? 0}
              sub="This month"
              icon={FiPieChart}
              accent="purple"
            />
            <StatCard
              label="Daily average"
              value={formatCurrency(summary?.avgPerDay ?? 0)}
              sub="Across month"
              icon={FiCalendar}
              accent="orange"
            />
            <StatCard
              label="Month change"
              value={`${change > 0 ? '+' : ''}${change}%`}
              sub={formatCurrency(summary?.previousMonth?.changeAmount ?? 0)}
              icon={change > 0 ? FiTrendingUp : FiTrendingDown}
              accent={change > 0 ? 'red' : 'green'}
            />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <CategoryDonutChart
              data={summary?.byCategory ?? []}
              isLoading={summaryLoading || summaryFetching}
            />
            <DailyBarChart
              data={summary?.byDay ?? []}
              isLoading={summaryLoading || summaryFetching}
            />
          </div>

          <div className="mb-8">
            <TrendLineChart
              data={summary?.trend ?? []}
              isLoading={summaryLoading || summaryFetching}
            />
          </div>
        </>
      )}

      {tab === 'transactions' && (
        <>
          <div className="brand-filter-bar mb-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[18px] font-bold text-ios-label">Transactions</h2>
              <Button size="sm" onClick={openCreate} className="shrink-0">
                <FiPlus /> Add expense
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
              <SearchInput
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search expenses…"
                className="lg:col-span-2"
              />
            </div>
          </div>

          <Table columns={columns} data={expenses} isLoading={isLoading || isFetching} emptyLabel="No expenses this month" />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit expense' : 'New expense'} size="lg">
        <ExpenseForm
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
        title="Delete expense?"
        message={`Remove "${toDelete?.title}" (${formatCurrency(toDelete?.amount)})?`}
        confirmLabel="Delete"
      />
    </>
  );
}
