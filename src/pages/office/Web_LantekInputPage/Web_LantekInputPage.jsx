import { useState } from "react";
import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_LantekProjectForm from "../../../components/office/Web_LantekProjectForm/Web_LantekProjectForm";
import Web_LantekDetailSection from "../../../components/office/Web_LantekDetailSection/Web_LantekDetailSection";
import Web_LantekActionBar from "../../../components/office/Web_LantekActionBar/Web_LantekActionBar";

import Web_ProjectHistoryModal from "../../../components/modal/Web_ProjectHistoryModal/Web_ProjectHistoryModal";
import Web_LantekUploadModal from "../../../components/modal/Web_LantekUploadModal/Web_LantekUploadModal";
import Web_ScenarioCheckModal from "../../../components/modal/Web_ScenarioCheckModal/Web_ScenarioCheckModal";
import Web_LoadingModal from "../../../components/modal/Web_LoadingModal/Web_LoadingModal";
import Web_ResetConfirmModal from "../../../components/modal/Web_ResetConfirmModal/Web_ResetConfirmModal";

export default function Web_LantekInputPage() {
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

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isScenarioCheckModalOpen, setIsScenarioCheckModalOpen] =
    useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const isProjectInfoReady =
    projectInfo.projectName &&
    projectInfo.productionPlanName &&
    projectInfo.projectDueDate;

  const isResetDisabled = lantekRows.length === 0;
  const isImportDisabled = !isProjectInfoReady;
  const isScenarioDisabled = lantekRows.length === 0;

  const handleProjectInfoChange = (name, value) => {
    setProjectInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenHistory = () => {
    setIsHistoryModalOpen(true);
  };

  const handleOpenUpload = () => {
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
    setIsResetModalOpen(false);
  };

  const handleTemporarySave = () => {
    console.log("임시저장", { projectInfo, lantekRows });
  };

  const handleScenarioCheck = () => {
    if (!projectInfo.shipmentDate) {
      setShipmentDateError("필수 입력 사항입니다.");
      return;
    }

    setShipmentDateError("");
    setIsScenarioCheckModalOpen(true);
  };

  const handleConfirmScenario = () => {
    setIsScenarioCheckModalOpen(false);
    setIsLoadingModalOpen(true);

    setTimeout(() => {
      setIsLoadingModalOpen(false);
      // 추후 결과 페이지로 navigate
    }, 2000);
  };

  return (
    <Web_AppLayout pageTitle="자재 별 LANTEK 결과 입력">
      <div className="space-y-8 pb-24">
        <Web_LantekProjectForm
          projectInfo={projectInfo}
          shipmentDateError={shipmentDateError}
          onChange={handleProjectInfoChange}
          onOpenHistory={handleOpenHistory}
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
              productionPlanName: project.productionPlanName,
              projectDueDate: project.projectDueDate,
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
