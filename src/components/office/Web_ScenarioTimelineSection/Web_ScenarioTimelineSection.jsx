import Web_ScenarioTaskTable from "../Web_ScenarioTaskTable/Web_ScenarioTaskTable";

// ✅ 통일된 아이콘/색상: scenarioTimeline.js와 동기화
const ACTION_META = {
	재배치: { accentClass: "text-gray-400" },
	피킹: { accentClass: "text-red-500" },
	원자재투입: { accentClass: "text-purple-500" },
	"원자재 투입": { accentClass: "text-purple-500" },
	적재: { accentClass: "text-cyan-500" },
	임시이동: { accentClass: "text-orange-500" },
	원상복구: { accentClass: "text-cyan-500" },
};

// ✅ Tailwind 색상 → HEX 변환
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

export default function Web_ScenarioTimelineSection({
	items,
	scenarioId,
	timeHeaderLabel = "예상 소요시간(분)",
}) {
	const getAccentTextClass = (type) => {
		return ACTION_META[type]?.accentClass || "text-primary";
	};

	return (
		<div className="relative">
			<div className="relative pl-8 border-l-2 border-surface-container-highest space-y-12">
				{items.map((item) => (
					<div key={item.id} className="relative">
						<div
							className={`absolute -left-[41px] top-0 w-4 h-4 rounded-full ring-4 ${item.colorClass}`}
						></div>

						<div className="flex items-center gap-3 mb-4">
							<h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
								<span
									className="material-symbols-outlined"
									style={{ color: extractColorFromClass(item.colorClass) }}
								>
									{item.icon}
								</span>
								{item.type}
								{item.subLabel && (
									<span className="text-xs font-medium text-on-surface-variant">
										{item.subLabel}
									</span>
								)}
							</h3>
						</div>

						<Web_ScenarioTaskTable
							rows={item.rows}
							accentTextClass={getAccentTextClass(item.type)}
							timeHeaderLabel={timeHeaderLabel}
							scenarioId={scenarioId}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
