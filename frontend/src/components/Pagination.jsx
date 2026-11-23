const Pagination = ({ page, pages, onPageChange }) => {
  if (!pages || pages <= 1) {
    return null;
  }

  const pageNumbers = Array.from({ length: pages }, (_, idx) => idx + 1);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      {pageNumbers.map((num) => {
        const isActive = num === page;
        return (
          <button
            key={num}
            type="button"
            onClick={() => onPageChange(num)}
            className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
              isActive
                ? "bg-indigo-600 text-white shadow-xs"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {num}
          </button>
        );
      })}

      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
