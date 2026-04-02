export default function Web_ScenarioSummaryPanel({ summary }) {
  return (
    <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl border-0 shadow-[0_40px_40px_-20px_rgba(42,52,57,0.06)]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
            Scenario ID
          </span>
          <h3 className="text-2xl font-extrabold text-on-surface mt-1 font-headline">
            {summary.scenarioId}
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
          <span className="text-sm text-on-surface-variant">프로젝트 명</span>
          <span className="text-sm font-bold">{summary.projectName}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
          <span className="text-sm text-on-surface-variant">생산계획명</span>
          <span className="text-sm font-bold">
            {summary.productionPlanName}
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-on-surface-variant">
            생산계획 출하일
          </span>
          <span className="text-sm font-bold text-indigo-600">
            {summary.shipmentDate}
          </span>
        </div>
      </div>
    </div>
  );
}
