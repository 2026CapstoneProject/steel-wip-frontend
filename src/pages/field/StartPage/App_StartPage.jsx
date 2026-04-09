import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import App_Header from "../../../components/field/Header/App_Header";

// 임시 mock 데이터
const mockEquipmentList = [
  {
    equipmentId: "eq-1",
    equipmentName: "설비 1",
    scenarios: [
      {
        scenarioId: "eq1-s1",
        scenarioName: "시나리오 1",
        remainingTaskCount: 3,
        estimatedTime: "1시 20분",
        progress: 95,
        urgent: false,
      },
      {
        scenarioId: "eq1-s2",
        scenarioName: "시나리오 2",
        remainingTaskCount: 20,
        estimatedTime: "11시 30분",
        progress: 0,
        urgent: false,
      },
    ],
  },
  {
    equipmentId: "eq-2",
    equipmentName: "설비 2",
    scenarios: [
      {
        scenarioId: "eq2-s1",
        scenarioName: "시나리오 1",
        remainingTaskCount: 13,
        estimatedTime: "9시 45분",
        progress: 0,
        urgent: true,
      },
      {
        scenarioId: "eq2-s2",
        scenarioName: "시나리오 2",
        remainingTaskCount: 10,
        estimatedTime: "9시 10분",
        progress: 10,
        urgent: false,
      },
    ],
  },
  {
    equipmentId: "eq-3",
    equipmentName: "설비 3",
    scenarios: [
      {
        scenarioId: "eq3-s1",
        scenarioName: "시나리오 1",
        remainingTaskCount: 18,
        estimatedTime: "12시 12분",
        progress: 0,
        urgent: false,
      },
    ],
  },
];

function App_StartPage() {
  const navigate = useNavigate();

  const [equipmentList] = useState(mockEquipmentList);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [workerCount, setWorkerCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasData = Array.isArray(equipmentList) && equipmentList.length > 0;

  const flattenedScenarios = useMemo(() => {
    return (equipmentList || []).flatMap((equipment) =>
      (equipment.scenarios || []).map((scenario) => ({
        ...scenario,
        equipmentId: equipment.equipmentId,
        equipmentName: equipment.equipmentName,
      }))
    );
  }, [equipmentList]);

  const getRepresentativeScenario = (equipment) => {
    const scenarios = equipment?.scenarios || [];
    if (scenarios.length === 0) return null;

    const urgentScenario = scenarios.find((scenario) => scenario.urgent);
    if (urgentScenario) return urgentScenario;

    const recommendedScenario = scenarios.find(
      (scenario) => Number(scenario.progress) >= 95
    );
    if (recommendedScenario) return recommendedScenario;

    return scenarios[0];
  };

  const handleSelectEquipment = (equipment) => {
    const representativeScenario = getRepresentativeScenario(equipment);
    if (!representativeScenario) return;

    setSelectedEquipmentId(equipment.equipmentId);
    setSelectedScenario({
      ...representativeScenario,
      equipmentId: equipment.equipmentId,
      equipmentName: equipment.equipmentName,
    });
    setWorkerCount(0);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDecreaseWorker = () => {
    setWorkerCount((prev) => Math.max(0, prev - 1));
  };

  const handleIncreaseWorker = () => {
    setWorkerCount((prev) => prev + 1);
  };

  const handleConfirmWorkerCount = () => {
    if (!selectedScenario) return;

    navigate("/App/tasks", {
      state: {
        selectedEquipmentId,
        selectedScenarioId: selectedScenario.scenarioId,
        selectedScenario,
        workerCount,
        scenarioList: flattenedScenarios,
      },
    });
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#F7F9FB] font-['Inter'] text-[#191C1E]">
      <div className="shrink-0">
        <App_Header />
      </div>

      <main className="mx-auto h-[calc(100dvh-72px)] w-full max-w-lg">
        <div className="h-full overflow-y-auto px-4 py-6">
          <div className="space-y-8">
            {!hasData && (
              <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#757684] shadow-sm">
                표시할 시나리오가 없습니다.
              </div>
            )}

            {hasData &&
              equipmentList.map((equipment) => {
                const scenarios = equipment.scenarios || [];
                const isSelected = selectedEquipmentId === equipment.equipmentId;

                return (
                  <section key={equipment.equipmentId} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-1 rounded-full bg-[#3F51B5]" />
                        <h2 className="text-xl font-bold text-[#3F51B5]">
                          {equipment.equipmentName}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectEquipment(equipment)}
                        disabled={scenarios.length === 0}
                        className={`rounded-xl px-8 py-2.5 text-sm font-bold transition-transform active:scale-95 ${
                          isSelected
                            ? "bg-[#5C6BC0] text-white shadow-md"
                            : "bg-[#E8EAF6] text-[#5C6BC0]"
                        } ${
                          scenarios.length === 0
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                      >
                        선택
                      </button>
                    </div>

                    {scenarios.length === 0 && (
                      <div className="rounded-[2rem] bg-white p-6 text-sm text-[#757684] shadow-sm">
                        진행 중인 시나리오가 없습니다.
                      </div>
                    )}

                    {scenarios.map((scenario) => (
                      <div
                        key={scenario.scenarioId}
                        className="rounded-[2rem] bg-white p-6 shadow-sm"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <h3 className="text-lg font-bold text-[#191C1E]">
                            {scenario.scenarioName}
                          </h3>

                          {scenario.urgent && (
                            <span className="rounded-full bg-[#FFEBEE] px-2.5 py-1 text-[10px] font-bold text-[#D32F2F]">
                              긴급 발주
                            </span>
                          )}
                        </div>

                        <div className="mb-6 flex items-center gap-4 text-xs font-medium text-[#505F76]">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              assignment
                            </span>
                            <span>{scenario.remainingTaskCount}개 남은 작업</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              schedule
                            </span>
                            <span>{scenario.estimatedTime}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-[#505F76]">
                            <span>진행도</span>
                            <span className="text-[#191C1E]">
                              {scenario.progress}%
                            </span>
                          </div>

                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E0E3E5]">
                            <div
                              className="h-full bg-[#5C6BC0]"
                              style={{ width: `${scenario.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </section>
                );
              })}
          </div>
        </div>
      </main>

      {isModalOpen && selectedScenario && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-6 backdrop-blur-[4px]">
          <div className="w-full max-w-[340px] rounded-[2rem] bg-white shadow-2xl">
            <div className="space-y-8 p-8">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-[#191C1E]">
                  {selectedScenario.equipmentName}, {selectedScenario.scenarioName}
                </h2>
              </div>

              <div className="space-y-4">
                <label className="block text-center text-sm font-semibold text-[#505F76]">
                  작업자 수
                </label>

                <div className="flex items-center justify-between px-2">
                  <button
                    type="button"
                    onClick={handleDecreaseWorker}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3F51B5] text-white shadow-lg active:scale-90"
                  >
                    <span className="material-symbols-outlined text-2xl">
                      remove
                    </span>
                  </button>

                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-[#D9DCE8]">
                    <span className="text-4xl font-extrabold text-[#4F59B7]">
                      {workerCount}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleIncreaseWorker}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3F51B5] text-white shadow-lg active:scale-90"
                  >
                    <span className="material-symbols-outlined text-2xl">
                      add
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmWorkerCount}
                  className="w-full rounded-xl bg-[#E8EAF6] py-4 text-lg font-bold text-[#5C6BC0] shadow-lg active:scale-[0.98]"
                >
                  확인
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-2 text-center text-base font-medium text-[#505F76]"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App_StartPage;