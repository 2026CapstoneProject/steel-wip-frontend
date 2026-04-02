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

export default function Web_LantekInputPage() {
  const navigate = useNavigate();

  const [projectInfo, setProjectInfo] = useState({
    projectName: "",
    productionPlanName: "",
    projectDueDate: "",
    shipmentDate: "",
    equipmentName: "레이저 1호기",
    processPriority: "low",
  });

  const [lantekRows, setLantekRows] = useState([]);
  const [tempSavedFile, setTempSavedFile] = useState(null);

  const [shipmentDateError, setShipmentDateError] = useState("");
  const [productionPlanError, setProductionPlanError] = useState("");

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isScenarioCheckModalOpen, setIsScenarioCheckModalOpen] =
    useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isCacheReady, setIsCacheReady] = useState(false);

  useEffect(() => {
    const cachedData = getScenarioLantekCache();

    if (cachedData?.projectInfo) {
      setProjectInfo((prev) => ({
        ...prev,
        ...cachedData.projectInfo,
      }));
    }

    if (Array.isArray(cachedData?.lantekRows)) {
      setLantekRows(cachedData.lantekRows);
    }

    if (cachedData?.tempSavedFile) {
      setTempSavedFile(cachedData.tempSavedFile);
    }

    setIsCacheReady(true);
  }, []);

  useEffect(() => {
    if (!isCacheReady) return;

    setScenarioLantekCache({
      projectInfo,
      lantekRows,
      tempSavedFile,
    });
  }, [isCacheReady, projectInfo, lantekRows, tempSavedFile]);

  const isProjectInfoReady = Boolean(
    projectInfo.projectName &&
    projectInfo.projectDueDate &&
    projectInfo.shipmentDate &&
    projectInfo.productionPlanName,
  );

  const isResetDisabled = lantekRows.length === 0;
  const isImportDisabled = !isProjectInfoReady;
  const isScenarioDisabled = lantekRows.length === 0;

  const handleProjectInfoChange = (name, value) => {
    setProjectInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "shipmentDate" && value) {
      setShipmentDateError("");
      setProductionPlanError("");
      setProjectInfo((prev) => ({
        ...prev,
        shipmentDate: value,
        productionPlanName: "",
      }));
    }
  };

  const handleOpenHistory = () => {
    setIsHistoryModalOpen(true);
  };

  const handleFetchProductionPlanName = async () => {
    if (!projectInfo.projectName || !projectInfo.projectDueDate) {
      alert("먼저 프로젝트 이력을 선택해주세요.");
      return;
    }

    if (!projectInfo.shipmentDate) {
      setShipmentDateError("필수 입력 사항입니다.");
      return;
    }

    setShipmentDateError("");
    setProductionPlanError("");

    const mockExistingPlans = [
      {
        shipmentDate: "2026-04-10",
        productionPlanName: "토네이도 건설-1",
      },
      {
        shipmentDate: "2026-04-12",
        productionPlanName: "토네이도 건설-2",
      },
    ];

    const matchedPlan = mockExistingPlans.find(
      (item) => item.shipmentDate === projectInfo.shipmentDate,
    );

    let nextPlanName = "";

    if (matchedPlan) {
      nextPlanName = matchedPlan.productionPlanName;
    } else {
      const latestNumber = mockExistingPlans.reduce((max, item) => {
        const lastPart = item.productionPlanName.split("-").pop();
        const parsed = Number(lastPart);
        return Number.isNaN(parsed) ? max : Math.max(max, parsed);
      }, 0);

      nextPlanName = `${projectInfo.projectName}-${latestNumber + 1}`;
    }

    setProjectInfo((prev) => ({
      ...prev,
      productionPlanName: nextPlanName,
    }));
  };

  const handleOpenUpload = () => {
    if (!projectInfo.shipmentDate) {
      setShipmentDateError("필수 입력 사항입니다.");
      return;
    }

    if (!projectInfo.productionPlanName) {
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

  const handleConfirmReset = () => {
    setLantekRows([]);
    setTempSavedFile(null);

    clearScenarioLantekCache();
    setScenarioLantekCache({
      projectInfo,
      lantekRows: [],
      tempSavedFile: null,
    });

    setIsResetModalOpen(false);
  };

  const handleTemporarySave = () => {
    setScenarioLantekCache({
      projectInfo,
      lantekRows,
      tempSavedFile,
    });

    console.log("임시저장", { projectInfo, lantekRows });
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

  const handleConfirmScenario = () => {
    setScenarioLantekCache({
      projectInfo,
      lantekRows,
      tempSavedFile,
    });

    setIsScenarioCheckModalOpen(false);
    setIsLoadingModalOpen(true);

    setTimeout(() => {
      setIsLoadingModalOpen(false);
      navigate("/office/scenario/result");
    }, 2000);
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
              projectName: project.projectName,
              projectDueDate: project.projectDueDate,
              productionPlanName: "",
            }));
            setIsHistoryModalOpen(false);
          }}
        />
      )}

      {isUploadModalOpen && (
        <Web_LantekUploadModal
          tempSavedFile={tempSavedFile}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={(file, parsedRows) => {
            setTempSavedFile(file);
            setLantekRows(parsedRows);
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
