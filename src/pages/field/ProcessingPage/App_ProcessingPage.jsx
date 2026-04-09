import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_ProcessTabs from "../../../components/field/ProcessTabs/App_ProcessTabs";
import App_Header from "../../../components/field/Header/App_Header";

const PROCESS_STATUS_META = {
  pending: {
    label: "대기",
    className: "bg-slate-100 text-slate-500",
  },
  complete: {
    label: "완료",
    className: "bg-green-50 text-green-700",
  },
};

let processingRuntimeData = null;

const processingMockData = {
  summaryCountLabel: "남은 재공품",
  batches: [
    {
      id: "batch-01",
      inputLabel: "투입",
      materialName: "SM355A",
      duration: "2시간",
      manufacturer: "현대 제철",
      generatedItems: [
        {
          id: "generated-01",
          title: "발생한 재공품 1",
          zone: "Zone A-3",
          status: "pending",
        },
      ],
    },
    {
      id: "batch-02",
      inputLabel: "투입",
      materialName: "GS400",
      duration: "1시간",
      manufacturer: "현대 제철",
      generatedItems: [
        {
          id: "generated-02",
          title: "발생한 재공품 1",
          zone: "Zone C-1",
          status: "pending",
        },
        {
          id: "generated-03",
          title: "발생한 재공품 2",
          zone: "Zone A-2",
          status: "complete",
        },
      ],
    },
    {
      id: "batch-03",
      inputLabel: "투입",
      materialName: "SS275",
      duration: "1시간 30분",
      manufacturer: "현대 제철",
      generatedItems: [
        {
          id: "generated-04",
          title: "발생한 재공품 1",
          zone: "Zone B-1",
          status: "pending",
        },
        {
          id: "generated-05",
          title: "발생한 재공품 2",
          zone: "Zone C-3",
          status: "complete",
        },
      ],
    },
  ],
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

const formatDurationText = (minutes) => {
  const safeMinutes = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainMinutes = safeMinutes % 60;

  if (hours > 0 && remainMinutes > 0) {
    return `${hours}h ${remainMinutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${safeMinutes}m`;
};

const getBatchDurationMinutes = (batch) => {
  if (Number.isFinite(batch?.expectedDurationMinutes)) {
    return Math.max(0, Number(batch.expectedDurationMinutes));
  }

  return parseDurationMinutes(batch?.duration);
};

const getTotalEstimatedMinutes = (batches = []) => {
  return batches.reduce((sum, batch) => sum + getBatchDurationMinutes(batch), 0);
};

const getRemainingGeneratedCount = (batches = []) => {
  return batches.reduce((sum, batch) => {
    const pendingCount = (batch.generatedItems ?? []).filter(
      (item) => item.status !== "complete"
    ).length;

    return sum + pendingCount;
  }, 0);
};

const getCompletedWeightedMinutes = (batches = []) => {
  return batches.reduce((sum, batch) => {
    const generatedItems = batch.generatedItems ?? [];
    if (generatedItems.length === 0) return sum;

    const completedCount = generatedItems.filter(
      (item) => item.status === "complete"
    ).length;

    const batchMinutes = getBatchDurationMinutes(batch);
    return sum + batchMinutes * (completedCount / generatedItems.length);
  }, 0);
};

const getProgressPercent = (data) => {
  if (Number.isFinite(data?.progressPercent)) {
    return Math.max(0, Math.min(100, Math.round(Number(data.progressPercent))));
  }

  const totalEstimatedMinutes = getTotalEstimatedMinutes(data?.batches ?? []);
  if (totalEstimatedMinutes === 0) return 0;

  const completedWeightedMinutes = getCompletedWeightedMinutes(
    data?.batches ?? []
  );

  return Math.max(
    0,
    Math.min(
      100,
      Math.round((completedWeightedMinutes / totalEstimatedMinutes) * 100)
    )
  );
};

const loadProcessingData = () => {
  return processingRuntimeData ?? processingMockData;
};

const saveProcessingData = (data) => {
  processingRuntimeData = data;
};

const applySavedProcessingResult = (baseData, savedState) => {
  const { savedGeneratedWipId, savedStatus, zoneScannedAt } = savedState ?? {};

  if (!savedGeneratedWipId || !savedStatus) {
    return baseData;
  }

  let hasMatched = false;

  const nextBatches = (baseData.batches ?? []).map((batch) => {
    const nextGeneratedItems = (batch.generatedItems ?? []).map((item) => {
      if (item.id !== savedGeneratedWipId) {
        return item;
      }

      hasMatched = true;

      return {
        ...item,
        status: savedStatus,
        zoneScannedAt: zoneScannedAt ?? item.zoneScannedAt ?? "",
      };
    });

    return {
      ...batch,
      generatedItems: nextGeneratedItems,
    };
  });

  if (!hasMatched) {
    return baseData;
  }

  return {
    ...baseData,
    batches: nextBatches,
  };
};

const SummarySection = ({
  progressPercent,
  remainingCount,
  totalEstimatedTimeText,
  countLabel,
  onQrClick,
  className = "",
}) => {
  return (
    <section
      className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <div className="mb-3 flex items-end justify-between">
            <span className="text-sm font-bold text-slate-900">생산 진행도</span>
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

        <div className="flex shrink-0 items-end">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="mb-1 text-[11px] font-medium text-slate-500">
            {countLabel}
          </p>
          <p className="text-lg font-bold text-slate-900">{remainingCount}개</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="mb-1 text-[11px] font-medium text-slate-500">
            전체 예상 소요 시간
          </p>
          <p className="text-lg font-bold text-slate-900">
            {totalEstimatedTimeText}
          </p>
        </div>
      </div>
    </section>
  );
};

const GeneratedItemRow = ({ item, isLast }) => {
  const statusMeta =
    PROCESS_STATUS_META[item.status] ?? PROCESS_STATUS_META.pending;

  return (
    <div
      className={`${isLast ? "" : "border-b border-slate-50 pb-4"} ${
        isLast ? "" : "mb-4"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[15px] font-extrabold text-slate-900">
          {item.title}
        </span>

        <div className="flex items-center gap-4">
          <span className="text-[14px] font-bold text-indigo-600">
            {item.zone}
          </span>

          <span
            className={`min-w-[42px] rounded-full px-3 py-1 text-center text-[11px] font-bold ${statusMeta.className}`}
          >
            {statusMeta.label}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProcessingBatchCard = ({ batch, onWorkOrderClick }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between border-b border-slate-50 bg-slate-50/30 px-6 py-5">
        <div>
          <h3 className="text-[14px] font-medium leading-tight text-slate-500">
            {batch.inputLabel ?? "투입"} {batch.materialName}
          </h3>

          <div className="mt-1.5 flex items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined text-[14px]">
              schedule
            </span>
            <span className="text-[12px] font-medium">{batch.duration}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onWorkOrderClick(batch)}
          className="text-slate-400 transition hover:text-slate-600"
        >
          <span className="material-symbols-outlined text-[24px]">
            description
          </span>
        </button>
      </div>

      <div className="space-y-0 px-6 py-5">
        {(batch.generatedItems ?? []).map((item, index, list) => (
          <GeneratedItemRow
            key={item.id}
            item={item}
            isLast={index === list.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

const App_ProcessingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(() => loadProcessingData());

  useEffect(() => {
    setData((prev) => applySavedProcessingResult(prev, location.state));
  }, [location.state]);

  useEffect(() => {
    saveProcessingData(data);
  }, [data]);

  const totalEstimatedMinutes = useMemo(
    () => getTotalEstimatedMinutes(data.batches),
    [data.batches]
  );

  const totalEstimatedTimeText =
    data.totalEstimatedTimeText ?? formatDurationText(totalEstimatedMinutes);

  const remainingCount = useMemo(
    () => getRemainingGeneratedCount(data.batches),
    [data.batches]
  );

  const progressPercent = useMemo(() => getProgressPercent(data), [data]);

  const generatedItemsForQr = useMemo(
    () =>
      data.batches.flatMap((batch) =>
        (batch.generatedItems ?? []).map((item) => ({
          ...item,
          inputMaterialName: batch.materialName,
          manufacturer: batch.manufacturer ?? "",
          expectedDurationText: batch.duration,
          expectedDurationMinutes: getBatchDurationMinutes(batch),
        }))
      ),
    [data.batches]
  );

  const handleQrClick = () => {
    navigate("/App/processing/qr", {
      state: {
        generatedItems: generatedItemsForQr,
        batches: data.batches,
        summary: {
          progressPercent,
          remainingCount,
          totalEstimatedMinutes,
          totalEstimatedTimeText,
          countLabel: data.summaryCountLabel ?? "남은 재공품",
        },
      },
    });
  };

  const handleWorkOrderClick = (batch) => {
    console.log("작업지시서 클릭", batch);
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
      <App_Header />

      <main className="mx-auto flex h-[calc(100dvh-72px)] w-full max-w-md flex-col px-4">
        <div className="shrink-0 bg-[#f7f9fb] pt-3">
          <App_ProcessTabs activeKey="processing" className="mb-0" />

          <SummarySection
            className="mt-4 mb-4"
            progressPercent={progressPercent}
            remainingCount={remainingCount}
            totalEstimatedTimeText={totalEstimatedTimeText}
            countLabel={data.summaryCountLabel ?? "남은 재공품"}
            onQrClick={handleQrClick}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-8">
          <div className="space-y-4 pb-2">
            {data.batches.map((batch) => (
              <ProcessingBatchCard
                key={batch.id}
                batch={batch}
                onWorkOrderClick={handleWorkOrderClick}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App_ProcessingPage;