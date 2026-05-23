import { useEffect, useMemo, useState } from "react";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_ScenarioTimelineSection from "../../../components/office/Web_ScenarioTimelineSection/Web_ScenarioTimelineSection.jsx";
import { getLiveField } from "../../../services/fieldService";
import { getActionMetadata } from "../../../utils/batchActionMetadata";

// 백엔드 LazerType enum 값과 탭 ID를 일치
const EQUIPMENT_TABS = [
	{ id: "LAZER1", label: "레이저 설비 1" },
	{ id: "LAZER2", label: "레이저 설비 2" },
	{ id: "LAZER3", label: "레이저 설비 3" },
	{ id: "all", label: "전체 보기" },
];

const LAZER_IDS = ["LAZER1", "LAZER2", "LAZER3"];

const INITIAL_FILTERS = {
	actionType: "",
	minMinutes: "",
	maxMinutes: "",
};

// ✅ 표준화: batchActionMetadata 기반 색상 맵
const ACTION_COLOR_MAP = {
	RELOCATE: "bg-gray-400 ring-surface",
	PICKING: "bg-red-500 ring-surface",
	INBOUND: "bg-cyan-500 ring-surface",
	TEMP_MOVE: "bg-orange-500 ring-surface",
	RESTORE: "bg-cyan-500 ring-surface",
	DIRECT_START: "bg-purple-500 ring-surface",
};

// ─── 매핑 헬퍼 (batchActionMetadata 활용) ────────────────────────────
function mapActionLabel(action) {
	const metadata = getActionMetadata(action);
	return metadata.label_ko;
}

function mapActionIcon(action) {
	const metadata = getActionMetadata(action);
	return metadata.material_icon;
}

function mapActionColor(action) {
	return ACTION_COLOR_MAP[action] || "bg-surface-container ring-surface";
}

function mapStatusLabel(status) {
	switch (status) {
		case "BEFORE_PENDING":
			return "대기";
		case "PENDING":
			return "대기";
		case "IN_PROGRESS":
			return "이동중";
		case "COMPLETED":
			return "완료";
		default:
			return status ?? "-";
	}
}

function mapStatusClass(status) {
	switch (status) {
		case "BEFORE_PENDING":
			return "bg-surface-container-highest text-on-surface-variant";
		case "IN_PROGRESS":
			return "bg-secondary-container text-on-secondary-container";
		case "COMPLETED":
			return "bg-emerald-100 text-emerald-700";
		default:
			return "bg-surface-container-highest text-on-surface-variant";
	}
}

function summarizeEquipment(items, equipmentId) {
	if (!items.length) {
		return {
			equipmentId,
			scenarioTitle: "진행 중인 시나리오 없음",
			batchLabel: "-",
			remainingTasks: 0,
			actionSummary: "-",
		};
	}

	const first = items[0];
	const actionSet = [
		...new Set(items.map((item) => mapActionLabel(item.batchItemAction))),
	];

	return {
		equipmentId,
		scenarioTitle:
			first.scenarioTitle || `시나리오 #${first.scenarioId ?? "-"}`,
		batchLabel:
			Number.isFinite(first.batchOrder) || first.batchOrder
				? `Batch ${String(first.batchOrder).padStart(2, "0")}`
				: "-",
		remainingTasks: items.length,
		actionSummary: actionSet.join(", "),
	};
}

function isDirectStartLiveItem(item) {
	return (
		String(item?.batchItemAction ?? "").toUpperCase() === "RELOCATE" &&
		!item?.fromLocationName &&
		String(item?.toLocationName ?? "").startsWith("S4-")
	);
}

