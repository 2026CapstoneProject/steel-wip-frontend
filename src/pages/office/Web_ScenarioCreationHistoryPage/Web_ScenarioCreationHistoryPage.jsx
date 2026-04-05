import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import { clearScenarioLantekCache } from "../../../utils/Web/lantekCache";

const DEFAULT_SCENARIO_HISTORY = [
  {
    id: "scenario-000001",
    scenarioId: "#000001",
    projectName: "토네이도 I&C",
    productionPlanName: "토네이도 I&C-1",
    projectDeadline: "2026-03-30",
    shipmentDate: "2026-03-04",
    createdAt: "2026-03-04 10:00:30",
    scrapCount: 130,
    moveCount: 1245,
    totalMinutes: 420,
    isReleased: false,
  },
  {
    id: "scenario-000002",
    scenarioId: "#000002",
    projectName: "토네이도 I&C",
    productionPlanName: "토네이도 I&C-2",
    projectDeadline: "2026-03-30",
    shipmentDate: "2026-03-04",
    createdAt: "2026-03-04 09:15:12",
    scrapCount: 125,
    moveCount: 1180,
    totalMinutes: 395,
    isReleased: false,
  },
  {
    id: "scenario-000003",
    scenarioId: "#000003",
    projectName: "토네이도 건설",
    productionPlanName: "토네이도 건설-1",
    projectDeadline: "2026-03-28",
    shipmentDate: "2026-03-03",
    createdAt: "2026-03-03 16:40:00",
    scrapCount: 210,
    moveCount: 2890,
    totalMinutes: 680,
    isReleased: false,
  },
  {
    id: "scenario-000004",
    scenarioId: "#000004",
    projectName: "토네이도 건설",
    productionPlanName: "토네이도 건설-2",
    projectDeadline: "2026-03-27",
    shipmentDate: "2026-03-03",
    createdAt: "2026-03-03 14:22:15",
    scrapCount: 45,
    moveCount: 620,
    totalMinutes: 180,
    isReleased: false,
  },
  {
    id: "scenario-000005",
    scenarioId: "#000005",
    projectName: "삼성전자",
    productionPlanName: "삼성전자-1",
    projectDeadline: "2026-03-30",
    shipmentDate: "2026-03-02",
    createdAt: "2026-03-02 11:30:45",
    scrapCount: 132,
    moveCount: 1310,
    totalMinutes: 435,
    isReleased: false,
  },
];

const DEFAULT_FILTERS = {
  projectName: "",
  productionPlanName: "",
  projectDeadlineFrom: "",
  projectDeadlineTo: "",
  shipmentDateFrom: "",
  shipmentDateTo: "",
  createdAtFrom: "",
  createdAtTo: "",
};

function normalizeDate(dateValue) {
  if (!dateValue) return "";
  return String(dateValue).slice(0, 10).replaceAll(".", "-");
}

function isWithinDateRange(targetDate, fromDate, toDate) {
  const normalizedTarget = normalizeDate(targetDate);
  const normalizedFrom = normalizeDate(fromDate);
  const normalizedTo = normalizeDate(toDate);

  if (!normalizedTarget) return false;
  if (normalizedFrom && normalizedTarget < normalizedFrom) return false;
  if (normalizedTo && normalizedTarget > normalizedTo) return false;
  return true;
}

function sortByCreatedAtDesc(list) {
  return [...list].sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt)),
  );
}

