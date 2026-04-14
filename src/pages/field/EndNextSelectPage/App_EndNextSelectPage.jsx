import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_ProcessTabs from "../../../components/field/ProcessTabs/App_ProcessTabs";
import App_Header from "../../../components/field/Header/App_Header";
import workOrderPdf from "../../../assets/Steel_all_Work_instruction.pdf";
import { getFieldEnd } from "../../../services/fieldService";

const SHARED_PROCESS_TABS_STATE_KEY = "__FIELD_PROCESS_TABS_SHARED_STATE__";

const DEFAULT_END_NEXT_SELECT_STATE = {
  summary: {
    date: "2026.10.24",
    progressPercent: 95,
  },
  nextScenario: {
    selectRoute: "/app/end/next/select",
  },
  nextScenarioAlert: {
    showToast: false,
    hasUnread: false,
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

const mapEndDataToTasks = (endDataList) => {
  const tasks = [];

  (endDataList ?? []).forEach((endData) => {
    (endData.batch ?? []).forEach((group, groupIdx) => {
      const relocations = (group.relocation ?? []).map((item) => ({
        id: String(item.batchItemId),
        materialName: item.material || "-",
        fromZone: item.fromLocationName || "-",
        toZone: item.toLocationName || "-",
        duration: item.expectedRunningTime ? `${item.expectedRunningTime}m` : null,
      }));

      const pickings = (group.picking ?? []).map((item, pickIdx) => ({
        id: String(item.batchItemId),
        title: `Picking ${pickIdx + 1}`,
        materialName: item.material || "-",
        infoLabel: item.wipId ? "현재 위치" : "규격",
        infoValue: item.wipId
          ? (item.fromLocationName || "-")
          : (item.thickness && item.width ? `${item.thickness} × ${item.width}` : "-"),
        duration: item.expectedRunningTime ? `${item.expectedRunningTime}m` : null,
      }));

      if (relocations.length === 0 && pickings.length === 0) return;

      tasks.push({
        id: `batch-group-${groupIdx}`,
        title: `Task ${String(groupIdx + 1).padStart(2, "0")}`,
        relocations,
        pickings,
      });
    });
  });

  return tasks;
};

const normalizeEndNextSelectState = (source = {}) => {
  const summary = {
    ...DEFAULT_END_NEXT_SELECT_STATE.summary,
    ...(source?.summary ?? {}),
  };

  const nextScenario = {
    ...DEFAULT_END_NEXT_SELECT_STATE.nextScenario,
    ...(source?.nextScenario ?? {}),
  };

  const nextScenarioAlert = {
    showToast: false,
    hasUnread: false,
    ...(source?.nextScenarioAlert ?? {}),
  };

  return {
    ...DEFAULT_END_NEXT_SELECT_STATE,
    ...source,
    summary,
    nextScenario,
    nextScenarioAlert,
    tasks: Array.isArray(source?.tasks)
      ? source.tasks
      : DEFAULT_END_NEXT_SELECT_STATE.tasks,
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

const NextScenarioSelectModal = ({ onNoClick, onYesClick }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-6 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-[28px] bg-white p-8 shadow-2xl">
        <p className="mb-8 text-center text-[20px] font-bold leading-[1.35] text-slate-900">
          다음 시나리오를
          <br />
          이행하시겠습니까?
        </p>

        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onNoClick}
            className="flex-1 rounded-2xl bg-slate-100 px-6 py-4 text-base font-bold text-slate-800 transition active:scale-95"
          >
            아니오
          </button>

          <button
            type="button"
            onClick={onYesClick}
            className="flex-1 rounded-2xl bg-[#3F46B5] px-6 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/20 transition active:scale-95"
          >
            네
          </button>
        </div>
      </div>
    </div>
  );
};

const App_EndNextSelectPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const runtimeState = useMemo(() => {
    if (hasObjectValue(location.state)) {
      return normalizeEndNextSelectState(location.state);
    }

    const sharedState = getSharedProcessTabsState();

    if (hasObjectValue(sharedState?.endNextSelect)) {
      return normalizeEndNextSelectState(sharedState.endNextSelect);
    }

    if (hasObjectValue(sharedState?.endNext)) {
      return normalizeEndNextSelectState(sharedState.endNext);
    }

    return normalizeEndNextSelectState(DEFAULT_END_NEXT_SELECT_STATE);
  }, [location.state]);

  const summaryDate = useMemo(() => {
    return formatSummaryDate(runtimeState?.summary?.date);
  }, [runtimeState]);

  const [liveSummaryDate, setLiveSummaryDate] = useState(summaryDate);
  const [liveProgressPercent, setLiveProgressPercent] = useState(0);
  const [liveTasks, setLiveTasks] = useState([]);

  useEffect(() => {
    setLiveSummaryDate(summaryDate);
  }, [summaryDate]);

  useEffect(() => {
    const fetchEndData = async () => {
      try {
        const response = await getFieldEnd();
        const endDataList = response.data?.data ?? [];
        const mappedTasks = mapEndDataToTasks(endDataList);
        setLiveTasks(mappedTasks);

        if (endDataList.length > 0) {
          setLiveProgressPercent(
            Math.round((endDataList[0].scenarioProgressRate ?? 0) * 100)
          );
        } else {
          setLiveProgressPercent(0);
        }
      } catch (err) {
        console.error("작업 완료 데이터 조회 실패:", err);
        setLiveTasks([]);
        setLiveProgressPercent(0);
      }
    };

    fetchEndData();
  }, []);

  const progressPercent = liveProgressPercent;
  const tasks = liveTasks;

  const [openTaskIds, setOpenTaskIds] = useState(() =>
    tasks.length > 0 ? [tasks[0].id] : []
  );

  useEffect(() => {
    setOpenTaskIds((prev) => {
      if (tasks.length === 0) return [];

      const validIds = prev.filter((id) => tasks.some((task) => task.id === id));
      if (validIds.length > 0) return validIds;

      return [tasks[0].id];
    });
  }, [tasks]);

  useEffect(() => {
    const nextState = {
      ...runtimeState,
      summary: {
        ...(runtimeState?.summary ?? {}),
        date: liveSummaryDate,
        progressPercent,
      },
      tasks,
      nextScenarioAlert: {
        showToast: false,
        hasUnread: false,
      },
      openedFrom: "end-next-select",
    };

    mergeSharedProcessTabsState({
      end: nextState,
      endNext: nextState,
      endNextSelect: nextState,
    });
  }, [runtimeState, liveSummaryDate, progressPercent, tasks]);

  const handleToggleTask = (taskId) => {
    setOpenTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleWorkOrderClick = () => {
  window.open(workOrderPdf, "_self");
};

  const moveToEndPage = (decision) => {
    const nextState = {
      ...runtimeState,
      summary: {
        ...(runtimeState?.summary ?? {}),
        date: liveSummaryDate,
        progressPercent,
      },
      tasks,
      nextScenarioDecision: decision,
      nextScenarioAlert: {
        showToast: false,
        hasUnread: false,
      },
      openedFrom: "end-next-select",
    };

    mergeSharedProcessTabsState({
      end: nextState,
      endNext: nextState,
      endNextSelect: nextState,
    });

    navigate("/app/end", {
      state: nextState,
    });
  };

  const handleNoClick = () => {
    moveToEndPage("no");
  };

  const handleYesClick = () => {
    moveToEndPage("yes");
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
      <div className="pointer-events-none select-none blur-[2px]">
        <App_Header />

        <main className="mx-auto flex h-[calc(100dvh-72px)] w-full max-w-md flex-col px-4">
          <div className="shrink-0 bg-[#f7f9fb] pt-3">
            <App_ProcessTabs activeKey="end" className="mb-0" />
            <SummarySection
              summaryDate={liveSummaryDate}
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

      <NextScenarioSelectModal
        onNoClick={handleNoClick}
        onYesClick={handleYesClick}
      />
    </div>
  );
};

export default App_EndNextSelectPage;
