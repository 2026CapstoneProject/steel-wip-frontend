import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import {
  getScenarioReleaseHistoryFilters,
  setScenarioReleaseHistoryFilters,
  clearScenarioReleaseHistoryFilters,
} from "../../../utils/Web/scenarioReleaseHistoryCache";

const DEFAULT_PROJECTS = [
  {
    id: "project-1",
    projectName: "토네이도 프로젝트",
    projectDeadline: "2026-03-20",
    status: "urgent",
    statusLabel: "Urgent",
    statusDescription: "긴급 현황",
    rows: [
      {
        id: "1-1",
        productionPlanName: "토네이도건설-1",
        shipmentDate: "2026-03-20",
        releaseDate: "2026-03-01",
        materialCount: 42,
      },
      {
        id: "1-2",
        productionPlanName: "토네이도건설-2",
        shipmentDate: "2026-04-01",
        releaseDate: "2026-03-10",
        materialCount: 60,
      },
      {
        id: "1-3",
        productionPlanName: "토네이도건설-3",
        shipmentDate: "2026-04-10",
        releaseDate: "2026-03-15",
        materialCount: 72,
      },
    ],
  },
  {
    id: "project-2",
    projectName: "평택 물류 클러스터 증축",
    projectDeadline: "2026-03-31",
    status: "completed",
    statusLabel: "Completed",
    statusDescription: "완료됨",
    rows: [
      {
        id: "2-1",
        productionPlanName: "평택물류-1",
        shipmentDate: "2026-02-20",
        releaseDate: "2026-02-01",
        materialCount: 38,
      },
    ],
  },
  {
    id: "project-3",
    projectName: "세종 스마트시티 인프라 2단계",
    projectDeadline: "2026-04-10",
    status: "in-progress",
    statusLabel: "In Progress",
    statusDescription: "진행 중",
    rows: [
      {
        id: "3-1",
        productionPlanName: "세종스마트-1",
        shipmentDate: "2026-05-10",
        releaseDate: "2026-04-21",
        materialCount: 55,
      },
    ],
  },
  {
    id: "project-4",
    projectName: "인천 송도 글로벌 오피스 D동",
    projectDeadline: "2026-04-18",
    status: "before-progress",
    statusLabel: "Before Progress",
    statusDescription: "진행 예정",
    rows: [
      {
        id: "4-1",
        productionPlanName: "송도오피스D-1",
        shipmentDate: "2026-06-01",
        releaseDate: "2026-05-20",
        materialCount: 24,
      },
    ],
  },
];

const DEFAULT_FILTERS = {
  projectName: "",
  productionPlanName: "",
  projectDeadlineFrom: "",
  projectDeadlineTo: "",
  shipmentDateFrom: "",
  shipmentDateTo: "",
  releaseDateFrom: "",
  releaseDateTo: "",
};

