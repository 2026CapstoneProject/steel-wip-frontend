import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_ScenarioSummaryPanel from "../../../components/office/Web_ScenarioSummaryPanel/Web_ScenarioSummaryPanel";
import Web_ScenarioMetricCards from "../../../components/office/Web_ScenarioMetricCards/Web_ScenarioMetricCards";
import Web_ScenarioTimelineSection from "../../../components/office/Web_ScenarioTimelineSection/Web_ScenarioTimelineSection";

import Web_ScenarioGoBackModal from "../../../components/modal/Web_ScenarioGoBackModal/Web_ScenarioGoBackModal";
import Web_ScenarioAddModal from "../../../components/modal/Web_ScenarioAddModal/Web_ScenarioAddModal";
import Web_ScenarioSendModal from "../../../components/modal/Web_ScenarioSendModal/Web_ScenarioSendModal";

import {
  clearScenarioLantekCache,
  getScenarioLantekCache,
  setScenarioLantekCache,
} from "../../../utils/Web/lantekCache";

import { getScenarioDetail, sendScenario } from "../../../services/scenarioService";

// 백엔드 ScenarioResultData → timelineItems 형태로 변환
function mapBatchItemsToTimeline(batchItems) {
  const RELOCATION = [];
  const PICKING = [];
  const INBOUND = [];

  (batchItems ?? []).forEach((item) => {
    const action = String(item.batchItemAction ?? "").trim();
    const row = {
      qrNumber: `WIP-${item.steelWipId}`,
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

export default function Web_ScenarioResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지(LantekInputPage)에서 scenarioId를 state로 전달받음
  const scenarioIdFromState = location.state?.scenarioId ?? null;

  const [isGoBackModalOpen, setIsGoBackModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const [scenarioData, setScenarioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cachedData = getScenarioLantekCache();
  const cachedProjectInfo = cachedData?.projectInfo ?? {};

  // scenarioId 결정: state에서 받거나 캐시에서 복원
  const scenarioId = scenarioIdFromState ?? cachedProjectInfo.scenarioId ?? null;

  useEffect(() => {
    if (scenarioId) {
      fetchScenarioDetail(scenarioId);
    } else {
      setLoading(false);
    }
  }, [scenarioId]);

  const fetchScenarioDetail = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getScenarioDetail(id);
      const dataList = response.data?.data ?? [];
      if (dataList.length > 0) {
        setScenarioData(dataList[0]);
      }
    } catch (err) {
      console.error("시나리오 결과 조회 실패:", err);
      setError("시나리오 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 화면에 표시할 데이터 구성
  const scenarioSummary = {
    scenarioId: scenarioData ? `#${String(scenarioData.scenarioId).padStart(5, "0")}` : "-",
    projectName: scenarioData?.projectTitle || cachedProjectInfo.projectName || "-",
    productionPlanName: scenarioData?.scenarioTitle || cachedProjectInfo.productionPlanName || "-",
    shipmentDate: scenarioData?.scenarioDue || cachedProjectInfo.shipmentDate || "-",
    equipmentName: scenarioData?.lazerName || cachedProjectInfo.equipmentName || "-",
    status: "ACTIVE",
  };

  const metrics = scenarioData
    ? [
        { label: "선택된 잔재 수", value: String(scenarioData.totalWipNum ?? 0), unit: "EA" },
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
        { label: "선택된 잔재 수", value: "-", unit: "EA" },
        { label: "크레인 이동 횟수", value: "-", unit: "Times" },
        { label: "이동 횟수", value: "-", unit: "Times" },
        { label: "총 소요 시간", value: "--:--", unit: "HR", highlight: true },
      ];

  const timelineItems = scenarioData ? mapBatchItemsToTimeline(scenarioData.batchItems) : [];

  const handleGoBackNo = () => {
    clearScenarioLantekCache();
    setIsGoBackModalOpen(false);
    navigate("/office/scenario/input");
  };

  const handleGoBackYes = () => {
    const existingCache = getScenarioLantekCache();
    if (existingCache) setScenarioLantekCache(existingCache);
    setIsGoBackModalOpen(false);
    navigate("/office/scenario/input");
  };

  const handleAddConfirm = () => {
    setIsAddModalOpen(false);
    navigate("/office/scenario/creationhistory");
  };

  const handleSendConfirm = async () => {
    if (!scenarioId) {
      alert("시나리오 ID를 찾을 수 없습니다.");
      return;
    }
    try {
      await sendScenario(scenarioId);
      setIsSendModalOpen(false);
      clearScenarioLantekCache();
      navigate("/office/scenario/releasehistory");
    } catch (err) {
      console.error("시나리오 발행 실패:", err);
      const msg = err.response?.data?.message || "시나리오 발행에 실패했습니다.";
      alert(msg);
    }
  };

  return (
    <Web_AppLayout pageTitle="시나리오 결과 확인">
      <div className="px-8 pt-8 pb-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-headline text-lg font-bold tracking-tight text-on-surface">
              LANTEK 결과 입력 &gt; 시나리오 결과 확인
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-5 py-2.5 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container active:scale-95"
              onClick={() => setIsGoBackModalOpen(true)}
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              뒤로 가기
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container px-5 py-2.5 text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container-high active:scale-95"
              onClick={() => setIsAddModalOpen(true)}
            >
              <span className="material-symbols-outlined text-lg">add_box</span>
              이력 추가
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dim px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
              onClick={() => setIsSendModalOpen(true)}
            >
              <span className="material-symbols-outlined text-lg">publish</span>
              발행
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-24 text-center text-sm text-on-surface-variant">
            시나리오 결과를 불러오는 중...
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
            <Web_ScenarioTimelineSection items={timelineItems} />
          </>
        )}
      </div>

      {isGoBackModalOpen && (
        <Web_ScenarioGoBackModal
          onClose={() => setIsGoBackModalOpen(false)}
          onCancel={() => setIsGoBackModalOpen(false)}
          onNo={handleGoBackNo}
          onConfirm={handleGoBackYes}
        />
      )}
      {isAddModalOpen && (
        <Web_ScenarioAddModal
          onClose={() => setIsAddModalOpen(false)}
          onCancel={() => setIsAddModalOpen(false)}
          onConfirm={handleAddConfirm}
        />
      )}
      {isSendModalOpen && (
        <Web_ScenarioSendModal
          onClose={() => setIsSendModalOpen(false)}
          onCancel={() => setIsSendModalOpen(false)}
          onConfirm={handleSendConfirm}
        />
      )}
    </Web_AppLayout>
  );
}
