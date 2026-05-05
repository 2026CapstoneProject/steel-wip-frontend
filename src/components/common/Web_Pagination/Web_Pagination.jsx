export default function Web_Pagination({
	currentPage,
	totalPages,
	onPageChange,
}) {
	const MAX_VISIBLE_PAGES = 5;

	const startPage = Math.max(
		1,
		Math.min(
			currentPage - Math.floor(MAX_VISIBLE_PAGES / 2),
			totalPages - MAX_VISIBLE_PAGES + 1,
		),
	);
	const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

	const pages = Array.from(
		{ length: endPage - startPage + 1 },
		(_, index) => startPage + index,
	);

	const handlePrevClick = (event) => {
		event.preventDefault();
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNextClick = (event) => {
		event.preventDefault();
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	};

	const handlePageClick = (event, page) => {
		event.preventDefault();
		onPageChange(page);
	};

	return (
		<div className="flex gap-2">
			<button
				type="button"
				className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
				onClick={handlePrevClick}
				disabled={currentPage === 1}
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
					onClick={(event) => handlePageClick(event, page)}
				>
					{page}
				</button>
			))}

			<button
				type="button"
				className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
				onClick={handleNextClick}
				disabled={currentPage === totalPages}
			>
				<span className="material-symbols-outlined text-sm">chevron_right</span>
			</button>
		</div>
	);
}
