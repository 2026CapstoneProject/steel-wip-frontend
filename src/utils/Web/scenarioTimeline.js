// ✅ 통일된 메타데이터: 백엔드는 한글명, 프론트는 영문/한글 모두 지원
const ACTION_META = {
	// 영문 키 (일부 API/내부 로직용)
	RELOCATE: {
		type: "재배치",
		icon: "sync_alt",
		colorClass: "bg-gray-400 ring-surface",
		iconColorClass: "text-gray-400",
		accentClass: "text-gray-400",
	},
	PICKING: {
		type: "피킹",
		icon: "location_on",
		colorClass: "bg-red-500 ring-surface",
		iconColorClass: "text-red-500",
		accentClass: "text-red-500",
	},
	DIRECT_START: {
		type: "원자재 투입",
		icon: "input",
		colorClass: "bg-purple-500 ring-surface",
		iconColorClass: "text-purple-500",
		accentClass: "text-purple-500",
	},
	INBOUND: {
		type: "적재",
		icon: "publish",
		colorClass: "bg-cyan-500 ring-surface",
		iconColorClass: "text-cyan-500",
		accentClass: "text-cyan-500",
	},
	TEMP_MOVE: {
		type: "임시이동",
		icon: "arrow_forward",
		colorClass: "bg-orange-500 ring-surface",
		iconColorClass: "text-orange-500",
		accentClass: "text-orange-500",
	},
	RESTORE: {
		type: "원상복구",
		icon: "arrow_back",
		colorClass: "bg-cyan-500 ring-surface",
		iconColorClass: "text-cyan-500",
		accentClass: "text-cyan-500",
	},
	// ✅ 한글명 키 (백엔드 API에서 반환되는 값)
	재배치: {
		type: "재배치",
		icon: "sync_alt",
		colorClass: "bg-gray-400 ring-surface",
		iconColorClass: "text-gray-400",
		accentClass: "text-gray-400",
	},
	피킹: {
		type: "피킹",
		icon: "location_on",
		colorClass: "bg-red-500 ring-surface",
		iconColorClass: "text-red-500",
		accentClass: "text-red-500",
	},
	"원자재 투입": {
		type: "원자재 투입",
		icon: "input",
		colorClass: "bg-purple-500 ring-surface",
		iconColorClass: "text-purple-500",
		accentClass: "text-purple-500",
	},
	적재: {
		type: "적재",
		icon: "publish",
		colorClass: "bg-cyan-500 ring-surface",
		iconColorClass: "text-cyan-500",
		accentClass: "text-cyan-500",
	},
	임시이동: {
		type: "임시이동",
		icon: "arrow_forward",
		colorClass: "bg-orange-500 ring-surface",
		iconColorClass: "text-orange-500",
		accentClass: "text-orange-500",
	},
	원상복구: {
		type: "원상복구",
		icon: "arrow_back",
		colorClass: "bg-cyan-500 ring-surface",
		iconColorClass: "text-cyan-500",
		accentClass: "text-cyan-500",
	},
};

function normalizeAction(action) {
	return String(action ?? "").trim();
}

function formatScenarioQr(item) {
	if (item?.qrCode) return item.qrCode;
	return "원자재";
}

function buildRow(item, timeField) {
	const action = normalizeAction(item.batchItemAction);
	const isPickingLike =
		action === "PICKING" ||
		action === "피킹" ||
		action === "DIRECT_START" ||
		action === "원자재 투입";

	return {
		batchItemId: item.batchItemId,
		qrNumber: formatScenarioQr(item),
		ncCode: isPickingLike ? item.ncCode ?? "-" : undefined,
		thickness: String(item.thickness ?? ""),
		width: String(item.width ?? ""),
		length: String(item.length ?? ""),
		from: item.fromLocation || "-",
		to: item.toLocation || "-",
		estimatedTime: String(item?.[timeField] ?? ""),
	};
}

export function mapBatchItemsToTimeline(batchItems, timeField = "expectedStartTime") {
	const sortedItems = [...(batchItems ?? [])].sort((a, b) => {
		const timeA = Number(a?.expectedStartTime ?? 0);
		const timeB = Number(b?.expectedStartTime ?? 0);
		if (timeA !== timeB) return timeA - timeB;
		return Number(a?.batchItemId ?? 0) - Number(b?.batchItemId ?? 0);
	});

	const sections = [];
	let currentSection = null;

	for (const item of sortedItems) {
		const action = normalizeAction(item.batchItemAction);
		const meta = ACTION_META[action];
		if (!meta) continue;

		if (!currentSection || currentSection.action !== action) {
			currentSection = {
				id: sections.length + 1,
				action,
				type: meta.type,
				icon: meta.icon,
				colorClass: meta.colorClass,
				iconColorClass: meta.iconColorClass,
				rows: [],
			};
			sections.push(currentSection);
		}

		currentSection.rows.push(buildRow(item, timeField));
	}

	return sections;
}
