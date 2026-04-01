export default function Web_LantekProjectForm({
  projectInfo,
  shipmentDateError,
  onChange,
  onOpenHistory,
}) {
  return (
    <section className="relative bg-surface-container-lowest p-8 pb-16 rounded-xl shadow-sm border border-outline-variant/10">
      <div className="grid grid-cols-12 gap-x-8 gap-y-6">
        <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            프로젝트 명
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm"
              value={projectInfo.projectName}
              placeholder="프로젝트를 입력하세요"
              readOnly
            />
            <button
              type="button"
              onClick={onOpenHistory}
              className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg text-xs font-bold whitespace-nowrap"
            >
              이력 조회
            </button>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            프로젝트 최종 납기일
          </label>
          <input
            className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm"
            value={projectInfo.projectDueDate}
            readOnly
          />
        </div>

        <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            생산계획명
          </label>
          <input
            className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm"
            value={projectInfo.productionPlanName}
            readOnly
          />
        </div>

        <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
            이번 생산 계획 출하일
            <span className="text-error text-lg leading-none">*</span>
          </label>
          <div>
            <input
              type="date"
              className={`w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm ${
                shipmentDateError ? "ring-2 ring-error/40" : ""
              }`}
              value={projectInfo.shipmentDate}
              onChange={(e) => onChange("shipmentDate", e.target.value)}
            />
            {shipmentDateError && (
              <p className="mt-2 text-xs text-error">{shipmentDateError}</p>
            )}
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            설비 명
          </label>
          <input
            className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm"
            value={projectInfo.equipmentName}
            onChange={(e) => onChange("equipmentName", e.target.value)}
          />
        </div>

        <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            공정 중요도
          </label>
          <select
            className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm"
            value={projectInfo.processPriority}
            onChange={(e) => onChange("processPriority", e.target.value)}
          >
            <option value="low">일반</option>
            <option value="urgent">긴급</option>
          </select>
        </div>
      </div>

      <p className="absolute right-8 bottom-4 text-xs text-on-surface-variant text-right">
        <span className="text-red-500">*</span>는 필수 입력 사항입니다.
      </p>
    </section>
  );
}
