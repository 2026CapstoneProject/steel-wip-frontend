import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_ScenarioSummaryPanel from "../../../components/office/Web_ScenarioSummaryPanel/Web_ScenarioSummaryPanel";
import Web_ScenarioMetricCards from "../../../components/office/Web_ScenarioMetricCards/Web_ScenarioMetricCards";
import Web_ScenarioTimelineSection from "../../../components/office/Web_ScenarioTimelineSection/Web_ScenarioTimelineSection";
import Web_SolverTimelineSection from "../../../components/office/Web_SolverTimelineSection/Web_SolverTimelineSection";

import { getScenarioDetail } from "../../../services/scenarioService";
import { runScheduler } from "../../../services/schedulerService";

// 백엔드 ScenarioResultData → timelineItems 형태로 변환
function formatScenarioQr(item) {
  if (item?.qrCode) return item.qrCode;
  return `QR-WIP-${String(item?.steelWipId ?? "").padStart(3, "0")}`;
}

function mapBatchItemsToTimeline(batchItems) {
  const RELOCATION = [];
  const PICKING = [];
  const INBOUND = [];

  (batchItems ?? []).forEach((item) => {
    const action = String(item.batchItemAction ?? "").trim();
    const row = {
      qrNumber: formatScenarioQr(item),
      thickness: String(item.thickness ?? ""),
      width: String(item.width ?? ""),
      length: String(item.length ?? ""),
      from: item.fromLocation || "-",
      to: item.toLocation || "-",
      estimatedTime: String(item.expectedStartTime ?? ""),
    };
    if (action === "RELOCATION" || action === "RELOCATE" || action === "재배치") RELOCATION.push(row);
    else if (action === "PICKING" || action === "피킹") PICKING.push(row);
    else if (action === "INBOUND" || action === "적재") INBOUND.push(row);
  });

  const items = [];
  if (RELOCATION.length > 0) {
    items.push({
      id: 1,
      type: "재배치 (Relocation)",
      icon: "sync_alt",
      colorClass: "bg-primary ring-surface",
      iconColorClass: "text-primary",
      rows: RELOCATION,
    });
  }
  if (PICKING.length > 0) {
    items.push({
      id: 2,
      type: "피킹 (Picking)",
      icon: "inventory",
      colorClass: "bg-red-500 ring-surface",
      iconColorClass: "text-secondary",
      rows: PICKING,
    });
  }
  if (INBOUND.length > 0) {
    items.push({
      id: 3,
      type: "적재 (Inbound)",
      icon: "layers",
      colorClass: "bg-emerald-500 ring-surface",
      iconColorClass: "text-emerald-500",
      rows: INBOUND,
    });
  }
  return items;
}

export default function Web_ScenarioCreationDetailHistoryPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const scenarioId = location.state?.scenarioId ?? null;
  const projectInfo = location.state?.projectInfo ?? null;

  const [scenarioData, setScenarioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ensuringSolverResult, setEnsuringSolverResult] = useState(false);

  // state 없이 직접 접근 시 생성 이력 목록으로 리다이렉트
  useEffect(() => {
    if (!scenarioId && !projectInfo) {
      navigate("/office/scenario/creationhistory", { replace: true });
      return;
    }
    if (scenarioId) {
      fetchScenarioDetail(scenarioId);
    } else {
      setLoading(false);
    }
  }, [scenarioId, navigate]);

  const fetchScenarioDetail = async (id) => {
    setLoading(true);
    setError(null);
    try {
      let schedulerErrorMessage = null;
      if (!ensuringSolverResult) {
        setEnsuringSolverResult(true);
        try {
          await runScheduler(id);
        } catch (schedulerErr) {
          console.error("시나리오 결과 생성 실패:", schedulerErr);
          schedulerErrorMessage =
            schedulerErr.response?.data?.message ||
            schedulerErr.response?.data?.detail ||
            "시나리오 결과 생성에 실패했습니다.";
        }
      }

      const response = await getScenarioDetail(id);
      const dataList = response.data?.data ?? [];
      const nextScenario = dataList[0] ?? null;
      setScenarioData(nextScenario);

      if (!nextScenario) {
        setError(
          schedulerErrorMessage || "시나리오 결과를 생성하거나 불러오는 데 실패했습니다.",
        );
        return;
      }

      if (schedulerErrorMessage && !nextScenario?.solverSummary) {
        setError(schedulerErrorMessage);
      }
    } catch (err) {
      console.error("시나리오 상세 조회 실패:", err);
      setError("시나리오 결과를 생성하거나 불러오는 데 실패했습니다.");
    } finally {
      setEnsuringSolverResult(false);
      setLoading(false);
    }
  };

  if (!scenarioId && !projectInfo) return null;

  const scenarioSummary = {
    scenarioId: scenarioData
      ? `#${String(scenarioData.scenarioId).padStart(5, "0")}`
      : projectInfo?.scenarioId || "-",
    projectName: scenarioData?.projectTitle || projectInfo?.projectName || "-",
    productionPlanName: scenarioData?.scenarioTitle || projectInfo?.productionPlanName || "-",
    shipmentDate: scenarioData?.scenarioDue || projectInfo?.shipmentDate || "-",
    equipmentName: scenarioData?.lazerName || projectInfo?.equipmentName || "-",
    status: projectInfo?.statusLabel || "미발행",
  };

  const metrics = scenarioData
    ? [
        { label: "재공품 수", value: String(scenarioData.totalWipNum ?? 0), unit: "EA" },
        { label: "크레인 이동 횟수", value: String(scenarioData.totalCraneMove ?? 0), unit: "Times" },
        { label: "이동 횟수", value: String(scenarioData.totalMoveNum ?? 0), unit: "Times" },
        {
          label: "총 소요 시간",
          value: `${Math.floor((scenarioData.totalCuttingTime ?? 0) / 60)
            .toString()
            .padStart(2, "0")}:${((scenarioData.totalCuttingTime ?? 0) % 60)
            .toString()
            .padStart(2, "0")}`,
          unit: "HR",
          highlight: true,
        },
      ]
    : [
        { label: "재공품 수", value: "-", unit: "EA" },
        { label: "크레인 이동 횟수", value: "-", unit: "Times" },
        { label: "이동 횟수", value: "-", unit: "Times" },
        { label: "총 소요 시간", value: "-", unit: "HR", highlight: true },
      ];

  const timelineItems = scenarioData ? mapBatchItemsToTimeline(scenarioData.batchItems) : [];

  return (
    <Web_AppLayout pageTitle="시나리오 생성 이력 상세">
      <div className="px-8 pt-8 pb-12">
        <div className="mb-8 flex items-end justify-between">
          <p className="font-headline text-lg font-bold tracking-tight text-on-surface">
            시나리오 생성 이력 &gt; 시나리오 상세
          </p>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-5 py-2.5 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container active:scale-95"
            onClick={() => navigate("/office/scenario/creationhistory")}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            목록으로
          </button>
        </div>

        {loading && (
          <div className="py-24 text-center text-sm text-on-surface-variant">
            시나리오 상세를 불러오는 중...
          </div>
        )}

        {error && !loading && (
          <div className="py-12 text-center text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-10 grid grid-cols-12 gap-6">
              <Web_ScenarioSummaryPanel summary={scenarioSummary} />
              <Web_ScenarioMetricCards
                metrics={metrics}
                equipmentName={scenarioSummary.equipmentName}
                status={scenarioSummary.status}
              />
            </div>
            {scenarioData?.solverSummary ? (
              <Web_SolverTimelineSection
                craneSchedule={scenarioData.craneSchedule}
                batchItems={scenarioData.batchItems}
              />
            ) : (
              <Web_ScenarioTimelineSection items={timelineItems} />
            )}
          </>
        )}
      </div>
    </Web_AppLayout>
  );
}
