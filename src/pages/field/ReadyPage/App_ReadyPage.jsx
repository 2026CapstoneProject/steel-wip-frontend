import React from "react";
import { useNavigate } from "react-router-dom";
import App_ProcessTabs from "../../../components/field/ProcessTabs/App_ProcessTabs";

const readyMockData = {
  progressPercent: 50,
  remainingTaskCount: 10,
  remainingWorkTime: "5h 45m",
  tasks: [
    {
      id: "task-01",
      title: "Task 01",
      relocations: [
        {
          id: "relocate-01",
          materialName: "SM355A",
          fromZone: "Zone A-1",
          toZone: "Zone B-2",
          duration: "11m",
        },
        {
          id: "relocate-02",
          materialName: "SS275",
          fromZone: "Zone B-1",
          toZone: "Zone C-1",
          duration: "7m",
        },
      ],
      pickings: [
        {
          id: "picking-01",
          title: "Picking 1",
          type: "재공품",
          manufacturer: "현대 제철",
          materialName: "SM355A",
          specText: "22 x 2,438 x 6,096",
          weightText: "7,698 kg",
          currentZone: "Zone C-4",
          targetPositionLabel: "Position 1",
          infoLabel: "현재 위치",
          infoValue: "Zone C-4",
          duration: "4m",
        },
        {
          id: "picking-02",
          title: "Picking 2",
          type: "원자재",
          manufacturer: "현대 제철",
          materialName: "SS275",
          specText: "22 x 2,438 x 6,096",
          weightText: "7,698 kg",
          targetPositionLabel: "Position 2",
          infoLabel: "두께×폭",
          infoValue: "22 × 2,438",
          duration: "6m",
        },
        {
          id: "picking-03",
          title: "Picking 3",
          type: "재공품",
          manufacturer: "현대 제철",
          materialName: "GS400",
          specText: "22 x 2,438 x 6,096",
          weightText: "7,698 kg",
          currentZone: "Zone A-3",
          targetPositionLabel: "Position 3",
          infoLabel: "현재 위치",
          infoValue: "Zone A-3",
          duration: "7m",
        },
        {
          id: "picking-04",
          title: "Picking 4",
          type: "재공품",
          manufacturer: "현대 제철",
          materialName: "GS400",
          specText: "22 x 2,438 x 6,096",
          weightText: "7,698 kg",
          currentZone: "Zone B-1",
          targetPositionLabel: "Position 4",
          infoLabel: "현재 위치",
          infoValue: "Zone B-1",
          duration: "4m",
        },
      ],
    },
    {
      id: "task-02",
      title: "Task 02",
      relocations: [
        {
          id: "relocate-03",
          materialName: "GS400",
          fromZone: "Zone C-4",
          toZone: "Zone A-1",
          duration: "4m",
        },
      ],
      pickings: [],
    },
  ],
};

const extractSlotNumber = (value) => {
  const match = String(value ?? "").match(/(\d+)/);
  return match ? match[1] : "";
};

const parseDurationMinutes = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const hourMatches = [...raw.matchAll(/(\d+)\s*(h|시간)/gi)];
  const minuteMatches = [...raw.matchAll(/(\d+)\s*(m|분)/gi)];

  if (hourMatches.length || minuteMatches.length) {
    const hours = hourMatches.reduce(
      (sum, match) => sum + Number(match[1] || 0),
      0
    );
    const minutes = minuteMatches.reduce(
      (sum, match) => sum + Number(match[1] || 0),
      0
    );
    return hours * 60 + minutes;
  }

  const plainNumber = raw.match(/(\d+)/);
  return plainNumber ? Number(plainNumber[1]) : 0;
};

const getThicknessWidthTextFromSpec = (specText, fallbackValue = "") => {
  const raw = String(specText ?? "").trim();
  if (!raw) return fallbackValue;

  const parts = raw.split(/\s*x\s*/i).map((part) => part.trim());
  if (parts.length < 2) return fallbackValue;

  return `${parts[0]} × ${parts[1]}`;
};

const getPickingInfoValue = (item) => {
  if (item?.type === "원자재" && item?.infoLabel === "두께×폭") {
    return getThicknessWidthTextFromSpec(item?.specText, item?.infoValue ?? "");
  }

  return item?.infoValue ?? "";
};

const SummarySection = ({
  progressPercent,
  remainingTaskCount,
  remainingWorkTime,
  className = "",
}) => {
  return (
    <section
      className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <div className="mb-3 flex items-end justify-between">
            <span className="text-sm font-bold text-slate-900">전체 진행도</span>
            <span className="text-lg font-extrabold text-indigo-700">
              {progressPercent}%
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-indigo-100">
            <div
              className="h-full rounded-full bg-[#3F51B5]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="mb-1 text-[11px] font-medium text-slate-500">남은 작업</p>
          <p className="text-lg font-bold text-slate-900">
            {remainingTaskCount}개
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="mb-1 text-[11px] font-medium text-slate-500">
            남은 작업 시간
          </p>
          <p className="text-lg font-bold text-slate-900">
            {remainingWorkTime}
          </p>
        </div>
      </div>
    </section>
  );
};

const RelocateCard = ({ item, onQrClick }) => {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-indigo-700">
            {item.materialName}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
            <span>{item.fromZone}</span>
            <span>→</span>
            <span>{item.toZone}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onQrClick(item)}
          className="rounded-lg border border-indigo-200 bg-white p-2 shadow-sm transition active:scale-95"
        >
          <span className="material-symbols-outlined block text-4xl text-indigo-700">
            qr_code_2
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
        <span className="material-symbols-outlined text-[18px] leading-none">
          schedule
        </span>
        <span>{item.duration}</span>
      </div>
    </div>
  );
};

