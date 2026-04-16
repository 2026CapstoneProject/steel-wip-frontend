import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import App_Header from "../../../components/field/Header/App_Header";
import { getFieldReady } from "../../../services/fieldService";
import { setSelectedFieldScenarioId } from "../../../utils/App/selectedScenario";

// FieldReadyData → 화면용 scenario 항목으로 변환
function mapReadyDataToEquipment(readyDataList) {
  return (readyDataList ?? []).map((item) => {
    // 배치 전체에서 미완료 작업 수 산출 (relocation + picking 아이템 합산)
    const incompleteBatchCount = (item.batch ?? []).length;
    const totalItems =
      Number.isFinite(item.remainingTaskCount)
        ? item.remainingTaskCount
        : (item.batch ?? []).reduce(
            (sum, b) =>
              sum +
              (b.relocation?.length ?? 0) +
              (b.picking?.length ?? 0),
            0
          );

    return {
      equipmentId: `scenario-${item.scenarioId}`,
      equipmentName: `시나리오 #${item.scenarioId}`,
      scenarios: [
        {
          scenarioId: item.scenarioId,
          scenarioName: item.scenarioTitle || `시나리오 ${item.scenarioId}`,
          remainingTaskCount: totalItems,
          estimatedTime: "-",
          progress: Math.round((item.scenarioProgressRate ?? 0) * 100),
          urgent: false,
          // 다음 시나리오 정보 포함
          nextScenarioId: item.nextScenarioId ?? null,
          nextScenarioTitle: item.nextScenarioTitle ?? null,
        },
      ],
    };
  });
}

function App_StartPage() {
  const navigate = useNavigate();

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);

  useEffect(() => {
    fetchReadyData();
  }, []);

  const fetchReadyData = async () => {
    setLoading(true);
    try {
      const response = await getFieldReady();
      const data = response.data?.data ?? [];
      setEquipmentList(mapReadyDataToEquipment(data));
    } catch (err) {
      console.error("생산 준비 데이터 조회 실패:", err);
      setEquipmentList([]);
    } finally {
      setLoading(false);
    }
  };

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
    const urgentScenario = scenarios.find((s) => s.urgent);
    if (urgentScenario) return urgentScenario;
    const nearlyDone = scenarios.find((s) => Number(s.progress) >= 95);
    if (nearlyDone) return nearlyDone;
    return scenarios[0];
  };

  const handleSelectEquipment = (equipment) => {
    const representative = getRepresentativeScenario(equipment);
    if (!representative) return;
    setSelectedEquipmentId(equipment.equipmentId);
    setSelectedFieldScenarioId(representative.scenarioId);
    navigate("/App/ready", {
      state: {
        selectedEquipmentId: equipment.equipmentId,
        selectedScenarioId: representative.scenarioId,
        selectedScenario: {
          ...representative,
          equipmentId: equipment.equipmentId,
          equipmentName: equipment.equipmentName,
        },
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
            {loading && (
              <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#757684] shadow-sm">
                데이터를 불러오는 중...
              </div>
            )}

            {!loading && !hasData && (
              <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#757684] shadow-sm">
                표시할 시나리오가 없습니다.
              </div>
            )}

            {!loading &&
              hasData &&
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
                        } ${scenarios.length === 0 ? "cursor-not-allowed opacity-50" : ""}`}
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
                            <span className="material-symbols-outlined text-sm">assignment</span>
                            <span>{scenario.remainingTaskCount}개 남은 작업</span>
                          </div>
                          {scenario.estimatedTime && scenario.estimatedTime !== "-" && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              <span>{scenario.estimatedTime}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-[#505F76]">
                            <span>진행도</span>
                            <span className="text-[#191C1E]">{scenario.progress}%</span>
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
    </div>
  );
}

export default App_StartPage;
