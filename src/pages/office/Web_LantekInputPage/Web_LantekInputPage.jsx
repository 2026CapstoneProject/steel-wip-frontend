import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_LantekProjectForm from "../../../components/office/Web_LantekProjectForm/Web_LantekProjectForm";
import Web_LantekDetailSection from "../../../components/office/Web_LantekDetailSection/Web_LantekDetailSection";
import Web_LantekActionBar from "../../../components/office/Web_LantekActionBar/Web_LantekActionBar";

import Web_ProjectHistoryModal from "../../../components/modal/Web_ProjectHistoryModal/Web_ProjectHistoryModal";
import Web_LantekUploadModal from "../../../components/modal/Web_LantekUploadModal/Web_LantekUploadModal";
import Web_ScenarioCheckModal from "../../../components/modal/Web_ScenarioCheckModal/Web_ScenarioCheckModal";
import Web_LoadingModal from "../../../components/modal/Web_LoadingModal/Web_LoadingModal";
import Web_ResetConfirmModal from "../../../components/modal/Web_ResetConfirmModal/Web_ResetConfirmModal";

import {
  getScenarioLantekCache,
  setScenarioLantekCache,
  clearScenarioLantekCache,
} from "../../../utils/Web/lantekCache";

import { createScenario } from "../../../services/scenarioService";
import { deleteLantekData } from "../../../services/lantekService";
import { runScheduler } from "../../../services/schedulerService";

