import Web_LantekAccordionItem from "../Web_LantekAccordionItem/Web_LantekAccordionItem";

export default function Web_LantekDetailSection({
  rows,
  isResetDisabled,
  isImportDisabled,
  onReset,
  onImport,
}) {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-headline font-bold text-on-surface">
          입력 데이터 상세
        </h3>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isResetDisabled}
            onClick={onReset}
            className={`px-6 py-2.5 rounded-xl font-medium border ${
              isResetDisabled
                ? "text-on-surface-variant bg-surface-container border-outline-variant/10 opacity-50 cursor-not-allowed"
                : "text-on-surface-variant bg-surface-container border-outline-variant/10"
            }`}
          >
            초기화
          </button>

          <button
            type="button"
            disabled={isImportDisabled}
            onClick={onImport}
            className={`px-6 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-2 transition-all ${
              isImportDisabled
                ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-primary to-primary-dim text-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              file_upload
            </span>
            LANTEK Import
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-10 text-center text-on-surface-variant">
          업로드된 LANTEK 결과가 없습니다.
        </div>
      ) : (
        rows.map((row, index) => (
          <Web_LantekAccordionItem
            key={row.id ?? index}
            index={index}
            row={row}
          />
        ))
      )}
    </section>
  );
}
