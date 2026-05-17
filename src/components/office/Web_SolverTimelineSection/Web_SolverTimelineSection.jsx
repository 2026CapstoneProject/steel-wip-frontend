import Web_ScenarioTaskTable from "../Web_ScenarioTaskTable/Web_ScenarioTaskTable";
import { BATCH_ACTION_METADATA, getActionMetadata } from "../../../utils/batchActionMetadata";

// ✅ 표준화: batchActionMetadata 기반으로 UI 컬러 매핑
const ACTION_COLOR_MAP = {
	RELOCATE: {
		colorClass: "bg-gray-400 ring-surface",
		iconColorClass: "text-gray-400",
		accentTextClass: "text-gray-400",
	},
	PICKING: {
		colorClass: "bg-red-500 ring-surface",
		iconColorClass: "text-red-500",
		accentTextClass: "text-red-500",
	},
	INBOUND: {
		colorClass: "bg-cyan-500 ring-surface",
		iconColorClass: "text-cyan-500",
		accentTextClass: "text-cyan-500",
	},
	TEMP_MOVE: {
		colorClass: "bg-orange-500 ring-surface",
		iconColorClass: "text-orange-500",
		accentTextClass: "text-orange-500",
	},
	RESTORE: {
		colorClass: "bg-cyan-500 ring-surface",
		iconColorClass: "text-cyan-500",
		accentTextClass: "text-cyan-500",
	},
	DIRECT_START: {
		colorClass: "bg-purple-500 ring-surface",
		iconColorClass: "text-purple-500",
		accentTextClass: "text-purple-500",
	},
};

// ✅ Tailwind 색상 → HEX 변환 (Material Icon 색상 적용)
const COLOR_MAP = {
	"bg-gray-400": "#9CA3AF",
	"bg-red-500": "#EF4444",
	"bg-purple-500": "#A855F7",
	"bg-cyan-500": "#06B6D4",
	"bg-orange-500": "#F97316",
};

function extractColorFromClass(colorClass) {
	// colorClass는 "bg-cyan-500 ring-surface" 형태
	const bgClass = colorClass.split(" ")[0];
	return COLOR_MAP[bgClass] || "#000000";
}

function mapLocationLabel(value) {
	const raw = String(value ?? "").trim();

	if (!raw) return "-";
	if (raw === "설비") return raw;

	const zoneMap = {
		1: "A-1",
		2: "A-2",
		3: "A-3",
		4: "A-4",
	};

	return zoneMap[raw] ?? raw;
}

function formatScenarioQr(itemDetail, steelWipId) {
	if (itemDetail?.qrCode) return itemDetail.qrCode;
	return "-";
}

// ✅ 수정: 백엔드 enum 값과 맞추기 (더 이상 한글명이 아님)
function normalizeAction(action) {
	return String(action ?? "").trim();
}

function createBatchItemLookup(batchItems = []) {
	const lookup = new Map();

	batchItems.forEach((item, index) => {
		const action = String(item.batchItemAction ?? "").trim();
		const key = `${action}:${item.steelWipId}:${index}`;
		lookup.set(key, item);
	});

	return Array.from(lookup.values());
}

// ✅ 수정: 백엔드 enum 값으로 직접 매칭
function findMatchingBatchItem(batchItems, action, steelWipId) {
	const normalizedAction = normalizeAction(action);
	return (
		batchItems.find(
			(item) =>
				normalizeAction(item.batchItemAction) === normalizedAction &&
				Number(item.steelWipId) === Number(steelWipId),
		) ?? null
	);
}

function createMockNcCode(row, itemDetail) {
	return (
		row.ncCode ||
		itemDetail?.ncCode ||
		`NC-${String(row.steelWipId ?? "000").padStart(3, "0")}-${String(
			row.order ?? 1,
		).padStart(2, "0")}`
	);
}

// ✅ 수정: 백엔드 enum 값 사용, 모든 액션 타입 지원
function buildSequentialGroups(craneSchedule = [], batchItems = []) {
	const details = createBatchItemLookup(batchItems);
	const groups = [];

	craneSchedule.forEach((row) => {
		const action = normalizeAction(row.action);
		const metadata = getActionMetadata(action);
		const colorMap = ACTION_COLOR_MAP[action];

		if (!colorMap) return; // 알 수 없는 액션은 스킵

		const itemDetail = findMatchingBatchItem(details, action, row.steelWipId);

		const nextRow = {
			batchItemId: itemDetail?.batchItemId,
			qrNumber: row?.qrCode
				? formatScenarioQr(row, row.steelWipId)
				: formatScenarioQr(itemDetail, row.steelWipId),
			thickness: row?.thickness ?? itemDetail?.thickness ?? "-",
			width: row?.width ?? itemDetail?.width ?? "-",
			length: row?.length ?? itemDetail?.length ?? "-",
			from: mapLocationLabel(row.fromLocation ?? itemDetail?.fromLocation),
			to: mapLocationLabel(row.toLocation ?? itemDetail?.toLocation),

			// ✅ 피킹 유형만 ncCode 표시
			...(action === "PICKING" && {
				ncCode: createMockNcCode(row, itemDetail),
			}),

			estimatedTime: Number(row.eventMinute ?? 0).toFixed(2),
			status: row.moveType ?? "-",
			statusClass: "bg-surface-container-highest text-on-surface-variant",
		};

		const currentGroup = groups[groups.length - 1];

		if (currentGroup && currentGroup.action === action) {
			currentGroup.rows.push(nextRow);
			currentGroup.subLabel = `${currentGroup.rows.length}건`;
			return;
		}

		groups.push({
			id: `${action}-${row.order}`,
			action,
			type: metadata.label_ko,
			icon: metadata.material_icon,
			colorClass: colorMap.colorClass,
			iconColorClass: colorMap.iconColorClass,
			accentTextClass: colorMap.accentTextClass,
			subLabel: "1건",
			rows: [nextRow],
		});
	});

	return groups;
}

export default function Web_SolverTimelineSection({
	craneSchedule = [],
	batchItems = [],
}) {
	const items = buildSequentialGroups(craneSchedule, batchItems);

	return (
		<div className="relative">
			<div className="relative space-y-12 border-l-2 border-surface-container-highest pl-8">
				{items.map((item) => (
					<div key={item.id} className="relative">
						<div
							className={`absolute -left-[41px] top-0 h-4 w-4 rounded-full ring-4 ${item.colorClass}`}
						></div>

						<div className="mb-4 flex items-center gap-3">
							<h3 className="flex items-center gap-2 text-lg font-bold text-on-surface">
								<span
									className="material-symbols-outlined"
									style={{ color: extractColorFromClass(item.colorClass) }}
								>
									{item.icon}
								</span>
								{item.type}
								<span className="text-xs font-medium text-on-surface-variant">
									{item.subLabel}
								</span>
							</h3>
						</div>

						<Web_ScenarioTaskTable
							rows={item.rows}
							accentTextClass={item.accentTextClass}
							timeHeaderLabel="예상 소요시간(분)"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