// FieldBatchItem → timeline 아이템 형태로 변환
function mapBatchItemToTimeline(item, equipmentId) {
	const rawAction = String(item?.batchItemAction ?? "").toUpperCase();
	const displayAction = isDirectStartLiveItem(item) ? "DIRECT_START" : rawAction;
	const showsNcCode =
		displayAction === "PICKING" || displayAction === "DIRECT_START";

	// ✅ INBOUND의 경우 placeholder row 생성
	let rows = (item.wip ?? []).map((w) => ({
		batchItemId: item.batchItemId,
		scenarioId: item.scenarioId,
		qrNumber: w.qrId || "원자재",
		thickness: w.thickness,
		width: w.width,
		length: w.length,
		from: item.fromLocationName || "-",
		to: item.toLocationName || "-",

		// 피킹/원자재 투입인 경우만 ncCode 컬럼 표시, null이면 "-"
		...(showsNcCode && {
			ncCode: w.ncCode ?? null, // ← 더미 생성 없이 실제 값만
		}),

		estimatedTime: item.expectedRunningTime,
		status: mapStatusLabel(item.status),
		statusClass: mapStatusClass(item.status),
	}));

	// INBOUND인데 wip이 없으면 placeholder 행 생성
	if (rawAction === "INBOUND" && rows.length === 0) {
		rows = [{
			batchItemId: item.batchItemId,
			scenarioId: item.scenarioId,
			qrNumber: "원자재",  // 새로 생성되는 산출물
			thickness: "-",
			width: "-",
			length: "-",
			from: "-",  // INBOUND는 from 없음
			to: item.toLocationName || "-",  // 목표 위치 표시
			estimatedTime: item.expectedStartTime,  // 예상 시작 시간
			status: mapStatusLabel(item.status),
			statusClass: mapStatusClass(item.status),
		}];
	}

	return {
		id: item.batchItemId,
		equipmentId,
		type: mapActionLabel(displayAction),
		_actionRaw: displayAction,
		icon: mapActionIcon(displayAction),
		colorClass: mapActionColor(displayAction),
		iconColorClass: "",
		subLabel: item.batchOrder
			? `${item.scenarioTitle || "-"} · Batch ${String(
					item.batchOrder,
				).padStart(2, "0")}`
			: item.scenarioTitle || "",
		rows,
	};
}

