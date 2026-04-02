import { useState } from "react";
import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_ScenarioSummaryPanel from "../../../components/office/Web_ScenarioSummaryPanel/Web_ScenarioSummaryPanel";
import Web_ScenarioMetricCards from "../../../components/office/Web_ScenarioMetricCards/Web_ScenarioMetricCards";
import Web_ScenarioTimelineSection from "../../../components/office/Web_ScenarioTimelineSection/Web_ScenarioTimelineSection";

import Web_ScenarioGoBackModal from "../../../components/modal/Web_ScenarioGoBackModal/Web_ScenarioGoBackModal";
import Web_ScenarioAddModal from "../../../components/modal/Web_ScenarioAddModal/Web_ScenarioAddModal";
import Web_ScenarioSendModal from "../../../components/modal/Web_ScenarioSendModal/Web_ScenarioSendModal";

export default function Web_ScenarioResultPage() {
  const [isGoBackModalOpen, setIsGoBackModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const scenarioSummary = {
    scenarioId: "#00001",
    projectName: "토네이도 건설",
    productionPlanName: "토네이도 건설-1",
    shipmentDate: "2026.03.20",
    equipmentName: "레이저 절단기 2호기",
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
      colorClass: "bg-secondary ring-surface",
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

  return (
    <Web_AppLayout pageTitle="시나리오 결과 확인">
      <div className="px-8 pt-8 pb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-lg font-bold text-on-surface tracking-tight font-headline">
              시나리오 생성 이력 &gt; 시나리오 결과 확인
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/10 bg-surface-container-lowest text-on-surface font-semibold text-sm hover:bg-surface-container transition-all active:scale-95"
              onClick={() => setIsGoBackModalOpen(true)}
            >
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>
              뒤로 가기
            </button>

            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-semibold text-sm border border-outline-variant/10 hover:bg-surface-container-high transition-all active:scale-95"
              onClick={() => setIsAddModalOpen(true)}
            >
              <span className="material-symbols-outlined text-lg">add_box</span>
              이력 추가
            </button>

            <button
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dim text-white font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95"
              onClick={() => setIsSendModalOpen(true)}
            >
              <span className="material-symbols-outlined text-lg">publish</span>
              발행
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 mb-10">
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
          onClose={() => setIsGoBackModalOpen(false)}
          onCancel={() => setIsGoBackModalOpen(false)}
          onNo={() => {
            setIsGoBackModalOpen(false);
            // navigate("/office/scenario/input")
          }}
          onConfirm={() => {
            setIsGoBackModalOpen(false);
            // 기존 LANTEK 정보 불러오기 후 이동
            // navigate("/office/scenario/input")
          }}
        />
      )}

      {isAddModalOpen && (
        <Web_ScenarioAddModal
          onClose={() => setIsAddModalOpen(false)}
          onCancel={() => setIsAddModalOpen(false)}
          onConfirm={() => {
            setIsAddModalOpen(false);
            // 이력 저장 후 시나리오 생성 이력 페이지로 이동
            // navigate("/office/scenario")
          }}
        />
      )}

      {isSendModalOpen && (
        <Web_ScenarioSendModal
          onClose={() => setIsSendModalOpen(false)}
          onCancel={() => setIsSendModalOpen(false)}
          onConfirm={() => {
            setIsSendModalOpen(false);
            // 현장 발행 후 현장 전송 이력 또는 다음 페이지 이동
          }}
        />
      )}
    </Web_AppLayout>
  );
}
