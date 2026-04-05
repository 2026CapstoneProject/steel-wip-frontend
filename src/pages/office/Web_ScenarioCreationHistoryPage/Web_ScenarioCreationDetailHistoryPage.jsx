import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_ScenarioSummaryPanel from "../../../components/office/Web_ScenarioSummaryPanel/Web_ScenarioSummaryPanel";
import Web_ScenarioMetricCards from "../../../components/office/Web_ScenarioMetricCards/Web_ScenarioMetricCards";
import Web_ScenarioTimelineSection from "../../../components/office/Web_ScenarioTimelineSection/Web_ScenarioTimelineSection";

export default function Web_ScenarioCreationDetailHistoryPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const projectInfo = location.state?.projectInfo ?? null;

  useEffect(() => {
    if (!projectInfo) {
      navigate("/office/scenario/creationhistory", { replace: true });
    }
  }, [projectInfo, navigate]);

  if (!projectInfo) {
    return null;
  }

  const scenarioSummary = {
    scenarioId: projectInfo.scenarioId || "-",
    projectName: projectInfo.projectName || "-",
    productionPlanName: projectInfo.productionPlanName || "-",
    shipmentDate: projectInfo.shipmentDate || "-",
    equipmentName: projectInfo.equipmentName || "-",
    status: projectInfo.statusLabel || "미발행",
  };

  const metrics = [
    {
      label: "선택된 잔재 수",
      value:
        projectInfo.scrapCount !== undefined && projectInfo.scrapCount !== null
          ? String(projectInfo.scrapCount)
          : "-",
      unit: "EA",
    },
    {
      label: "크레인 이동 횟수",
      value:
        projectInfo.craneMoveCount !== undefined &&
        projectInfo.craneMoveCount !== null
          ? String(projectInfo.craneMoveCount)
          : "-",
      unit: "Times",
    },
    {
      label: "이동 횟수",
      value:
        projectInfo.moveCount !== undefined && projectInfo.moveCount !== null
          ? String(projectInfo.moveCount)
          : "-",
      unit: "Times",
    },
    {
      label: "총 소요 시간",
      value:
        projectInfo.totalMinutes !== undefined &&
        projectInfo.totalMinutes !== null
          ? String(projectInfo.totalMinutes)
          : "-",
      unit: "MIN",
      highlight: true,
    },
  ];

  const timelineItems = [
    {
      id: 1,
      type: "시나리오 상세 이력",
      icon: "history",
      colorClass: "bg-primary ring-surface",
      iconColorClass: "text-primary",
      rows: [
        {
          qrNumber: "-",
          thickness: "-",
          width: "-",
          length: "-",
          from: "-",
          to: "-",
          estimatedTime: "-",
        },
      ],
    },
  ];

  return (
    <Web_AppLayout pageTitle="시나리오 생성 이력 상세">
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
    </Web_AppLayout>
  );
}