function FilterInput({ label, name, value, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border-none bg-surface-container-high px-4 text-sm font-body transition-all focus:bg-white focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

function DateRangeInput({
  label,
  fromName,
  toName,
  fromValue,
  toValue,
  onChange,
}) {
  return (
    <div className="space-y-2">
      <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="date"
          name={fromName}
          value={fromValue}
          onChange={onChange}
          className="h-12 w-1/2 rounded-lg border-none bg-surface-container-high px-4 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary"
        />
        <span className="text-on-surface-variant">~</span>
        <input
          type="date"
          name={toName}
          value={toValue}
          onChange={onChange}
          className="h-12 w-1/2 rounded-lg border-none bg-surface-container-high px-4 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}

export default function Web_ScenarioCreationHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const incomingState = location.state ?? {};
  const initialProductionPlanName = incomingState.productionPlanName ?? "";

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    productionPlanName: initialProductionPlanName,
  }));

  const [appliedFilters, setAppliedFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    productionPlanName: initialProductionPlanName,
  }));

  const [scenarioHistoryList, setScenarioHistoryList] = useState(() =>
    sortByCreatedAtDesc(
      DEFAULT_SCENARIO_HISTORY.filter((item) => !item.isReleased),
    ),
  );

  const baseVisibleList = useMemo(() => {
    return scenarioHistoryList.filter((item) => !item.isReleased);
  }, [scenarioHistoryList]);

  const filteredList = useMemo(() => {
    return baseVisibleList.filter((item) => {
      const projectNameMatched = item.projectName
        .toLowerCase()
        .includes(appliedFilters.projectName.trim().toLowerCase());

      const productionPlanMatched = item.productionPlanName
        .toLowerCase()
        .includes(appliedFilters.productionPlanName.trim().toLowerCase());

      const projectDeadlineMatched = isWithinDateRange(
        item.projectDeadline,
        appliedFilters.projectDeadlineFrom,
        appliedFilters.projectDeadlineTo,
      );

      const shipmentDateMatched = isWithinDateRange(
        item.shipmentDate,
        appliedFilters.shipmentDateFrom,
        appliedFilters.shipmentDateTo,
      );

      const createdAtMatched = isWithinDateRange(
        item.createdAt,
        appliedFilters.createdAtFrom,
        appliedFilters.createdAtTo,
      );

      return (
        projectNameMatched &&
        productionPlanMatched &&
        projectDeadlineMatched &&
        shipmentDateMatched &&
        createdAtMatched
      );
    });
  }, [baseVisibleList, appliedFilters]);

  const handleChangeFilter = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const handleCreateScenario = () => {
    clearScenarioLantekCache();
    navigate("/office/scenario/input");
  };

  const handleViewScenario = (scenario) => {
    navigate("/office/scenario/releasehistory/detail", {
      state: {
        projectInfo: {
          scenarioId: scenario.scenarioId,
          projectName: scenario.projectName,
          productionPlanName: scenario.productionPlanName,
          shipmentDate: scenario.shipmentDate,
          equipmentName: "-",
          statusLabel: "미발행",
          status: "planned",
        },
      },
    });
  };

  const handleReleaseScenario = (scenario) => {
    setScenarioHistoryList((prev) =>
      prev.filter((item) => item.id !== scenario.id),
    );

    navigate("/office/scenario/releasehistory", {
      state: {
        releasedScenario: {
          id: `released-${scenario.id}`,
          projectName: scenario.projectName,
          projectDeadline: scenario.projectDeadline,
          status: "before-progress",
          statusLabel: "Before Progress",
          statusDescription: "진행 예정",
          rows: [
            {
              id: scenario.id,
              productionPlanName: scenario.productionPlanName,
              shipmentDate: scenario.shipmentDate,
              releaseDate: new Date().toISOString().slice(0, 10),
              materialCount: scenario.scrapCount,
            },
          ],
        },
      },
    });
  };

  const visibleStart = filteredList.length > 0 ? 1 : 0;
  const visibleEnd = filteredList.length;

  return (
    <Web_AppLayout pageTitle="시나리오 생성 이력">
      <div className="px-8 pb-12 pt-8">
        <div className="mb-8 flex items-end justify-end">
          <button
            type="button"
            onClick={handleCreateScenario}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dim active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">
              add_circle
            </span>
            <span className="text-white">시나리오 추가 생성</span>
          </button>
        </div>

        <section className="mb-8 rounded-xl bg-surface-container-lowest p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-primary" />
            <h3 className="font-headline text-lg font-bold text-on-surface">
              Search Filter
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
            <FilterInput
              label="프로젝트 명"
              name="projectName"
              value={filters.projectName}
              onChange={handleChangeFilter}
              placeholder="프로젝트명 입력"
            />

            <FilterInput
              label="생산계획명"
              name="productionPlanName"
              value={filters.productionPlanName}
              onChange={handleChangeFilter}
              placeholder="생산계획명 입력"
            />

            <DateRangeInput
              label="프로젝트 최종 납기일"
              fromName="projectDeadlineFrom"
              toName="projectDeadlineTo"
              fromValue={filters.projectDeadlineFrom}
              toValue={filters.projectDeadlineTo}
              onChange={handleChangeFilter}
            />

            <DateRangeInput
              label="생산계획 출하일"
              fromName="shipmentDateFrom"
              toName="shipmentDateTo"
              fromValue={filters.shipmentDateFrom}
              toValue={filters.shipmentDateTo}
              onChange={handleChangeFilter}
            />

            <DateRangeInput
              label="시나리오 생성일"
              fromName="createdAtFrom"
              toName="createdAtTo"
              fromValue={filters.createdAtFrom}
              toValue={filters.createdAtTo}
              onChange={handleChangeFilter}
            />
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              초기화
            </button>

            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-dim px-8 py-3 font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              조회
            </button>
          </div>
        </section>

        <div className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-xl shadow-blue-900/5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="border-b border-outline-variant/10 px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Scenario ID
                  </th>
                  <th className="border-b border-outline-variant/10 px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    생산계획명
                  </th>
                  <th className="border-b border-outline-variant/10 px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    생산계획 출하일
                  </th>
                  <th className="border-b border-outline-variant/10 px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    잔재 수
                  </th>
                  <th className="border-b border-outline-variant/10 px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    이동 횟수
                  </th>
                  <th className="border-b border-outline-variant/10 px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    총 소요 시간(min)
                  </th>
                  <th className="border-b border-outline-variant/10 px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/5">
                {filteredList.length > 0 ? (
                  filteredList.map((scenario) => (
                    <tr
                      key={scenario.id}
                      className="group transition-colors hover:bg-surface-container-low/30"
                    >
                      <td className="px-6 py-5">
                        <span className="font-headline font-bold text-primary">
                          {scenario.scenarioId}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-on-surface">
                            {scenario.productionPlanName}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-on-surface-variant">
                        {scenario.shipmentDate}
                      </td>

                      <td className="px-6 py-5 text-center">
                        {scenario.scrapCount}
                      </td>

                      <td className="px-6 py-5 text-center text-sm font-medium">
                        {scenario.moveCount.toLocaleString()}
                      </td>

                      <td className="px-6 py-5 text-center text-sm font-medium">
                        {scenario.totalMinutes}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewScenario(scenario)}
                            className="rounded-lg border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/5"
                          >
                            보기
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReleaseScenario(scenario)}
                            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-primary/10 transition-all hover:bg-primary-dim"
                          >
                            발행
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-sm font-medium text-on-surface-variant"
                    >
                      조회 조건에 맞는 시나리오 생성 이력이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between bg-surface-container-low/20 px-6 py-4">
            <p className="text-xs font-medium text-on-surface-variant">
              Showing{" "}
              <span className="font-bold text-on-surface">
                {visibleStart} - {visibleEnd}
              </span>{" "}
              of {filteredList.length} entries
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="rounded-lg p-2 text-on-surface-variant transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-sm">
                  chevron_left
                </span>
              </button>

              <button
                type="button"
                className="h-8 w-8 rounded-lg bg-primary text-xs font-bold text-white"
              >
                1
              </button>

              <button
                type="button"
                disabled
                className="rounded-lg p-2 text-on-surface-variant transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-sm">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Web_AppLayout>
  );
}