// ─── 컴포넌트 ─────────────────────────────────────────────
export default function Web_FieldLiveStatusPage() {
	const [filters, setFilters] = useState(INITIAL_FILTERS);
	const [searchFilters, setSearchFilters] = useState(INITIAL_FILTERS);
	const [selectedEquipment, setSelectedEquipment] = useState("LAZER1");
	const [timelineItems, setTimelineItems] = useState([]);
	const [equipmentSummaries, setEquipmentSummaries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// 탭 또는 장비 선택이 바뀔 때 API 호출
	const fetchLiveData = async (equipmentId) => {
		setLoading(true);
		setError(null);

		try {
			if (equipmentId === "all") {
				// 전체 보기: 3개 레이저 동시 조회 후 합산
				const results = await Promise.all(
					LAZER_IDS.map((id) => getLiveField(id)),
				);

				const summaries = LAZER_IDS.map((id, idx) =>
					summarizeEquipment(results[idx].data?.data ?? [], id),
				);

				const allItems = LAZER_IDS.flatMap((id, idx) =>
					(results[idx].data?.data ?? []).map((item) =>
						mapBatchItemToTimeline(item, id),
					),
				);

				setEquipmentSummaries(summaries);
				setTimelineItems(allItems);
			} else {
				const response = await getLiveField(equipmentId);
				const itemsRaw = response.data?.data ?? [];
				const items = itemsRaw.map((item) =>
					mapBatchItemToTimeline(item, equipmentId),
				);

				setEquipmentSummaries([summarizeEquipment(itemsRaw, equipmentId)]);
				setTimelineItems(items);
			}
		} catch (err) {
			console.error("현장 현황 조회 실패:", err);
			setError("현장 데이터를 불러오는 데 실패했습니다.");
			setEquipmentSummaries([]);
			setTimelineItems([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLiveData(selectedEquipment);
	}, [selectedEquipment]);

	const handleChangeFilter = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const handleReset = () => {
		setFilters(INITIAL_FILTERS);
		setSearchFilters(INITIAL_FILTERS);
		fetchLiveData(selectedEquipment);
	};

	// 조회: 클라이언트사이드 필터 적용
	const handleSearch = () => {
		setSearchFilters(filters);
	};

	// 필터 적용된 타임라인 아이템
	const filteredTimelineItems = useMemo(() => {
		return timelineItems
			.filter((item) => {
				const isActionMatched =
					!searchFilters.actionType ||
					item._actionRaw === searchFilters.actionType;

				const filteredRows = item.rows.filter((row) => {
					const t = Number(row.estimatedTime);
					const minVal =
						searchFilters.minMinutes === ""
							? null
							: Number(searchFilters.minMinutes);
					const maxVal =
						searchFilters.maxMinutes === ""
							? null
							: Number(searchFilters.maxMinutes);

					return (
						(minVal === null || t >= minVal) && (maxVal === null || t <= maxVal)
					);
				});

				// ✅ 수정: INBOUND는 wip이 없어도(rows=0) 표시되어야 함
				// INBOUND는 새로운 산출물을 만드는 작업이므로 rows가 비어있는 것이 정상
				return isActionMatched && (filteredRows.length > 0 || item._actionRaw === "INBOUND");
			})
			.map((item) => {
				const minVal =
					searchFilters.minMinutes === ""
						? null
						: Number(searchFilters.minMinutes);
				const maxVal =
					searchFilters.maxMinutes === ""
						? null
						: Number(searchFilters.maxMinutes);

				// ✅ INBOUND는 rows가 비어있어도 유지 (rows 필터링하지 않음)
				if (item._actionRaw === "INBOUND") {
					return item;
				}

				const filteredRows = item.rows.filter((row) => {
					const t = Number(row.estimatedTime);
					return (
						(minVal === null || t >= minVal) && (maxVal === null || t <= maxVal)
					);
				});

				return { ...item, rows: filteredRows };
			});
	}, [timelineItems, searchFilters]);

	return (
		<Web_AppLayout pageTitle="실시간 현장 조회">
			<div className="px-8 pt-8 pb-12">
				{/* ── 필터 섹션 ── */}
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
								이동 행위
							</label>
							<select
								value={filters.actionType}
								onChange={(e) =>
									handleChangeFilter("actionType", e.target.value)
								}
								className="w-full h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-sm"
							>
								<option value="">전체</option>
								<option value="RELOCATE">재배치</option>
								<option value="PICKING">피킹</option>
								<option value="INBOUND">적재</option>
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
									onChange={(e) =>
										handleChangeFilter("minMinutes", e.target.value)
									}
									placeholder="최소 시간"
									className="w-1/2 h-12 px-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white text-sm"
								/>
								<span className="text-on-surface-variant">~</span>
								<input
									type="number"
									min="0"
									value={filters.maxMinutes}
									onChange={(e) =>
										handleChangeFilter("maxMinutes", e.target.value)
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

				{/* ── 장비 탭 ── */}
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
										: "px-6 py-2.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium text-sm hover:bg-surface-container-highest"
								}
							>
								{tab.label}
							</button>
						);
					})}
				</div>

				{/* ── 로딩 / 에러 / 타임라인 ── */}
				{loading && (
					<div className="py-16 text-center text-sm text-on-surface-variant">
						데이터를 불러오는 중...
					</div>
				)}

				{error && !loading && (
					<div className="py-8 text-center text-sm text-red-500">{error}</div>
				)}

				{!loading && !error && (
					<>
						<section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
							{equipmentSummaries.map((summary) => (
								<div
									key={summary.equipmentId}
									className="rounded-xl border border-outline-variant/10 bg-white p-5 shadow-sm"
								>
									<div className="mb-3 flex items-center justify-between">
										<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
											{summary.equipmentId}
										</span>
										<span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
											{summary.batchLabel}
										</span>
									</div>
									<h3 className="text-base font-bold text-on-surface">
										{summary.scenarioTitle}
									</h3>
									<p className="mt-2 text-sm text-on-surface-variant">
										현재 작업: {summary.actionSummary}
									</p>
									<p className="mt-3 text-sm font-semibold text-on-surface">
										남은 작업 {summary.remainingTasks}개
									</p>
								</div>
							))}
						</section>

						{filteredTimelineItems.length > 0 ? (
							<Web_ScenarioTimelineSection items={filteredTimelineItems} />
						) : (
							<div className="bg-surface-container-lowest rounded-xl p-10 text-center text-sm text-on-surface-variant shadow-sm">
								{timelineItems.length === 0
									? "현재 진행 중인 현장 작업이 없습니다."
									: "조회 조건에 해당하는 현장 작업이 없습니다."}
							</div>
						)}
					</>
				)}
			</div>
		</Web_AppLayout>
	);
}
