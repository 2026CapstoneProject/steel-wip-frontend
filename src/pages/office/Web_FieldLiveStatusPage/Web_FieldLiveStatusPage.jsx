import { useMemo, useState } from "react";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_ScenarioTimelineSection from "../../../components/office/Web_ScenarioTimelineSection/Web_ScenarioTimelineSection.jsx";

const EQUIPMENT_TABS = [
  { id: "laser-1", label: "레이저 설비 1" },
  { id: "laser-2", label: "레이저 설비 2" },
  { id: "laser-3", label: "레이저 설비 3" },
  { id: "all", label: "전체 보기" },
];

const INITIAL_FILTERS = {
  projectName: "",
  productionPlanName: "",
  actionType: "",
  minMinutes: "",
  maxMinutes: "",
};

const CURRENT_SCENARIO_BY_EQUIPMENT = {
  "laser-1": {
    id: "scenario-000005",
    scenarioId: "#000005",
    projectName: "토네이도",
    productionPlanName: "토네이도-2",
    projectDeadline: "2026-03-30",
    shipmentDate: "2026-03-20",
    createdAt: "2026-03-02 11:30:45",
    scrapCount: 132,
    moveCount: 1310,
    totalMinutes: 435,
    isReleased: false,
  },
  "laser-2": {
    id: "scenario-000006",
    scenarioId: "#000006",
    projectName: "태풍",
    productionPlanName: "태풍-1",
    projectDeadline: "2026-04-05",
    shipmentDate: "2026-03-25",
    createdAt: "2026-03-03 09:10:20",
    scrapCount: 98,
    moveCount: 860,
    totalMinutes: 320,
    isReleased: true,
  },
  "laser-3": {
    id: "scenario-000007",
    scenarioId: "#000007",
    projectName: "허리케인",
    productionPlanName: "허리케인-1",
    projectDeadline: "2026-04-10",
    shipmentDate: "2026-03-30",
    createdAt: "2026-03-03 09:10:20",
    scrapCount: 98,
    moveCount: 860,
    totalMinutes: 320,
    isReleased: true,
  },
};

const NEXT_SCENARIO_BY_EQUIPMENT = {
  "laser-1": {
    id: "scenario-000006",
    scenarioId: "#000006",
    projectName: "토네이도",
    productionPlanName: "토마토-1",
    shipmentDate: "2026-03-29",
  },
  "laser-2": {
    id: "scenario-000007",
    scenarioId: "#000007",
    projectName: "태풍",
    productionPlanName: "태풍-2",
    shipmentDate: "2026-04-06",
  },
  "laser-3": {
    id: "scenario-000008",
    scenarioId: "#000008",
    projectName: "허리케인",
    productionPlanName: "허리케인-2",
    shipmentDate: "2026-05-11",
  },
};

const TIMELINE_ITEMS = [
  {
    id: 1,
    equipmentId: "laser-1",
    projectName: "A동 외장재 프로젝트",
    productionPlanName: "외장재 생산계획 1차",
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
        status: "이동중",
        statusClass: "bg-secondary-container text-on-secondary-container",
      },
    ],
  },
  {
    id: 2,
    equipmentId: "laser-1",
    projectName: "A동 외장재 프로젝트",
    productionPlanName: "외장재 생산계획 1차",
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
        status: "대기",
        statusClass: "bg-surface-container-highest text-on-surface-variant",
      },
      {
        qrNumber: "QR-PK-2202",
        thickness: "2.0",
        width: "1000",
        length: "2000",
        from: "Rack 44-B",
        to: "Laser 1 Tray",
        estimatedTime: "8",
        status: "대기",
        statusClass: "bg-surface-container-highest text-on-surface-variant",
      },
      {
        qrNumber: "QR-PK-2203",
        thickness: "2.0",
        width: "1000",
        length: "2000",
        from: "Rack 44-C",
        to: "Laser 1 Tray",
        estimatedTime: "8",
        status: "대기",
        statusClass: "bg-surface-container-highest text-on-surface-variant",
      },
    ],
  },
  {
    id: 3,
    equipmentId: "laser-2",
    projectName: "B동 절단 프로젝트",
    productionPlanName: "절단 생산계획 2차",
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
        status: "완료",
        statusClass: "bg-emerald-100 text-emerald-700",
      },
    ],
  },
  {
    id: 3,
    equipmentId: "laser-3",
    projectName: "C동 절단 프로젝트",
    productionPlanName: "절단 생산계획 3차",
    type: "적재 (Loading)",
    icon: "layers",
    colorClass: "bg-emerald-500 ring-surface",
    iconColorClass: "text-emerald-500",
    rows: [
      {
        qrNumber: "QR-LD-5004",
        thickness: "8.0",
        width: "2000",
        length: "3000",
        from: "Loading Bay 3",
        to: "Storage D-02",
        estimatedTime: "20",
        status: "완료",
        statusClass: "bg-emerald-100 text-emerald-700",
      },
    ],
  },
];