export default function Web_LantekInputPage() {
  const navigate = useNavigate();

  const [projectInfo, setProjectInfo] = useState({
    projectId: null,       // 선택된 프로젝트 ID (백엔드 연동)
    scenarioId: null,      // 생성된 시나리오 ID (백엔드 연동)
    projectName: "",
    productionPlanName: "",
    projectDueDate: "",
    shipmentDate: "",       // 시나리오 납기일 (scenario_due 역할)
    equipmentName: "레이저 1호기",
    processPriority: "low",
  });

  const [lantekRows, setLantekRows] = useState([]);
  const [tempSavedFile, setTempSavedFile] = useState(null);

  const [shipmentDateError, setShipmentDateError] = useState("");
  const [productionPlanError, setProductionPlanError] = useState("");

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isScenarioCheckModalOpen, setIsScenarioCheckModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isCacheReady, setIsCacheReady] = useState(false);

  // 캐시에서 복원
  useEffect(() => {
    const cachedData = getScenarioLantekCache();
    if (cachedData?.projectInfo) {
      setProjectInfo((prev) => ({ ...prev, ...cachedData.projectInfo }));
    }
    if (Array.isArray(cachedData?.lantekRows)) {
      setLantekRows(cachedData.lantekRows);
    }
    if (cachedData?.tempSavedFile) {
      setTempSavedFile(cachedData.tempSavedFile);
    }
    setIsCacheReady(true);
  }, []);

  // 상태 변경 시 캐시 업데이트
  useEffect(() => {
    if (!isCacheReady) return;
    setScenarioLantekCache({ projectInfo, lantekRows, tempSavedFile });
  }, [isCacheReady, projectInfo, lantekRows, tempSavedFile]);

  const isProjectInfoReady = Boolean(
    projectInfo.projectId &&
    projectInfo.projectName &&
    projectInfo.projectDueDate &&
    projectInfo.shipmentDate &&
    projectInfo.productionPlanName
  );

  const isResetDisabled = lantekRows.length === 0;
  const isImportDisabled = !isProjectInfoReady;
  const isScenarioDisabled = lantekRows.length === 0;

  const handleProjectInfoChange = (name, value) => {
    setProjectInfo((prev) => {
      const next = { ...prev, [name]: value };
      // 출하일 변경 시 생산계획명 및 시나리오 ID 초기화 (새로 생성해야 하므로)
      if (name === "shipmentDate") {
        next.productionPlanName = "";
        next.scenarioId = null;
        setShipmentDateError("");
        setProductionPlanError("");
      }
      return next;
    });
  };

  const handleOpenHistory = () => {
    setIsHistoryModalOpen(true);
  };

  // 생산계획명 조회 = 시나리오 생성 API 호출
  const handleFetchProductionPlanName = async () => {
    if (!projectInfo.projectId || !projectInfo.projectName || !projectInfo.projectDueDate) {
      alert("먼저 프로젝트 이력을 선택해주세요.");
      return;
    }
    if (!projectInfo.shipmentDate) {
      setShipmentDateError("필수 입력 사항입니다.");
      return;
    }

    setShipmentDateError("");
    setProductionPlanError("");

    try {
      const response = await createScenario({
        project_id: projectInfo.projectId,
        scenario_due: projectInfo.shipmentDate,
      });
      const scenario = response.data?.data;
      setProjectInfo((prev) => ({
        ...prev,
        scenarioId: scenario.id,
        productionPlanName: scenario.title,
      }));
    } catch (err) {
      console.error("시나리오 생성 실패:", err);
      const msg = err.response?.data?.message || "시나리오 생성에 실패했습니다.";
      setProductionPlanError(msg);
    }
  };

  const handleOpenUpload = () => {
    if (!projectInfo.shipmentDate) {
      setShipmentDateError("필수 입력 사항입니다.");
      return;
    }
    if (!projectInfo.productionPlanName || !projectInfo.scenarioId) {
      setProductionPlanError("생산계획명을 먼저 조회해주세요.");
      return;
    }
    if (isImportDisabled) return;
    setIsUploadModalOpen(true);
  };

  const handleResetClick = () => {
    if (isResetDisabled) return;
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = async () => {
    // LANTEK 데이터 삭제 (시나리오 ID가 있는 경우)
    if (projectInfo.scenarioId) {
      try {
        await deleteLantekData(projectInfo.scenarioId);
      } catch (err) {
        console.error("LANTEK 초기화 실패:", err);
      }
    }

    setLantekRows([]);
    setTempSavedFile(null);
    setProjectInfo((prev) => ({ ...prev, scenarioId: null, productionPlanName: "" }));

    clearScenarioLantekCache();
    setIsResetModalOpen(false);
  };

  const handleTemporarySave = () => {
    setScenarioLantekCache({ projectInfo, lantekRows, tempSavedFile });
  };

  const handleScenarioCheck = () => {
    if (!projectInfo.shipmentDate) {
      setShipmentDateError("*필수 입력 사항입니다.");
      return;
    }
    if (!projectInfo.productionPlanName) {
      setProductionPlanError("생산계획명을 먼저 조회해주세요.");
      return;
    }
    setShipmentDateError("");
    setProductionPlanError("");
    setIsScenarioCheckModalOpen(true);
  };

  const handleConfirmScenario = async () => {
    setScenarioLantekCache({ projectInfo, lantekRows, tempSavedFile });
    setIsScenarioCheckModalOpen(false);
    setIsLoadingModalOpen(true);

    try {
      // 스케줄러(최적화 알고리즘) 실행
      await runScheduler(projectInfo.scenarioId);
      setIsLoadingModalOpen(false);
      navigate("/office/scenario/result", {
        state: { scenarioId: projectInfo.scenarioId },
      });
    } catch (err) {
      console.error("스케줄러 실행 실패:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Solver 실행에 실패했습니다. 시나리오 결과를 다시 생성해주세요.";
      setIsLoadingModalOpen(false);
      alert(errorMessage);
    }
  };

  return (
    <Web_AppLayout pageTitle="자재 별 LANTEK 결과 입력">
      <div className="space-y-8 pb-24">
        <Web_LantekProjectForm
          projectInfo={projectInfo}
          shipmentDateError={shipmentDateError}
          productionPlanError={productionPlanError}
          onChange={handleProjectInfoChange}
          onOpenHistory={handleOpenHistory}
          onFetchProductionPlanName={handleFetchProductionPlanName}
        />

        <Web_LantekDetailSection
          rows={lantekRows}
          isResetDisabled={isResetDisabled}
          isImportDisabled={isImportDisabled}
          onReset={handleResetClick}
          onImport={handleOpenUpload}
        />

        <Web_LantekActionBar
          isScenarioDisabled={isScenarioDisabled}
          onTemporarySave={handleTemporarySave}
          onScenarioCheck={handleScenarioCheck}
        />
      </div>

      {isHistoryModalOpen && (
        <Web_ProjectHistoryModal
          onClose={() => setIsHistoryModalOpen(false)}
          onSelectProject={(project) => {
            setProjectInfo((prev) => ({
              ...prev,
              projectId: project.id,
              projectName: project.projectName,
              projectDueDate: project.projectDueDate,
              productionPlanName: "",
              scenarioId: null,
            }));
            setIsHistoryModalOpen(false);
          }}
        />
      )}

      {isUploadModalOpen && (
        <Web_LantekUploadModal
          scenarioId={projectInfo.scenarioId}
          projectId={projectInfo.projectId}
          shipmentDate={projectInfo.shipmentDate}
          tempSavedFile={tempSavedFile}
          onScenarioResolved={(scenario) => {
            setProjectInfo((prev) => ({
              ...prev,
              scenarioId: scenario.id,
              productionPlanName: scenario.title,
            }));
          }}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={(file, lantekDataList) => {
            setTempSavedFile(file);
            // 백엔드 LantekScenarioData[] → lantekRows 형태로 변환
            const rows = (lantekDataList[0]?.lazerCutting ?? []).map((cut) => ({
              id: cut.id,
              jobName: cut.jobName,
              plannedSourceWipId: cut.plannedSourceWipId,
              estimatedCuttingTime: cut.estimatedCuttingTime,
              input: cut.input,
              estimatedWips: cut.estimatedWips,
            }));
            setLantekRows(rows);
            setIsUploadModalOpen(false);
          }}
        />
      )}

      {isScenarioCheckModalOpen && (
        <Web_ScenarioCheckModal
          onClose={() => setIsScenarioCheckModalOpen(false)}
          onConfirm={handleConfirmScenario}
        />
      )}

      {isLoadingModalOpen && <Web_LoadingModal />}

      {isResetModalOpen && (
        <Web_ResetConfirmModal
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleConfirmReset}
        />
      )}
    </Web_AppLayout>
  );
}