const PickingCard = ({ item, onQrClick, onWorkOrderClick }) => {
  const displayInfoValue = getPickingInfoValue(item);

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-[15px] font-extrabold text-slate-900">
              {item.title}
            </h3>
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
              {item.type}
            </span>
          </div>

          <p className="mb-1 text-sm font-bold text-slate-900">
            {item.materialName}
          </p>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500">
              {item.infoLabel}
            </span>
            <span className="text-[12px] font-bold text-indigo-700">
              {displayInfoValue}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onWorkOrderClick(item)}
            className="p-1"
          >
            <span className="material-symbols-outlined text-2xl text-slate-500">
              description
            </span>
          </button>

          <button
            type="button"
            onClick={onQrClick}
            className="rounded-lg border border-indigo-200 bg-white p-2 shadow-sm transition active:scale-95"
          >
            <span className="material-symbols-outlined block text-4xl text-indigo-700">
              qr_code_2
            </span>
          </button>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-400">
        <span className="material-symbols-outlined text-[18px] leading-none">
          schedule
        </span>
        <span>{item.duration}</span>
      </div>
    </div>
  );
};

const TaskSection = ({
  task,
  onRelocateQrClick,
  onPickingQrClick,
  onWorkOrderClick,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="h-5 w-1.5 rounded-full bg-indigo-700" />
        <h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
      </div>

      {task.relocations?.length > 0 && (
        <div className="space-y-3">
          {task.relocations.map((item) => (
            <RelocateCard
              key={item.id}
              item={item}
              onQrClick={onRelocateQrClick}
            />
          ))}
        </div>
      )}

      {task.pickings?.length > 0 && (
        <div className="mt-4 space-y-3">
          {task.pickings.map((item, index) => (
            <PickingCard
              key={item.id}
              item={item}
              onQrClick={() => onPickingQrClick(item, index, task.pickings)}
              onWorkOrderClick={onWorkOrderClick}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const App_ReadyPage = () => {
  const navigate = useNavigate();
  const data = readyMockData;

  const handleRelocateQrClick = (item) => {
    navigate("/App/ready/relocate", {
      state: {
        relocation: {
          id: item.id,
          manufacturer: item.manufacturer ?? "유성 철주",
          material: item.materialName,
          specText: item.specText ?? "18 x 2,438 x 6,096",
          weightText: item.weightText ?? "6,300 kg",
          from: {
            zone: item.fromZone,
          },
          to: {
            zone: item.toZone,
          },
        },
      },
    });
  };

  const handlePickingQrClick = (item, index, pickingList) => {
    const order = index + 1;
    const totalCount = pickingList.length;

    const targetPosition =
      item?.targetPositionLabel ||
      item?.targetPosition ||
      item?.positionLabel ||
      item?.position ||
      "Position 2";

    const highlightedSlot =
      extractSlotNumber(targetPosition) || String(order);

    const expectedDurationText = item?.duration || "";
    const expectedDurationMinutes = parseDurationMinutes(expectedDurationText);

    const commonPickingState = {
      ...item,
      manufacturer: item?.manufacturer || "현대 제철",
      material: item?.materialName || "",
      specText: item?.specText || "22 x 2,438 x 6,096",
      weightText: item?.weightText || "7,698 kg",
      duration: expectedDurationText,
      expectedDurationText,
      expectedDurationMinutes,
      from: {
        ...(item?.from ?? {}),
        zone: item?.currentZone || item?.infoValue || "",
        time: item?.from?.time || "",
      },
      to: {
        ...(item?.to ?? {}),
        zone: targetPosition,
        time: item?.to?.time || "",
      },
      layout: {
        ...(item?.layout ?? {}),
        highlightedSlot,
      },
      pickingOrder: order,
      totalPickingCount: totalCount,
      isLastPicking: order === totalCount,
    };

    if (item.type === "재공품") {
      navigate("/App/ready/picking/wip", {
        state: {
          picking: commonPickingState,
          pickingOrder: order,
          totalPickingCount: totalCount,
        },
      });
      return;
    }

    navigate("/App/ready/picking/raw", {
      state: {
        picking: commonPickingState,
        pickingOrder: order,
        totalPickingCount: totalCount,
      },
    });
  };

  const handleWorkOrderClick = (item) => {
    console.log("작업지시서 클릭", item);
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
      <header className="shrink-0 border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-[72px] w-full max-w-md items-center justify-between px-6">
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

      <main className="mx-auto flex h-[calc(100dvh-72px)] w-full max-w-md flex-col px-4">
        <div className="shrink-0 bg-[#f7f9fb] pt-3">
          <App_ProcessTabs activeKey="ready" className="mb-0" />

          <SummarySection
            className="mt-4 mb-4"
            progressPercent={data.progressPercent}
            remainingTaskCount={data.remainingTaskCount}
            remainingWorkTime={data.remainingWorkTime}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-8">
          <div className="space-y-8 pb-2">
            {data.tasks.map((task) => (
              <TaskSection
                key={task.id}
                task={task}
                onRelocateQrClick={handleRelocateQrClick}
                onPickingQrClick={handlePickingQrClick}
                onWorkOrderClick={handleWorkOrderClick}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App_ReadyPage;