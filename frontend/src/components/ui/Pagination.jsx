import Button from './Button.jsx';

export default function Pagination({ page, totalPages, total, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-ios-lg border border-ios-separator/40 bg-ios-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-[14px] text-ios-secondary">
        {typeof total === 'number' ? (
          <>
            <span className="font-semibold text-ios-label">{total}</span> total records · Page{' '}
            <span className="font-semibold text-ios-label">{page}</span> of {totalPages}
          </>
        ) : (
          <>
            Page <span className="font-semibold text-ios-label">{page}</span> of {totalPages}
          </>
        )}
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
