import { useState, useCallback, useEffect, useMemo } from "react";
import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_InventoryFilterSection from "../../../components/office/Web_InventoryFilterSection/Web_InventoryFilterSection";
import Web_InventoryTableSection from "../../../components/office/Web_InventoryTableSection/Web_InventoryTableSection";
import { wipService } from "../../../services/wipService";

const ITEMS_PER_PAGE = 10;

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
		status: wip.status ?? "-",
	};
}

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
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [hasFetched, setHasFetched] = useState(false);

	const fetchInventory = useCallback(async (activeFilters) => {
		setLoading(true);
		setError(null);

		const params = {};

		if (activeFilters.qrNumber) params.qr = activeFilters.qrNumber;
		if (activeFilters.manufacturer !== "전체") {
			params.manufacturer = activeFilters.manufacturer;
		}
		if (activeFilters.material !== "전체") {
			params.material = activeFilters.material;
		}
		if (activeFilters.widthMin) {
			params.minWidth = Number(activeFilters.widthMin);
		}
		if (activeFilters.widthMax) {
			params.maxWidth = Number(activeFilters.widthMax);
		}
		if (activeFilters.lengthMin) {
			params.minLength = Number(activeFilters.lengthMin);
		}
		if (activeFilters.lengthMax) {
			params.maxLength = Number(activeFilters.lengthMax);
		}

		try {
			const response = await wipService.getAll(params);
			let data = response.data?.data ?? [];

			const [thickMin, thickMax] = parseThicknessRange(activeFilters.thickness);
			if (thickMin !== null) {
				data = data.filter(
					(w) =>
						w.thickness >= thickMin &&
						(thickMax === null || w.thickness <= thickMax),
				);
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
			setCurrentPage(1);
		} finally {
			setLoading(false);
			setHasFetched(true);
		}
	}, []);

	useEffect(() => {
		fetchInventory(initialFilters);
	}, [fetchInventory]);

	const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

	const paginatedRows = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		return rows.slice(startIndex, endIndex);
	}, [rows, currentPage]);

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

	const handlePageChange = (page) => {
		if (page < 1 || page > totalPages) return;
		setCurrentPage(page);
	};

	return (
		<Web_AppLayout pageTitle="재고현황">
			<Web_InventoryFilterSection
				filters={filters}
				onFilterChange={handleFilterChange}
				onReset={handleReset}
				onSearch={handleSearch}
			/>

			{loading && (
				<div className="rounded-xl bg-white px-6 py-10 text-center text-gray-500">
					데이터를 불러오는 중...
				</div>
			)}

			{error && !loading && (
				<div className="rounded-xl bg-red-50 px-6 py-10 text-center text-red-600">
					{error}
				</div>
			)}

			{!loading && hasFetched && (
				<Web_InventoryTableSection
					rows={paginatedRows}
					totalCount={totalCount}
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={handlePageChange}
				/>
			)}

			{!loading && !hasFetched && (
				<div className="rounded-xl bg-white px-6 py-10 text-center text-gray-500">
					필터 조건을 설정하고 조회 버튼을 눌러주세요.
				</div>
			)}
		</Web_AppLayout>
	);
}
