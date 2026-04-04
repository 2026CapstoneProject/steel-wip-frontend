import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

const mockReadyData = {
  summary: {
    progressPercent: 50,
    remainingTaskCount: 10,
    remainingWorkMinutes: 345,
  },
  taskGroups: [
    {
      taskId: "task-01",
      taskName: "Task 01",
      relocations: [
        {
          relocationId: "rel-01",
          materialName: "SM355A",
          fromZone: "Zone A-1",
          toZone: "Zone B-2",
          durationMinutes: 11,
          qrEnabled: true,
          completed: false,
        },
        {
          relocationId: "rel-02",
          materialName: "SS275",
          fromZone: "Zone B-1",
          toZone: "Zone C-1",
          durationMinutes: 7,
          qrEnabled: true,
          completed: false,
        },
      ],
      pickings: [
        {
          pickingId: "pick-01",
          pickingName: "Picking 1",
          materialType: "잔재",
          materialName: "SM355A",
          currentZone: "Zone C-4",
          durationMinutes: 4,
          hasWorkOrder: true,
          qrEnabled: true,
          completed: false,
        },
        {
          pickingId: "pick-02",
          pickingName: "Picking 2",
          materialType: "원자재",
          materialName: "SS275",
          thickness: 16,
          width: 715,
          durationMinutes: 6,
          hasWorkOrder: true,
          qrEnabled: true,
          completed: false,
        },
        {
          pickingId: "pick-03",
          pickingName: "Picking 3",
          materialType: "잔재",
          materialName: "GS400",
          currentZone: "Zone A-3",
          durationMinutes: 7,
          hasWorkOrder: true,
          qrEnabled: true,
          completed: false,
        },
        {
          pickingId: "pick-04",
          pickingName: "Picking 4",
          materialType: "잔재",
          materialName: "GS400",
          currentZone: "Zone B-1",
          durationMinutes: 4,
          hasWorkOrder: true,
          qrEnabled: true,
          completed: false,
        },
      ],
    },
    {
      taskId: "task-02",
      taskName: "Task 02",
      relocations: [
        {
          relocationId: "rel-03",
          materialName: "GS400",
          fromZone: "Zone C-4",
          toZone: "Zone A-1",
          durationMinutes: 4,
          qrEnabled: true,
          completed: false,
        },
      ],
      pickings: [],
    },
  ],
};

