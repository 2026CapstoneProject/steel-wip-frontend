import { useMemo, useState } from "react";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_ScenarioTimelineSection from "../../../components/office/Web_ScenarioTimelineSection/Web_ScenarioTimelineSection";

const EQUIPMENT_TABS = [
  { id: "laser-1", label: "레이저 설비 1" },
  { id: "laser-2", label: "레이저 설비 2" },
  { id: "all", label: "전체 보기" },
];

const INITIAL_FILTERS = {
  projectName: "",
  productionPlanName: "",
  actionType: "",
  minMinutes: "",
  maxMinutes: "",
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
              className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dim text-on-primary rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
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
                      ? "px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md transition-all"
                      : "px-6 py-2.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium text-sm hover:bg-surface-container-highest transition-all"
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {filteredTimelineItems.length > 0 ? (
            <Web_ScenarioTimelineSection items={filteredTimelineItems} />
          ) : (
            <div className="bg-surface-container-lowest rounded-xl p-10 text-center text-sm text-on-surface-variant shadow-sm">
              조회 조건에 해당하는 현장 작업이 없습니다.
            </div>
          )}
        </div>
      </div>
    </Web_AppLayout>
  );
}
