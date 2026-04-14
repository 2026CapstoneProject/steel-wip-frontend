import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import App_ProcessTabs from "../../../components/field/ProcessTabs/App_ProcessTabs";
import App_Header from "../../../components/field/Header/App_Header";
import workOrderPdf from "../../../assets/Steel_all_Work_instruction.pdf";
import { getFieldReady } from "../../../services/fieldService";

// ─── 헬퍼 함수 ──────────────────────────────────────────────────────

const extractSlotNumber = (value) => {
  const match = String(value ?? "").match(/(\d+)/);
  return match ? match[1] : "";
};

const parseDurationMinutes = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "0") return 0;
  const plainNumber = raw.match(/^(\d+)$/);
  if (plainNumber) return Number(plainNumber[1]);
  const hourMatches = [...raw.matchAll(/(\d+)\s*(h|시간)/gi)];
  const minuteMatches = [...raw.matchAll(/(\d+)\s*(m|분)/gi)];
  const hours = hourMatches.reduce((sum, m) => sum + Number(m[1] || 0), 0);
  const minutes = minuteMatches.reduce((sum, m) => sum + Number(m[1] || 0), 0);
  return hours * 60 + minutes;
};

// FieldBatchGroup[] → 화면용 tasks 형태로 변환
function mapBatchesToTasks(batchGroups) {
  return (batchGroups ?? []).map((group, batchIndex) => ({
    id: `batch-${batchIndex}`,
    title: `Task ${String(batchIndex + 1).padStart(2, "0")}`,
    relocations: (group.relocation ?? []).map((item) => ({
      id: String(item.batchItemId),
      batchItemId: item.batchItemId,
      materialName: item.material || "-",
      fromZone: item.fromLocationName || "-",
      toZone: item.toLocationName || "-",
      duration: `${item.expectedRunningTime ?? 0}m`,
    })),
    pickings: (group.picking ?? []).map((item, pickIdx) => {
      const isRaw = !item.wipId || item.wipId === 0;
      const specText =
        item.thickness && item.width && item.height
          ? `${item.thickness} x ${item.width} x ${item.height}`
          : "";
      return {
        id: String(item.batchItemId),
        batchItemId: item.batchItemId,
        title: `Picking ${pickIdx + 1}`,
        type: isRaw ? "원자재" : "재공품",
        manufacturer: "-",
        materialName: item.material || "-",
        specText,
        weightText: "-",
        currentZone: item.fromLocationName || "",
        targetPositionLabel: item.toLocationName || `Position ${pickIdx + 1}`,
        infoLabel: isRaw ? "두께×폭" : "현재 위치",
        infoValue: isRaw
          ? item.thickness && item.width
            ? `${item.thickness} × ${item.width}`
            : specText
          : item.fromLocationName || "-",
        duration: `${item.expectedRunningTime ?? 0}m`,
      };
    }),
  }));
}

// ─── 서브 컴포넌트 ──────────────────────────────────────────────────