function formatMinutesToText(totalMinutes = 0) {
  const safeMinutes = Math.max(0, Number(totalMinutes) || 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function getAllItems(taskGroups = []) {
  return taskGroups.flatMap((group) => [
    ...(group.relocations || []),
    ...(group.pickings || []),
  ]);
}

function getComputedSummary(taskGroups = []) {
  const allItems = getAllItems(taskGroups);
  const totalCount = allItems.length;
  const completedCount = allItems.filter((item) => item.completed).length;
  const remainingItems = allItems.filter((item) => !item.completed);

  const remainingTaskCount = remainingItems.length;
  const remainingWorkMinutes = remainingItems.reduce(
    (sum, item) => sum + (Number(item.durationMinutes) || 0),
    0
  );

  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return {
    progressPercent,
    remainingTaskCount,
    remainingWorkMinutes,
  };
}

function getReadyPageData(locationState) {
  if (locationState?.readyPageData) return locationState.readyPageData;
  if (locationState?.selectedScenario?.readyPageData) {
    return locationState.selectedScenario.readyPageData;
  }
  return mockReadyData;
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-lg bg-[#F2F4F6] p-3">
      <p className="mb-1 text-[11px] font-medium text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function RelocationCard({ item, onQrClick }) {
  return (
    <div className="rounded-xl border border-[#C5C5D4]/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-indigo-700">{item.materialName}</h3>

          <div className="mt-1 flex items-center gap-1 text-slate-500">
            <span className="text-xs font-medium text-slate-400">{item.fromZone}</span>
            <span className="material-symbols-outlined text-xs text-slate-400">
              trending_flat
            </span>
            <span className="text-xs font-medium text-slate-400">{item.toZone}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onQrClick(item)}
          className="rounded-lg border border-indigo-200 bg-white p-2 shadow-sm active:bg-indigo-50"
        >
          <span className="material-symbols-outlined block text-4xl text-indigo-700">
            qr_code_2
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1 text-slate-400">
        <span className="material-symbols-outlined text-xs">schedule</span>
        <span className="text-[11px]">{item.durationMinutes}m</span>
      </div>
    </div>
  );
}

function PickingCard({ item, onQrClick, onWorkOrderClick }) {
  const isRemnant = item.materialType === "잔재";
  const isRawMaterial = item.materialType === "원자재";

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-[15px] font-extrabold text-slate-900">
              {item.pickingName}
            </h3>
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
              {item.materialType}
            </span>
          </div>

          <p className="mb-1 text-sm font-bold text-slate-900">{item.materialName}</p>

          {isRemnant && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">현재 위치</span>
              <span className="text-[12px] font-bold text-indigo-700">
                {item.currentZone}
              </span>
            </div>
          )}

          {isRawMaterial && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">두께×폭</span>
              <span className="text-[12px] font-bold text-indigo-700">
                {item.thickness} × {item.width}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button type="button" onClick={() => onWorkOrderClick(item)} className="p-1">
            <span className="material-symbols-outlined text-2xl text-slate-500">
              description
            </span>
          </button>

          <button
            type="button"
            onClick={() => onQrClick(item)}
            className="rounded-lg border border-indigo-200 bg-white p-2 shadow-sm active:bg-indigo-50"
          >
            <span className="material-symbols-outlined block text-4xl text-indigo-700">
              qr_code_2
            </span>
          </button>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-1 text-slate-400">
        <span className="material-symbols-outlined text-xs">schedule</span>
        <span className="text-[11px]">{item.durationMinutes}m</span>
      </div>
    </div>
  );
}

function App_ReadyPage() {
  const location = useLocation();

  const readyPageData = getReadyPageData(location.state);
  const taskGroups = readyPageData?.taskGroups || [];

  const summary = useMemo(() => {
    const computed = getComputedSummary(taskGroups);

    return {
      progressPercent:
        readyPageData?.summary?.progressPercent ?? computed.progressPercent,
      remainingTaskCount:
        readyPageData?.summary?.remainingTaskCount ?? computed.remainingTaskCount,
      remainingWorkMinutes:
        readyPageData?.summary?.remainingWorkMinutes ??
        computed.remainingWorkMinutes,
    };
  }, [readyPageData, taskGroups]);

  const handleQrClick = (item) => {
    console.log("QR clicked:", item);
  };

  const handleWorkOrderClick = (item) => {
    console.log("Work order clicked:", item);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#191C1E]">
      <header className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white">
        <div className="flex h-[72px] w-full items-center justify-between px-6">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-3xl text-indigo-900">
              factory
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" className="p-1">
              <span className="material-symbols-outlined text-2xl text-slate-700">
                notifications
              </span>
            </button>
            <button type="button">
              <span className="material-symbols-outlined text-3xl text-slate-700">
                account_circle
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-8 pt-[72px]">
        <div className="sticky top-[72px] z-40 bg-[#F7F9FB] pb-4 pt-4">
          <nav className="mb-6 border-b border-slate-200">
            <div className="flex items-center justify-between px-2">
              <div className="relative flex-1 py-3 text-center">
                <button type="button" className="text-[15px] font-extrabold text-slate-900">
                  생산 준비
                </button>
                <div className="absolute -bottom-[1.5px] left-[10%] right-[10%] z-10 h-[3px] rounded-full bg-[#3F51B5]" />
              </div>

              <button
                type="button"
                className="flex-1 py-3 text-center text-[15px] font-medium text-slate-400"
              >
                생산 중
              </button>

              <button
                type="button"
                className="flex-1 py-3 text-center text-[15px] font-medium text-slate-400"
              >
                작업 완료
              </button>
            </div>
          </nav>

          <section className="rounded-xl border border-[#C5C5D4]/15 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-sm font-bold text-slate-900">전체 진행도</span>
                <span className="text-lg font-extrabold text-indigo-700">
                  {summary.progressPercent}%
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-[#D0E1FB]">
                <div
                  className="h-full rounded-full bg-[#3F51B5]"
                  style={{ width: `${summary.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SummaryCard
                label="남은 task"
                value={`${summary.remainingTaskCount}개`}
              />
              <SummaryCard
                label="남은 작업 시간"
                value={formatMinutesToText(summary.remainingWorkMinutes)}
              />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {taskGroups.length === 0 && (
            <div className="rounded-xl border border-[#C5C5D4]/10 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              표시할 작업이 없습니다.
            </div>
          )}

          {taskGroups.map((group) => {
            const relocations = group.relocations || [];
            const pickings = group.pickings || [];

            return (
              <section key={group.taskId} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="h-5 w-1.5 rounded-full bg-indigo-700" />
                  <h2 className="text-lg font-bold text-slate-900">{group.taskName}</h2>
                </div>

                {relocations.length > 0 && (
                  <div className="space-y-3">
                    {relocations.map((item) => (
                      <RelocationCard
                        key={item.relocationId}
                        item={item}
                        onQrClick={handleQrClick}
                      />
                    ))}
                  </div>
                )}

                {pickings.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {pickings.map((item) => (
                      <PickingCard
                        key={item.pickingId}
                        item={item}
                        onQrClick={handleQrClick}
                        onWorkOrderClick={handleWorkOrderClick}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default App_ReadyPage;