import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function Web_ScenarioResultPage() {
  const navigate = useNavigate();

  const [isGoBackModalOpen, setIsGoBackModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const cachedData = getScenarioLantekCache();
  const cachedProjectInfo = cachedData?.projectInfo ?? {};

  const scenarioSummary = {
    scenarioId: "#00001",
    projectName: cachedProjectInfo.projectName || "-",
    productionPlanName: cachedProjectInfo.productionPlanName || "-",
    shipmentDate: cachedProjectInfo.shipmentDate || "-",
    equipmentName: cachedProjectInfo.equipmentName || "-",
    status: "ACTIVE",
  };

  const metrics = [
    { label: "선택된 잔재 수", value: "42", unit: "EA" },
    { label: "크레인 이동 횟수", value: "128", unit: "Times" },
    { label: "이동 횟수", value: "156", unit: "Times" },
    { label: "총 소요 시간", value: "02:45", unit: "HR", highlight: true },
  ];

  const timelineItems = [
    {
      id: 1,
      type: "재배치 (Relocation)",
      icon: "sync_alt",
      colorClass: "bg-primary ring-surface",
      iconColorClass: "text-primary",
      rows: [
        {
          qrNumber: "QR-AX-9021",
          thickness: "1.5",
          width: "1200",
          length: "2400",
          from: "Zone A-04",
          to: "Zone B-12",
          estimatedTime: "12",
        },
      ],
    },
    {
      id: 2,
      type: "피킹 (Picking)",
      subLabel: "(Batch #88)",
      icon: "inventory",
      colorClass: "bg-red-500 ring-surface",
      iconColorClass: "text-secondary",
      rows: [
        {
          qrNumber: "QR-PK-2201",
          thickness: "2.0",
          width: "1000",
          length: "2000",
          from: "Rack 44-A",
          to: "Laser 1 Tray",
          estimatedTime: "8",
        },
        {
          qrNumber: "QR-PK-2202",
          thickness: "2.0",
          width: "1000",
          length: "2000",
          from: "Rack 44-B",
          to: "Laser 1 Tray",
          estimatedTime: "8",
        },
        {
          qrNumber: "QR-PK-2203",
          thickness: "2.0",
          width: "1000",
          length: "2000",
          from: "Rack 44-C",
          to: "Laser 1 Tray",
          estimatedTime: "8",
        },
      ],
    },
    {
      id: 3,
      type: "적재 (Loading)",
      icon: "layers",
      colorClass: "bg-emerald-500 ring-surface",
      iconColorClass: "text-emerald-500",
      rows: [
        {
          qrNumber: "QR-LD-5001",
          thickness: "3.0",
          width: "1500",
          length: "3000",
          from: "Loading Bay 2",
          to: "Storage C-01",
          estimatedTime: "20",
        },
      ],
    },
  ];

  const handleCloseGoBackModal = () => {
    setIsGoBackModalOpen(false);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseSendModal = () => {
    setIsSendModalOpen(false);
  };

  const handleGoBackNo = () => {
    clearScenarioLantekCache();
    setIsGoBackModalOpen(false);
    navigate("/office/scenario/input");
  };

  const handleGoBackYes = () => {
    const existingCache = getScenarioLantekCache();

    if (existingCache) {
      setScenarioLantekCache(existingCache);
    }

    setIsGoBackModalOpen(false);
    navigate("/office/scenario/input");
  };

  const handleAddConfirm = () => {
    setIsAddModalOpen(false);
    navigate("/office/scenario/creationhistory");
  };

  const handleSendConfirm = () => {
    const releaseHistoryItem = {
      id: `release-${Date.now()}`,
      projectName: scenarioSummary.projectName,
      projectDeadline: scenarioSummary.shipmentDate,
      status: "in-progress",
      statusLabel: "In Progress",
      statusDescription: "진행 중",
      rows: [
        {
          id: `row-${Date.now()}`,
          productionPlanName: scenarioSummary.productionPlanName,
          shipmentDate: scenarioSummary.shipmentDate,
          releaseDate: new Date().toISOString().slice(0, 10),
          materialCount: Number(metrics[0]?.value || 0),
        },
      ],
    };

    setIsSendModalOpen(false);

    navigate("/office/scenario/releasehistory", {
      state: {
        releasedScenario: releaseHistoryItem,
      },
    });
  };

  return (
    <Web_AppLayout pageTitle="발행된 시나리오 결과 확인">
      <div className="px-8 pt-8 pb-12">
        <div className="mb-10 grid grid-cols-12 gap-6">
          <Web_ScenarioSummaryPanel summary={scenarioSummary} />
          <Web_ScenarioMetricCards
            metrics={metrics}
            equipmentName={scenarioSummary.equipmentName}
            status={scenarioSummary.status}
          />
        </div>

        <Web_ScenarioTimelineSection items={timelineItems} />
      </div>

      {isGoBackModalOpen && (
        <Web_ScenarioGoBackModal
          onClose={handleCloseGoBackModal}
          onCancel={handleCloseGoBackModal}
          onNo={handleGoBackNo}
          onConfirm={handleGoBackYes}
        />
      )}

      {isAddModalOpen && (
        <Web_ScenarioAddModal
          onClose={handleCloseAddModal}
          onCancel={handleCloseAddModal}
          onConfirm={handleAddConfirm}
        />
      )}

      {isSendModalOpen && (
        <Web_ScenarioSendModal
          onClose={handleCloseSendModal}
          onCancel={handleCloseSendModal}
          onConfirm={handleSendConfirm}
        />
      )}
    </Web_AppLayout>
  );
}
