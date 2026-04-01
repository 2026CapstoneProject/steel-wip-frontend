export default function Web_Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        <span className="material-symbols-outlined text-sm">chevron_left</span>
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={
            page === currentPage
              ? "w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-xs"
              : "w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-on-surface text-xs"
          }
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  );
}