export default function Web_FieldLiveStatusPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchFilters, setSearchFilters] = useState(INITIAL_FILTERS);
  const [selectedEquipment, setSelectedEquipment] = useState("laser-1");

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setSearchFilters(INITIAL_FILTERS);
    setSelectedEquipment("laser-1");
  };

  const handleSearch = () => {
    setSearchFilters(filters);
  };

  const currentScenario =
    selectedEquipment === "all"
      ? null
      : (CURRENT_SCENARIO_BY_EQUIPMENT[selectedEquipment] ?? null);

  const nextScenario =
    selectedEquipment === "all"
      ? null
      : (NEXT_SCENARIO_BY_EQUIPMENT[selectedEquipment] ?? null);

  const filteredTimelineItems = useMemo(() => {
    return TIMELINE_ITEMS.filter((item) => {
      const isEquipmentMatched =
        selectedEquipment === "all" || item.equipmentId === selectedEquipment;

      const isProjectMatched =
        !searchFilters.projectName ||
        item.projectName
          .toLowerCase()
          .includes(searchFilters.projectName.toLowerCase());

      const isProductionPlanMatched =
        !searchFilters.productionPlanName ||
        item.productionPlanName
          .toLowerCase()
          .includes(searchFilters.productionPlanName.toLowerCase());

      const isActionMatched =
        !searchFilters.actionType ||
        item.type.includes(searchFilters.actionType);

      const filteredRows = item.rows.filter((row) => {
        const estimatedTime = Number(row.estimatedTime);
        const minMinutes =
          searchFilters.minMinutes === ""
            ? null
            : Number(searchFilters.minMinutes);
        const maxMinutes =
          searchFilters.maxMinutes === ""
            ? null
            : Number(searchFilters.maxMinutes);

        const isMinMatched = minMinutes === null || estimatedTime >= minMinutes;
        const isMaxMatched = maxMinutes === null || estimatedTime <= maxMinutes;

        return isMinMatched && isMaxMatched;
      });

      return (
        isEquipmentMatched &&
        isProjectMatched &&
        isProductionPlanMatched &&
        isActionMatched &&
        filteredRows.length > 0
      );
    }).map((item) => {
      const minMinutes =
        searchFilters.minMinutes === ""
          ? null
          : Number(searchFilters.minMinutes);
      const maxMinutes =
        searchFilters.maxMinutes === ""
          ? null
          : Number(searchFilters.maxMinutes);

      const filteredRows = item.rows.filter((row) => {
        const estimatedTime = Number(row.estimatedTime);
        const isMinMatched = minMinutes === null || estimatedTime >= minMinutes;
        const isMaxMatched = maxMinutes === null || estimatedTime <= maxMinutes;

        return isMinMatched && isMaxMatched;
      });

      return {
        ...item,
        rows: filteredRows,
      };
    });
  }, [searchFilters, selectedEquipment]);

  return (
    <Web_AppLayout pageTitle="실시간 현장 조회">
      <div className="px-8 pt-8 pb-12">
        <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            <h3 className="font-headline text-lg font-bold text-on-surface">
              Search Filter
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">
                프로젝트 명
              </label>
              <input
                type="text"
                value={filters.projectName}
                onChange={(event) =>
                  handleChangeFilter("projectName", event.target.value)
                }
                placeholder="프로젝트명 입력"
                className="w-full h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-body"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">
                생산계획명
              </label>
              <input
                type="text"
                value={filters.productionPlanName}
                onChange={(event) =>
                  handleChangeFilter("productionPlanName", event.target.value)
                }
                placeholder="생산계획명 입력"
                className="w-full h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-body"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">
                이동 행위
              </label>
              <select
                value={filters.actionType}
                onChange={(event) =>
                  handleChangeFilter("actionType", event.target.value)
                }
                className="w-full h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-sm"
              >
                <option value="">전체</option>
                <option value="재배치">재배치</option>
                <option value="피킹">피킹</option>
                <option value="적재">적재</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">
                소요 시간 (분)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.minMinutes}
                  onChange={(event) =>
                    handleChangeFilter("minMinutes", event.target.value)
                  }
                  placeholder="최소 시간"
                  className="w-1/2 h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-sm"
                />
                <span className="text-on-surface-variant">~</span>
                <input
                  type="number"
                  min="0"
                  value={filters.maxMinutes}
                  onChange={(event) =>
                    handleChangeFilter("maxMinutes", event.target.value)
                  }
                  placeholder="최대 시간"
                  className="w-1/2 h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-dim px-8 py-3 font-bold text-white shadow-md transition-all active:scale-95 hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              조회
            </button>
          </div>
        </section>

        <div className="space-y-4">
          <div className="flex gap-4 mb-8">
            {EQUIPMENT_TABS.map((tab) => {
              const isActive = selectedEquipment === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedEquipment(tab.id)}
                  className={
                    isActive
                      ? "px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-md"
                      : "px-6 py-2.5 rounded-full bg-surface-container-high text-white font-medium text-sm hover:bg-surface-container-highest"
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {selectedEquipment !== "all" && currentScenario && (
            <section className="mb-6 rounded-[1.5rem] border border-outline bg-surface-container-lowest px-12 py-5">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-on-surface font-headline">
                  진행 중인 시나리오
                </h3>
              </div>

              <div className="text-base text-on-surface font-medium">
                프로젝트 명: {currentScenario.projectName}
                <span className="mx-3">|</span>
                생산계획명: {currentScenario.productionPlanName}
                <span className="mx-3">|</span>
                생산 계획 출하일: {currentScenario.shipmentDate}
              </div>
            </section>
          )}

          {filteredTimelineItems.length > 0 ? (
            <Web_ScenarioTimelineSection items={filteredTimelineItems} />
          ) : (
            <div className="bg-surface-container-lowest rounded-xl p-10 text-center text-sm text-on-surface-variant shadow-sm">
              조회 조건에 해당하는 현장 작업이 없습니다.
            </div>
          )}

          {selectedEquipment !== "all" && nextScenario && (
            <section className="mt-8 opacity-60 rounded-[1.5rem] border border-outline bg-surface-container-lowest px-10 py-5">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-on-surface font-headline">
                  이후 진행 예정 시나리오
                </h3>
              </div>

              <div className="text-base text-on-surface font-medium">
                프로젝트 명: {nextScenario.projectName}
                <span className="mx-2 text-on-surface-variant">|</span>
                생산계획명: {nextScenario.productionPlanName}
                <span className="mx-2 text-on-surface-variant">|</span>
                생산 계획 출하일: {nextScenario.shipmentDate}
              </div>
            </section>
          )}
        </div>
      </div>
    </Web_AppLayout>
  );
}
