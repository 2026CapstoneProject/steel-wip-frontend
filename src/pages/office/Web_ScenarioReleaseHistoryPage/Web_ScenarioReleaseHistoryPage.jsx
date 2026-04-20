import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import { getScenarioSendHistory } from "../../../services/scenarioService";

const DEFAULT_FILTERS = {
  projectName: "",
  productionPlanName: "",
  projectDeadlineFrom: "",
  projectDeadlineTo: "",
  shipmentDateFrom: "",
  shipmentDateTo: "",
  sendDateFrom: "",
  sendDateTo: "",
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

function getStatusBadgeClass(status) {
  switch (status) {
    case "urgent": return "bg-red-100 text-red-700";
    case "completed": return "bg-emerald-100 text-emerald-700";
    case "in-progress": return "bg-primary-container text-on-primary-container";
    case "before-progress":
    default: return "bg-surface-container-highest text-on-surface-variant";
  }
}

// 백엔드 SentProjectHistory[] → 프론트 accordion 데이터로 변환
function mapSentToProjects(data) {
  return (data ?? []).map((project) => ({
    id: `project-${project.projectId}`,
    projectId: project.projectId,
    projectName: project.projectTitle,
    projectDeadline: project.projectDue ?? "",
    status: "before-progress",
    statusLabel: "Before Progress",
    statusDescription: "진행 예정",
    rows: (project.scenarios ?? []).map((s) => ({
      id: `scenario-${s.scenarioId}`,
      scenarioId: s.scenarioId,
      productionPlanName: s.scenarioTitle,
      shipmentDate: s.scenarioDue ?? "",
      releaseDate: s.orderedAt ? String(s.orderedAt).slice(0, 10) : "",
      materialCount: s.numInputWip ?? 0,
    })),
  }));
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

function DateRangeInput({ label, fromName, toName, fromValue, toValue, onChange }) {
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

function ScenarioReleaseProjectAccordion({ project, isOpen, onToggle, onViewScenario }) {
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
            <h3 className="font-headline text-lg font-bold text-on-surface">{project.projectName}</h3>
            <div className="mt-1 flex items-center gap-4">
              <span className="text-xs font-medium text-on-surface-variant">
                프로젝트 마감일: {project.projectDeadline}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-tighter ${getStatusBadgeClass(project.status)}`}>
              {project.statusLabel}
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">{project.statusDescription}</span>
          </div>
          <span className={`material-symbols-outlined text-outline transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
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
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">순번</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">생산계획명</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">시나리오 납기일</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">현장 전송일</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">투입 자재 수(EA)</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {(project.rows ?? []).map((row, index) => (
                  <tr key={row.id} className="transition-colors hover:bg-surface-container-low/30">
                    <td className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">{row.productionPlanName}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{row.shipmentDate}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{row.releaseDate}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">{row.materialCount}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onViewScenario(project, row)}
                        className="inline-flex items-center gap-1 rounded-xl border border-primary/20 bg-surface-container-lowest px-4 py-2 text-sm font-bold text-primary transition-all duration-300 hover:bg-surface-container-low hover:shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
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
  const navigate = useNavigate();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openProjectMap, setOpenProjectMap] = useState({});

  // params 를 받아서 API 호출 — 마운트 시(params 없음)와 조회 버튼(params 있음) 공용
  const fetchHistory = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getScenarioSendHistory(params);
      const data = response.data?.data ?? [];
      const mapped = mapSentToProjects(data);
      setProjects(mapped);
      // 첫 번째 프로젝트를 기본으로 열어둠
      if (mapped.length > 0) {
        setOpenProjectMap({ [mapped[0].id]: true });
      }
    } catch (err) {
      console.error("현장 전송 이력 조회 실패:", err);
      setError("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 서버에서 이미 필터된 목록 — 생산계획명(productionPlanName)만 클라이언트 후처리
  const filteredProjects = useMemo(() => {
    const planKeyword = appliedFilters.productionPlanName.trim().toLowerCase();
    if (!planKeyword) return projects;

    return projects
      .map((project) => {
        const filteredRows = (project.rows ?? []).filter((row) =>
          row.productionPlanName.toLowerCase().includes(planKeyword)
        );
        if (filteredRows.length === 0) return null;
        return { ...project, rows: filteredRows };
      })
      .filter(Boolean);
  }, [projects, appliedFilters.productionPlanName]);

  const handleToggleProject = (projectId) => {
    setOpenProjectMap((prev) => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const handleChangeFilter = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // 서버사이드 필터링: 백엔드가 지원하는 파라미터만 전달
    const params = {};
    if (filters.projectName) params.projectName = filters.projectName;
    if (filters.projectDeadlineFrom) params.projDueMin = filters.projectDeadlineFrom;
    if (filters.projectDeadlineTo) params.projDueMax = filters.projectDeadlineTo;
    if (filters.shipmentDateFrom) params.scenDueMin = filters.shipmentDateFrom;
    if (filters.shipmentDateTo) params.scenDueMax = filters.shipmentDateTo;
    if (filters.sendDateFrom) params.sendDateMin = filters.sendDateFrom;
    if (filters.sendDateTo) params.sendDateMax = filters.sendDateTo;

    // 생산계획명은 백엔드 미지원 → appliedFilters 로 클라이언트 후처리
    setAppliedFilters((prev) => ({ ...prev, productionPlanName: filters.productionPlanName }));
    fetchHistory(params);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    fetchHistory(); // 파라미터 없이 전체 조회
  };

  const handleViewScenario = (project, row) => {
    navigate("/office/scenario/releasehistory/detail", {
      state: {
        scenarioId: row.scenarioId,
        projectInfo: {
          scenarioId: row.id || "-",
          projectName: project.projectName || "-",
          productionPlanName: row.productionPlanName || "-",
          shipmentDate: row.shipmentDate || "-",
          equipmentName: "-",
          statusLabel: project.statusLabel || "-",
          status: project.status || "-",
        },
      },
    });
  };

  return (
    <Web_AppLayout pageTitle="현장 전송 이력">
      <div className="px-8 pb-12 pt-8">
        <section className="mb-8 rounded-xl bg-surface-container-lowest p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-primary" />
            <h3 className="font-headline text-lg font-bold text-on-surface">Search Filter</h3>
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
              label="시나리오 납기일"
              fromName="shipmentDateFrom"
              toName="shipmentDateTo"
              fromValue={filters.shipmentDateFrom}
              toValue={filters.shipmentDateTo}
              onChange={handleChangeFilter}
            />
            <DateRangeInput
              label="현장 전송일"
              fromName="sendDateFrom"
              toName="sendDateTo"
              fromValue={filters.sendDateFrom}
              toValue={filters.sendDateTo}
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

        {loading && (
          <div className="py-16 text-center text-sm text-on-surface-variant">데이터를 불러오는 중...</div>
        )}

        {error && !loading && (
          <div className="py-8 text-center text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ScenarioReleaseProjectAccordion
                  key={project.id}
                  project={project}
                  isOpen={Boolean(openProjectMap[project.id])}
                  onToggle={handleToggleProject}
                  onViewScenario={handleViewScenario}
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
        )}
      </div>
    </Web_AppLayout>
  );
}