function normalizeDate(dateValue) {
  if (!dateValue) return "";
  return String(dateValue).replaceAll(".", "-");
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

function getStatusBadgeClass(status) {
  switch (status) {
    case "urgent":
      return "bg-red-100 text-red-700";
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "in-progress":
      return "bg-primary-container text-on-primary-container";
    case "before-progress":
    default:
      return "bg-surface-container-highest text-on-surface-variant";
  }
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

function ScenarioReleaseProjectAccordion({ project, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
      <button
        type="button"
        onClick={() => onToggle(project.id)}
        className={`flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-surface-container-low ${
          isOpen ? "border-b border-surface-container" : ""
        }`}
      >
        <div className="flex items-center gap-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <span className="material-symbols-outlined">apartment</span>
          </div>

          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface">
              {project.projectName}
            </h3>
            <div className="mt-1 flex items-center gap-4">
              <span className="text-xs font-medium text-on-surface-variant">
                프로젝트 마감일: {project.projectDeadline}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-tighter ${getStatusBadgeClass(
                project.status,
              )}`}
            >
              {project.statusLabel}
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">
              {project.statusDescription}
            </span>
          </div>

          <span
            className={`material-symbols-outlined text-outline transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="bg-surface p-6">
          <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-high/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    순번
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    생산계획명
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    생산계획 출하일
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    생산계획 현장 전송일
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    생산 계획 자재 수(EA)
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    상세
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-surface-container">
                {project.rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-surface-container-low/30"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                      {row.productionPlanName}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {row.shipmentDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {row.releaseDate}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">
                      {row.materialCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-xl border border-primary/20 bg-surface-container-lowest px-4 py-2 text-sm font-bold text-primary transition-all duration-300 hover:bg-surface-container-low hover:shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          visibility
                        </span>
                        보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Web_ScenarioReleaseHistoryPage() {
  const location = useLocation();
  const releasedScenario = location.state?.releasedScenario ?? null;

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...getScenarioReleaseHistoryFilters(),
  }));

  const [appliedFilters, setAppliedFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...getScenarioReleaseHistoryFilters(),
  }));

  const [openProjectMap, setOpenProjectMap] = useState(() => {
    if (releasedScenario?.id) {
      return { [releasedScenario.id]: true };
    }

    return { "project-1": true };
  });

  const releaseHistoryProjects = useMemo(() => {
    if (!releasedScenario) {
      return DEFAULT_PROJECTS;
    }

    return [releasedScenario, ...DEFAULT_PROJECTS];
  }, [releasedScenario]);

  const filteredProjects = useMemo(() => {
    return releaseHistoryProjects
      .map((project) => {
        const projectNameMatched = project.projectName
          .toLowerCase()
          .includes(appliedFilters.projectName.trim().toLowerCase());

        const projectDeadlineMatched = isWithinDateRange(
          project.projectDeadline,
          appliedFilters.projectDeadlineFrom,
          appliedFilters.projectDeadlineTo,
        );

        const filteredRows = (project.rows ?? []).filter((row) => {
          const productionPlanMatched = row.productionPlanName
            .toLowerCase()
            .includes(appliedFilters.productionPlanName.trim().toLowerCase());

          const shipmentMatched = isWithinDateRange(
            row.shipmentDate,
            appliedFilters.shipmentDateFrom,
            appliedFilters.shipmentDateTo,
          );

          const releaseMatched = isWithinDateRange(
            row.releaseDate,
            appliedFilters.releaseDateFrom,
            appliedFilters.releaseDateTo,
          );

          return productionPlanMatched && shipmentMatched && releaseMatched;
        });

        if (
          !projectNameMatched ||
          !projectDeadlineMatched ||
          filteredRows.length === 0
        ) {
          return null;
        }

        return {
          ...project,
          rows: filteredRows,
        };
      })
      .filter(Boolean);
  }, [releaseHistoryProjects, appliedFilters]);

  const handleToggleProject = (projectId) => {
    setOpenProjectMap((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleChangeFilter = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setScenarioReleaseHistoryFilters(filters);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    clearScenarioReleaseHistoryFilters();
  };

  return (
    <Web_AppLayout pageTitle="현장 전송 이력">
      <div className="px-8 pb-12 pt-8">
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
              label="생산 계획 명"
              name="productionPlanName"
              value={filters.productionPlanName}
              onChange={handleChangeFilter}
              placeholder="생산계획명 입력"
            />

            <DateRangeInput
              label="프로젝트 마감일"
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
              label="현장 전송일"
              fromName="releaseDateFrom"
              toName="releaseDateTo"
              fromValue={filters.releaseDateFrom}
              toValue={filters.releaseDateTo}
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
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-dim px-8 py-3 font-bold text-white shadow-md transition-all active:scale-95 hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              조회
            </button>
          </div>
        </section>

        <div className="space-y-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ScenarioReleaseProjectAccordion
                key={project.id}
                project={project}
                isOpen={Boolean(openProjectMap[project.id])}
                onToggle={handleToggleProject}
              />
            ))
          ) : (
            <div className="rounded-xl bg-surface-container-lowest px-6 py-12 text-center shadow-sm">
              <p className="text-sm font-medium text-on-surface-variant">
                조회 조건에 맞는 현장 전송 이력이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </Web_AppLayout>
  );
}
