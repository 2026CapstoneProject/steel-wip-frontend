import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_ProcessTabs from "../../../components/field/ProcessTabs/App_ProcessTabs";
import App_Header from "../../../components/field/Header/App_Header";

const SHARED_PROCESS_TABS_STATE_KEY = "__FIELD_PROCESS_TABS_SHARED_STATE__";

const DEFAULT_END_NEXT_STATE = {
  summary: {
    date: "2026.10.24",
    progressPercent: 95,
  },
  nextScenario: {
    selectRoute: "/app/end/next/select",
  },
  tasks: [
    {
      id: "task-1",
      title: "Task 01",
      relocations: [
        {
          id: "relocation-1",
          materialName: "SM355A",
          fromZone: "Zone A-1",
          toZone: "Zone B-2",
          duration: "11m",
        },
      ],
      pickings: [
        {
          id: "picking-1",
          title: "Picking 1",
          materialName: "SM355A",
          infoLabel: "현재 위치",
          infoValue: "Zone B-2",
          duration: "4m",
        },
        {
          id: "picking-2",
          title: "Picking 2",
          materialName: "SS400",
          infoLabel: "현재 위치",
          infoValue: "Zone D-2",
          duration: "3m",
        },
        {
          id: "picking-3",
          title: "Picking 3",
          materialName: "SM355A",
          infoLabel: "현재 위치",
          infoValue: "Zone C-4",
          duration: "2m",
        },
        {
          id: "picking-4",
          title: "Picking 4",
          materialName: "GS400",
          infoLabel: "현재 위치",
          infoValue: "Zone A-1",
          duration: "2m",
        },
      ],
    },
    {
      id: "task-2",
      title: "Task 02",
      relocations: [
        {
          id: "relocation-2",
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

const getSharedProcessTabsState = () => {
  if (typeof window === "undefined") return {};
  return window[SHARED_PROCESS_TABS_STATE_KEY] ?? {};
};

const mergeSharedProcessTabsState = (patch = {}) => {
  if (typeof window === "undefined") return;

  const prev = getSharedProcessTabsState();
  window[SHARED_PROCESS_TABS_STATE_KEY] = {
    ...prev,
    ...patch,
  };
};

const hasObjectValue = (value) => {
  return !!value && typeof value === "object" && Object.keys(value).length > 0;
};

const formatSummaryDate = (value) => {
  if (!value) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  }

  if (typeof value === "string") {
    const maybeDate = new Date(value);
    if (!Number.isNaN(maybeDate.getTime())) {
      const year = maybeDate.getFullYear();
      const month = String(maybeDate.getMonth() + 1).padStart(2, "0");
      const day = String(maybeDate.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    }

    return value;
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  } catch {
    return "";
  }
};

const normalizeEndNextState = (source = {}) => {
  const summary = {
    ...DEFAULT_END_NEXT_STATE.summary,
    ...(source?.summary ?? {}),
  };

  const nextScenario = {
    ...DEFAULT_END_NEXT_STATE.nextScenario,
    ...(source?.nextScenario ?? {}),
  };

  const nextScenarioAlert = {
    showToast:
      typeof source?.nextScenarioAlert?.showToast === "boolean"
        ? source.nextScenarioAlert.showToast
        : summary.progressPercent >= 95,
    hasUnread:
      typeof source?.nextScenarioAlert?.hasUnread === "boolean"
        ? source.nextScenarioAlert.hasUnread
        : false,
  };

  return {
    ...DEFAULT_END_NEXT_STATE,
    ...source,
    summary,
    nextScenario,
    nextScenarioAlert,
    tasks: Array.isArray(source?.tasks)
      ? source.tasks
      : DEFAULT_END_NEXT_STATE.tasks,
  };
};

const SummarySection = ({ summaryDate, progressPercent }) => {
  return (
    <section className="mt-4 mb-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1.5">
        <p className="text-[12px] font-medium text-slate-500">{summaryDate}</p>
        <h2 className="text-lg font-extrabold text-slate-900">작업 완료</h2>

        <div className="mt-1.5 flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-indigo-100">
            <div
              className="h-full rounded-full bg-[#3F51B5] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="min-w-[40px] text-right text-lg font-extrabold text-indigo-700">
            {progressPercent}%
          </span>
        </div>
      </div>
    </section>
  );
};

const EndRelocateCard = ({ item }) => {
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

        {item.duration ? (
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            <span className="material-symbols-outlined text-[18px] leading-none">
              schedule
            </span>
            <span>{item.duration}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const EndPickingCard = ({ item, onWorkOrderClick }) => {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="mb-2 text-[15px] font-extrabold text-slate-900">
            {item.title}
          </h3>

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

        <div className="flex shrink-0 flex-col items-end gap-2">
          {item.duration ? (
            <div className="flex items-center gap-1 text-slate-400">
              <span className="material-symbols-outlined text-xs">
                schedule
              </span>
              <span className="text-[11px]">{item.duration}</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => onWorkOrderClick(item)}
            className="p-1"
          >
            <span className="material-symbols-outlined text-2xl text-slate-500">
              description
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const CompletedTaskCard = ({
  task,
  isOpen,
  onToggle,
  onWorkOrderClick,
}) => {
  const relocations = Array.isArray(task?.relocations) ? task.relocations : [];
  const pickings = Array.isArray(task?.pickings) ? task.pickings : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-1.5 rounded-full bg-indigo-700" />
          <h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
        </div>

        <span
          className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {isOpen ? (
        <div className="space-y-3 px-5 pb-5">
          {relocations.map((item) => (
            <EndRelocateCard key={item.id} item={item} />
          ))}

          {pickings.map((item) => (
            <EndPickingCard
              key={item.id}
              item={item}
              onWorkOrderClick={onWorkOrderClick}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const EmptyCompletedTaskState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        완료된 작업이 없습니다.
      </p>
    </div>
  );
};

const NextScenarioToast = ({ visible, onClick }) => {
  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-[84px] z-[60] w-[calc(100%-32px)] max-w-md -translate-x-1/2">
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-[#5B56C8]/90 px-5 py-4 text-left text-white shadow-2xl backdrop-blur-sm transition active:scale-[0.99]"
      >
        <span className="material-symbols-outlined text-indigo-100">info</span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold">작업이 곧 완료됩니다</p>
          <p className="mt-0.5 text-[12px] text-indigo-100/90">
            눌러서 다음 시나리오 진행 여부를 확인하세요
          </p>
        </div>

        <span className="material-symbols-outlined text-indigo-100">
          chevron_right
        </span>
      </button>
    </div>
  );
};

const App_EndNextPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const runtimeState = useMemo(() => {
    if (hasObjectValue(location.state)) {
      return normalizeEndNextState(location.state);
    }

    const sharedState = getSharedProcessTabsState();
    if (hasObjectValue(sharedState?.endNext)) {
      return normalizeEndNextState(sharedState.endNext);
    }

    return normalizeEndNextState(DEFAULT_END_NEXT_STATE);
  }, [location.state]);

  const summaryDate = useMemo(() => {
    return formatSummaryDate(runtimeState?.summary?.date);
  }, [runtimeState]);

  const progressPercent = useMemo(() => {
    const value = Number(runtimeState?.summary?.progressPercent);
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
  }, [runtimeState]);

  const tasks = useMemo(() => {
    const source = Array.isArray(runtimeState?.tasks) ? runtimeState.tasks : [];

    return source.map((task, index) => ({
      id: task?.id ?? `task-${index + 1}`,
      title: task?.title ?? `Task ${index + 1}`,
      relocations: Array.isArray(task?.relocations) ? task.relocations : [],
      pickings: Array.isArray(task?.pickings) ? task.pickings : [],
    }));
  }, [runtimeState]);

  const [openTaskIds, setOpenTaskIds] = useState(() =>
    tasks.length > 0 ? [tasks[0].id] : []
  );

  const [showToast, setShowToast] = useState(() => {
    if (progressPercent < 95) return false;
    return Boolean(runtimeState?.nextScenarioAlert?.showToast);
  });

  const [hasUnreadAlert, setHasUnreadAlert] = useState(() => {
    if (progressPercent < 95) return false;
    return Boolean(runtimeState?.nextScenarioAlert?.hasUnread);
  });

  useEffect(() => {
    setOpenTaskIds((prev) => {
      if (tasks.length === 0) return [];

      const validIds = prev.filter((id) => tasks.some((task) => task.id === id));
      if (validIds.length > 0) return validIds;

      return [tasks[0].id];
    });
  }, [tasks]);

  useEffect(() => {
    if (progressPercent < 95) {
      setShowToast(false);
      setHasUnreadAlert(false);
      return;
    }

    const savedAlert = runtimeState?.nextScenarioAlert;
    if (savedAlert && typeof savedAlert === "object") {
      setShowToast(Boolean(savedAlert.showToast));
      setHasUnreadAlert(Boolean(savedAlert.hasUnread));
      return;
    }

    setShowToast(true);
    setHasUnreadAlert(false);
  }, [runtimeState, progressPercent]);

  useEffect(() => {
    if (!showToast || progressPercent < 95) return;

    const timer = window.setTimeout(() => {
      setShowToast(false);
      setHasUnreadAlert(true);
    }, 5500);

    return () => window.clearTimeout(timer);
  }, [showToast, progressPercent]);

  useEffect(() => {
    mergeSharedProcessTabsState({
      endNext: {
        ...runtimeState,
        nextScenarioAlert: {
          showToast,
          hasUnread: hasUnreadAlert,
        },
      },
    });
  }, [runtimeState, showToast, hasUnreadAlert]);

  const handleToggleTask = (taskId) => {
    setOpenTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleWorkOrderClick = (item) => {
    console.log("작업지시서 클릭", item);
  };

  const handleMoveToNextSelect = () => {
    const selectRoute =
      runtimeState?.nextScenario?.selectRoute || "/app/end/next/select";

    const nextState = {
      ...runtimeState,
      nextScenarioAlert: {
        showToast: false,
        hasUnread: false,
      },
      openedFrom: "end-next",
    };

    mergeSharedProcessTabsState({
      endNext: nextState,
    });

    navigate(selectRoute, {
      state: nextState,
    });
  };

  const handleNotificationBellClick = () => {
    if (!hasUnreadAlert) return;
    handleMoveToNextSelect();
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
      <App_Header
        hasUnreadAlert={hasUnreadAlert}
        onNotificationClick={handleNotificationBellClick}
      />

      <NextScenarioToast
        visible={showToast && progressPercent >= 95}
        onClick={handleMoveToNextSelect}
      />

      <main className="mx-auto flex h-[calc(100dvh-72px)] w-full max-w-md flex-col px-4">
        <div className="shrink-0 bg-[#f7f9fb] pt-3">
          <App_ProcessTabs activeKey="end" className="mb-0" />
          <SummarySection
            summaryDate={summaryDate}
            progressPercent={progressPercent}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-8">
          <div className="space-y-4 pb-2">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <CompletedTaskCard
                  key={task.id}
                  task={task}
                  isOpen={openTaskIds.includes(task.id)}
                  onToggle={() => handleToggleTask(task.id)}
                  onWorkOrderClick={handleWorkOrderClick}
                />
              ))
            ) : (
              <EmptyCompletedTaskState />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App_EndNextPage;