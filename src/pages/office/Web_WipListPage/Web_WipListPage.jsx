import { useState, useCallback, useEffect } from "react";
import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_InventoryFilterSection from "../../../components/office/Web_InventoryFilterSection/Web_InventoryFilterSection";
import Web_InventoryTableSection from "../../../components/office/Web_InventoryTableSection/Web_InventoryTableSection";
import { wipService } from "../../../services/wipService";

const initialFilters = {
  qrNumber: "",
  manufacturer: "전체",
  material: "전체",
  thickness: "전체",
  widthMin: "",
  widthMax: "",
  lengthMin: "",
  lengthMax: "",
};

// 백엔드 응답(SteelWipWithQrResponse) → 테이블 행 형태로 변환
function mapWipToRow(wip) {
  return {
    id: wip.id,
    qrNumber: wip.qr_code_value || "-",
    manufacturer: wip.manufacturer || "-",
    material: wip.material || "-",
    thickness: wip.thickness ?? 0,
    width: wip.width ?? 0,
    length: wip.length ?? 0,
    weight: wip.weight ?? 0,
    location: wip.location_name || "-",
    layer: wip.stack_level ?? "-",
  };
}

// 두께 필터 범위 문자열("6-10", "11-20", "21+", ...)을 [min, max] 로 파싱
function parseThicknessRange(value) {
  if (!value || value === "전체") return [null, null];
  if (value === "21+") return [21, 30];
  if (value === "31+") return [31, 40];
  if (value === "41+") return [41, null];
  const [min, max] = value.split("-").map(Number);
  return [min, max || null];
}

export default function Web_WipListPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);   // 진입 즉시 로딩 표시
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchInventory = useCallback(async (activeFilters) => {
    setLoading(true);
    setError(null);

    const params = {};
    if (activeFilters.qrNumber) params.qr = activeFilters.qrNumber;
    if (activeFilters.manufacturer !== "전체") params.manufacturer = activeFilters.manufacturer;
    if (activeFilters.material !== "전체") params.material = activeFilters.material;
    if (activeFilters.widthMin) params.minWidth = Number(activeFilters.widthMin);
    if (activeFilters.widthMax) params.maxWidth = Number(activeFilters.widthMax);
    if (activeFilters.lengthMin) params.minLength = Number(activeFilters.lengthMin);
    if (activeFilters.lengthMax) params.maxLength = Number(activeFilters.lengthMax);

    try {
      const response = await wipService.getAll(params);
      let data = response.data?.data ?? [];

      // 두께 범위 필터는 클라이언트 측에서 처리 (백엔드는 정확한 값만 지원)
      const [thickMin, thickMax] = parseThicknessRange(activeFilters.thickness);
      if (thickMin !== null) {
        data = data.filter((w) => w.thickness >= thickMin && (thickMax === null || w.thickness <= thickMax));
      }

      const mapped = data.map(mapWipToRow);
      setRows(mapped);
      setTotalCount(mapped.length);
      setCurrentPage(1);
    } catch (err) {
      console.error("재고 조회 실패:", err);
      setError("재고 목록을 불러오는 데 실패했습니다.");
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, []);

  // 페이지 진입 시 전체 재고 자동 조회
  useEffect(() => {
    fetchInventory(initialFilters);
  }, [fetchInventory]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
    fetchInventory(initialFilters);
  };

  const handleSearch = () => {
    fetchInventory(filters);
  };

  return (
    <Web_AppLayout pageTitle="재고현황">
      <div className="space-y-8">
        <Web_InventoryFilterSection
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          onSearch={handleSearch}
        />

        {loading && (
          <div className="py-12 text-center text-sm text-on-surface-variant">
            데이터를 불러오는 중...
          </div>
        )}

        {error && !loading && (
          <div className="py-6 text-center text-sm text-red-500">{error}</div>
        )}

        {!loading && hasFetched && (
          <Web_InventoryTableSection
            rows={rows}
            totalCount={totalCount}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}

        {!loading && !hasFetched && (
          <div className="py-16 text-center text-sm text-on-surface-variant">
            필터 조건을 설정하고 조회 버튼을 눌러주세요.
          </div>
        )}
      </div>
    </Web_AppLayout>
  );
}
