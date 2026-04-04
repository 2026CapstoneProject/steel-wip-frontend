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
          materialName: "SM355A",
          infoLabel: "현재 위치",
          infoValue: "Zone C-4",
          duration: "4m",
        },
        {
          id: "picking-02",
          title: "Picking 2",
          type: "원자재",
          materialName: "SS275",
          infoLabel: "두께×폭",
          infoValue: "16 × 715",
          duration: "6m",
        },
        {
          id: "picking-03",
          title: "Picking 3",
          type: "재공품",
          materialName: "GS400",
          infoLabel: "현재 위치",
          infoValue: "Zone A-3",
          duration: "7m",
        },
        {
          id: "picking-04",
          title: "Picking 4",
          type: "재공품",
          materialName: "GS400",
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

const SummarySection = ({
  progressPercent,
  remainingTaskCount,
  remainingWorkTime,
}) => {
  return (
    <section className="mb-8 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="mb-2 flex items-end justify-between">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="mb-1 text-[11px] font-medium text-slate-500">남은 task</p>
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

          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-400">
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

      <div className="flex items-center gap-1 text-[11px] text-slate-400">
        <span className="material-symbols-outlined text-xs">schedule</span>
        <span>{item.duration}</span>
      </div>
    </div>
  );
};

const PickingCard = ({ item, onQrClick, onWorkOrderClick }) => {
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
              {item.infoValue}
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
            onClick={() => onQrClick(item)}
            className="rounded-lg border border-indigo-200 bg-white p-2 shadow-sm transition active:scale-95"
          >
            <span className="material-symbols-outlined block text-4xl text-indigo-700">
              qr_code_2
            </span>
          </button>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
        <span className="material-symbols-outlined text-xs">schedule</span>
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
          {task.pickings.map((item) => (
            <PickingCard
              key={item.id}
              item={item}
              onQrClick={onPickingQrClick}
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

  const handleRelocateQrClick = () => {
    navigate("/App/ready/relocate");
  };

  const handlePickingQrClick = (item) => {
    if (item.type === "재공품") {
      navigate("/App/ready/picking/wip");
      return;
    }

    navigate("/App/ready/picking/raw");
  };

  const handleWorkOrderClick = (item) => {
    console.log("작업지시서 클릭", item);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
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

      <main className="mx-auto max-w-md px-4 pb-8 pt-3">
        <App_ProcessTabs activeKey="ready" />

        <SummarySection
          progressPercent={data.progressPercent}
          remainingTaskCount={data.remainingTaskCount}
          remainingWorkTime={data.remainingWorkTime}
        />

        <div className="space-y-8">
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
      </main>
    </div>
  );
};

export default App_ReadyPage;