const SummarySection = ({ progressPercent, remainingTaskCount, remainingWorkTime, className = "" }) => (
  <section className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm ${className}`}>
    <div className="mb-4 flex gap-4">
      <div className="flex-1">
        <div className="mb-3 flex items-end justify-between">
          <span className="text-sm font-bold text-slate-900">전체 진행도</span>
          <span className="text-lg font-extrabold text-indigo-700">{progressPercent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-indigo-100">
          <div className="h-full rounded-full bg-[#3F51B5]" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="mb-1 text-[11px] font-medium text-slate-500">남은 작업</p>
        <p className="text-lg font-bold text-slate-900">{remainingTaskCount}개</p>
      </div>
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="mb-1 text-[11px] font-medium text-slate-500">남은 작업 시간</p>
        <p className="text-lg font-bold text-slate-900">{remainingWorkTime}</p>
      </div>
    </div>
  </section>
);

const RelocateCard = ({ item, onQrClick }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-start justify-between">
      <div>
        <h3 className="text-sm font-bold text-indigo-700">{item.materialName}</h3>
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
        <span className="material-symbols-outlined block text-4xl text-indigo-700">qr_code_2</span>
      </button>
    </div>
    <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
      <span className="material-symbols-outlined text-[18px] leading-none">schedule</span>
      <span>{item.duration}</span>
    </div>
  </div>
);

const PickingCard = ({ item, onActionClick, onWorkOrderClick }) => {
  const isRawMaterial = item?.type === "원자재";
  const actionIcon = isRawMaterial ? "inventory_2" : "qr_code_2";
  const displayInfoValue = item?.infoValue ?? "";

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-[15px] font-extrabold text-slate-900">{item.title}</h3>
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
              {item.type}
            </span>
          </div>
          <p className="mb-1 text-sm font-bold text-slate-900">{item.materialName}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500">{item.infoLabel}</span>
            <span className="text-[12px] font-bold text-indigo-700">{displayInfoValue}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => onWorkOrderClick(item)} className="p-1">
            <span className="material-symbols-outlined text-2xl text-slate-500">description</span>
          </button>
          <button
            type="button"
            onClick={onActionClick}
            className="rounded-lg border border-indigo-200 bg-white p-2 shadow-sm transition active:scale-95"
          >
            <span className="material-symbols-outlined block text-4xl text-indigo-700">{actionIcon}</span>
          </button>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-400">
        <span className="material-symbols-outlined text-[18px] leading-none">schedule</span>
        <span>{item.duration}</span>
      </div>
    </div>
  );
};

const TaskSection = ({ task, onRelocateQrClick, onPickingActionClick, onWorkOrderClick }) => (
  <section className="space-y-4">
    <div className="flex items-center gap-2 px-1">
      <div className="h-5 w-1.5 rounded-full bg-indigo-700" />
      <h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
    </div>
    {task.relocations?.length > 0 && (
      <div className="space-y-3">
        {task.relocations.map((item) => (
          <RelocateCard key={item.id} item={item} onQrClick={onRelocateQrClick} />
        ))}
      </div>
    )}
    {task.pickings?.length > 0 && (
      <div className="mt-4 space-y-3">
        {task.pickings.map((item, index) => (
          <PickingCard
            key={item.id}
            item={item}
            onActionClick={() => onPickingActionClick(item, index, task.pickings)}
            onWorkOrderClick={onWorkOrderClick}
          />
        ))}
      </div>
    )}
  </section>
);

// ─── 메인 컴포넌트 ──────────────────────────────────────────────────

const App_ReadyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [readyData, setReadyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadyData();
  }, []);

  const fetchReadyData = async () => {
    setLoading(true);
    try {
      const response = await getFieldReady();
      const dataList = response.data?.data ?? [];
      if (dataList.length > 0) {
        setReadyData(dataList[0]);
      }
    } catch (err) {
      console.error("생산 준비 데이터 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const tasks = readyData ? mapBatchesToTasks(readyData.batch) : [];
  const progressPercent = Math.round((readyData?.scenarioProgressRate ?? 0) * 100);
  const remainingTaskCount = tasks.reduce(
    (sum, t) => sum + (t.relocations?.length ?? 0) + (t.pickings?.length ?? 0),
    0
  );

  const handleRelocateQrClick = (item) => {
    navigate("/App/ready/relocate", {
      state: {
        batchItemId: item.batchItemId,
        relocation: {
          id: item.id,
          manufacturer: "-",
          material: item.materialName,
          specText: "",
          weightText: "-",
          from: { zone: item.fromZone },
          to: { zone: item.toZone },
        },
      },
    });
  };

  const handlePickingActionClick = (item, index, pickingList) => {
    const order = index + 1;
    const totalCount = pickingList.length;
    const targetPosition = item?.targetPositionLabel || `Position ${order}`;
    const highlightedSlot = extractSlotNumber(targetPosition) || String(order);
    const expectedDurationText = item?.duration || "";
    const expectedDurationMinutes = parseDurationMinutes(expectedDurationText);

    const commonPickingState = {
      ...item,
      batchItemId: item.batchItemId,
      manufacturer: item?.manufacturer || "-",
      material: item?.materialName || "",
      specText: item?.specText || "",
      weightText: item?.weightText || "-",
      duration: expectedDurationText,
      expectedDurationText,
      expectedDurationMinutes,
      from: { zone: item?.currentZone || item?.infoValue || "" },
      to: { zone: targetPosition },
      layout: { highlightedSlot },
      pickingOrder: order,
      totalPickingCount: totalCount,
      isLastPicking: order === totalCount,
    };

    if (item.type === "재공품") {
      navigate("/App/ready/picking/wip", {
        state: { picking: commonPickingState, pickingOrder: order, totalPickingCount: totalCount },
      });
      return;
    }

    navigate("/App/ready/picking/raw", {
      state: { picking: commonPickingState, pickingOrder: order, totalPickingCount: totalCount },
    });
  };

  const handleWorkOrderClick = () => {
    window.open(workOrderPdf, "_self");
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
      <App_Header />

      <main className="mx-auto flex h-[calc(100dvh-72px)] w-full max-w-md flex-col px-4">
        <div className="shrink-0 bg-[#f7f9fb] pt-3">
          <App_ProcessTabs
            activeKey="ready"
            className="mb-0"
          />

          <SummarySection
            className="mt-4 mb-4"
            progressPercent={progressPercent}
            remainingTaskCount={remainingTaskCount}
            remainingWorkTime="-"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-8">
          {loading && (
            <div className="py-12 text-center text-sm text-slate-500">
              데이터를 불러오는 중...
            </div>
          )}
          {!loading && tasks.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              준비 중인 작업이 없습니다.
            </div>
          )}
          {!loading && tasks.length > 0 && (
            <div className="space-y-8 pb-2">
              {tasks.map((task) => (
                <TaskSection
                  key={task.id}
                  task={task}
                  onRelocateQrClick={handleRelocateQrClick}
                  onPickingActionClick={handlePickingActionClick}
                  onWorkOrderClick={handleWorkOrderClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App_ReadyPage;
