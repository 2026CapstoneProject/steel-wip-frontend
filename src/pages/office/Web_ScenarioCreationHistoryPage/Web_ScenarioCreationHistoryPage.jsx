import { useEffect, useMemo, useState } from "react"; // useMemo: paginatedList 에서 사용
import { useLocation, useNavigate } from "react-router-dom";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import { clearScenarioLantekCache } from "../../../utils/Web/lantekCache";
import { getScenarioCart, sendScenario } from "../../../services/scenarioService";

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

function sortByIdDesc(list) {
  return [...list].sort((a, b) => b.id - a.id);
}

// 백엔드 ProjectScenarioHistory[] → 프론트 flat list 형태로 변환
function mapCartToFlatList(projectList) {
  return (projectList ?? []).flatMap((project) =>
    (project.scenario ?? []).map((s) => ({
      id: s.id,
      scenarioId: `#${String(s.id).padStart(6, "0")}`,
      projectName: project.projectTitle,
      productionPlanName: s.title,
      projectDeadline: s.due ?? "",
      shipmentDate: s.due ?? "",
      scrapCount: s.selectedWips ?? 0,
      // 백엔드 Pydantic alias: "#relocation", "#crane" (JSON 직렬화 시 alias 사용)
      moveCount: (s["#relocation"] ?? 0) + (s["#crane"] ?? 0),
      totalMinutes: s.totalMinute ?? 0,
      isReleased: false,
    }))
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

export default function Web_ScenarioCreationHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const incomingState = location.state ?? {};
  const initialProductionPlanName = incomingState.productionPlanName ?? "";

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    productionPlanName: initialProductionPlanName,
  }));

  const [scenarioHistoryList, setScenarioHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // params 를 받아서 API 호출 — 마운트 시(params 없음)와 조회 버튼(params 있음) 공용
  const fetchScenarioCart = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getScenarioCart(params);
      const data = response.data?.data ?? [];
      const flatList = sortByIdDesc(mapCartToFlatList(data));
      setScenarioHistoryList(flatList);
    } catch (err) {
      console.error("시나리오 생성 이력 조회 실패:", err);
      setError("데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 전체 조회
  useEffect(() => {
    fetchScenarioCart();
  }, []);

  // 페이지네이션용 — 서버에서 이미 필터된 목록을 그대로 사용
  const filteredList = scenarioHistoryList;

  const handleChangeFilter = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // 서버사이드 필터링: 입력된 값만 params 로 전달
    const params = {};
    if (filters.projectName) params.projectName = filters.projectName;
    if (filters.productionPlanName) params.scenarioName = filters.productionPlanName;
    if (filters.shipmentDateFrom) params.scenDueMin = filters.shipmentDateFrom;
    if (filters.shipmentDateTo) params.scenDueMax = filters.shipmentDateTo;
    setCurrentPage(1);
    fetchScenarioCart(params);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    fetchScenarioCart(); // 파라미터 없이 전체 조회
  };

  const handleCreateScenario = () => {
    clearScenarioLantekCache();
    navigate("/office/scenario/input");
  };

  const handleViewScenario = (scenario) => {
    navigate("/office/scenario/creationhistory/detail", {
      state: {
        scenarioId: scenario.id,
        projectInfo: {
          scenarioId: scenario.scenarioId || "-",
          projectName: scenario.projectName || "-",
          productionPlanName: scenario.productionPlanName || "-",
          shipmentDate: scenario.shipmentDate || "-",
          equipmentName: "-",
          statusLabel: "미발행",
        },
      },
    });
  };

  const handleReleaseScenario = async (scenario) => {
    try {
      await sendScenario(scenario.id);
      // 발행 성공 후 목록에서 제거 + 발행 이력 페이지로 이동
      setScenarioHistoryList((prev) => prev.filter((item) => item.id !== scenario.id));
      navigate("/office/scenario/releasehistory");
    } catch (err) {
      console.error("시나리오 발행 실패:", err);
      alert("시나리오 발행에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const visibleStart = filteredList.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredList.length);
  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));

  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return scenarioHistoryList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [scenarioHistoryList, currentPage]);

  return (
    <Web_AppLayout pageTitle="시나리오 생성 이력">
      <div className="px-8 pb-12 pt-8">
        <div className="mb-8 flex items-end justify-end">
          <button
            type="button"
            onClick={handleCreateScenario}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dim active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span className="text-white">시나리오 추가 생성</span>
          </button>
        </div>

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
              label="생산계획명"
              name="productionPlanName"
              value={filters.productionPlanName}
              onChange={handleChangeFilter}
              placeholder="생산계획명 입력"
            />
            <DateRangeInput
              label="생산계획 납기일"
              fromName="shipmentDateFrom"
              toName="shipmentDateTo"
              fromValue={filters.shipmentDateFrom}
              toValue={filters.shipmentDateTo}
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

        {loading && (
          <div className="py-16 text-center text-sm text-on-surface-variant">데이터를 불러오는 중...</div>
        )}

        {error && !loading && (
          <div className="py-8 text-center text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-xl shadow-blue-900/5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="border-b border-outline-variant/10 px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Scenario ID</th>
                    <th className="border-b border-outline-variant/10 px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">프로젝트명</th>
                    <th className="border-b border-outline-variant/10 px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">생산계획명</th>
                    <th className="border-b border-outline-variant/10 px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">납기일</th>
                    <th className="border-b border-outline-variant/10 px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant">잔재 수</th>
                    <th className="border-b border-outline-variant/10 px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant">이동 횟수</th>
                    <th className="border-b border-outline-variant/10 px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant">총 소요 시간(min)</th>
                    <th className="border-b border-outline-variant/10 px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {paginatedList.length > 0 ? (
                    paginatedList.map((scenario) => (
                      <tr key={scenario.id} className="group transition-colors hover:bg-surface-container-low/30">
                        <td className="px-6 py-5">
                          <span className="font-headline font-bold text-primary">{scenario.scenarioId}</span>
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-on-surface">{scenario.projectName}</td>
                        <td className="px-6 py-5 text-sm font-semibold text-on-surface">{scenario.productionPlanName}</td>
                        <td className="px-6 py-5 text-sm text-on-surface-variant">{scenario.shipmentDate}</td>
                        <td className="px-6 py-5 text-center">{scenario.scrapCount}</td>
                        <td className="px-6 py-5 text-center text-sm font-medium">{scenario.moveCount.toLocaleString()}</td>
                        <td className="px-6 py-5 text-center text-sm font-medium">{scenario.totalMinutes}</td>
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
                      <td colSpan={8} className="px-6 py-16 text-center text-sm font-medium text-on-surface-variant">
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
                <span className="font-bold text-on-surface">{visibleStart} - {visibleEnd}</span>{" "}
                of {filteredList.length} entries
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors ${
                        pageNumber === currentPage
                          ? "bg-primary text-white"
                          : "text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Web_AppLayout>
  );
}
