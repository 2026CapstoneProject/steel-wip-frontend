import Web_WipTable from "../Web_WipTable/Web_WipTable";
import Web_Pagination from "../../common/Web_Pagination/Web_Pagination";

export default function Web_InventoryTableSection({
  rows,
  totalCount,
  currentPage,
  onPageChange,
}) {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 flex justify-between items-center bg-surface-container-low">
        <div className="flex items-center gap-4">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            재고 리스트
          </h3>
          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold">
            {totalCount} Items
          </span>
        </div>
      </div>

      <Web_WipTable rows={rows} />

      <div className="p-6 border-t border-slate-200/20 bg-surface-container-low/30 flex justify-between items-center">
        <Web_Pagination
          currentPage={currentPage}
          totalPages={3}
          onPageChange={onPageChange}
        />
      </div>
    </section>
  );
}
