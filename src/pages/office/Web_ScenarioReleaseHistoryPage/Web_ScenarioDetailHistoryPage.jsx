import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_ScenarioSummaryPanel from "../../../components/office/Web_ScenarioSummaryPanel/Web_ScenarioSummaryPanel";
import Web_ScenarioMetricCards from "../../../components/office/Web_ScenarioMetricCards/Web_ScenarioMetricCards";
import Web_ScenarioTimelineSection from "../../../components/office/Web_ScenarioTimelineSection/Web_ScenarioTimelineSection";
import Web_SolverTimelineSection from "../../../components/office/Web_SolverTimelineSection/Web_SolverTimelineSection";

import { getScenarioDetail } from "../../../services/scenarioService";
import { mapBatchItemsToTimeline } from "../../../utils/Web/scenarioTimeline";
import { buildScenarioDetailSummary } from "../../../utils/Web/scenarioDetailSummary";

// ─── DB status → 표시용 label 변환 (detail 페이지용) ───────────
function resolveStatusLabel(dbStatus) {
	switch ((dbStatus ?? "").toUpperCase()) {
		case "IN_PROGRESS":
			return "In Progress";
		case "COMPLETED":
			return "Completed";
		case "ORDERED":
			return "Ordered";
		default:
			return "Before Progress";
	}
}

function hasDemoSolverTimeline(scenario) {
	const craneSchedule = scenario?.craneSchedule ?? [];
	return (
		Boolean(scenario?.solverSummary) &&
		craneSchedule.length > 0 &&
		craneSchedule.some((item) => item?.action === "RELOCATE")
	);
}

export default function Web_ScenarioDetailHistoryPage() {
	const location = useLocation();
	const navigate = useNavigate();

	const scenarioId = location.state?.scenarioId ?? null;
	const projectInfo = location.state?.projectInfo ?? null;

	const [scenarioData, setScenarioData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	// state 없이 직접 접근 시 발행 이력 목록으로 리다이렉트
	useEffect(() => {
		if (!scenarioId && !projectInfo) {
			navigate("/office/scenario/releasehistory", { replace: true });
			return;
		}
		if (scenarioId) {
			fetchScenarioDetail(scenarioId);
		} else {
			setLoading(false);
		}
	}, [scenarioId, navigate]);

	const fetchScenarioDetail = async (id) => {
		setLoading(true);
		setError(null);
		try {
			const response = await getScenarioDetail(id);
			const dataList = response.data?.data ?? [];
			setScenarioData(dataList[0] ?? null);
		} catch (err) {
			console.error("시나리오 상세 조회 실패:", err);
			setError("시나리오 데이터를 불러오는 데 실패했습니다.");
		} finally {
			setLoading(false);
		}
	};

	if (!scenarioId && !projectInfo) return null;

	const scenarioSummary = buildScenarioDetailSummary({
		scenarioData,
		projectInfo,
	});

	const metrics = scenarioData
		? [
				{
					label: "재공품 수",
					value: String(scenarioData.totalWipNum ?? 0),
					unit: "EA",
				},
				{
					label: "크레인 이동 횟수",
					value: String(scenarioData.totalCraneMove ?? 0),
					unit: "Times",
				},
				{
					label: "이동 횟수",
					value: String(scenarioData.totalMoveNum ?? 0),
					unit: "Times",
				},
				{
					label: "총 소요 시간",
					value: `${Math.floor((scenarioData.totalCuttingTime ?? 0) / 60)
						.toString()
						.padStart(2, "0")}:${((scenarioData.totalCuttingTime ?? 0) % 60)
						.toString()
						.padStart(2, "0")}`,
					unit: "HR",
					highlight: true,
				},
			]
		: [
				{ label: "재공품 수", value: "-", unit: "EA" },
				{ label: "크레인 이동 횟수", value: "-", unit: "Times" },
				{ label: "이동 횟수", value: "-", unit: "Times" },
				{ label: "총 소요 시간", value: "-", unit: "HR", highlight: true },
			];

	const timelineItems = scenarioData
		? mapBatchItemsToTimeline(scenarioData.batchItems, "expectedStartTime")
		: [];

	return (
		<Web_AppLayout pageTitle="발행된 시나리오 상세">
			<div className="px-8 pt-8 pb-12">
				<div className="mb-8 flex items-end justify-between">
					<p className="font-headline text-lg font-bold tracking-tight text-on-surface">
						현장 전송 이력 &gt; 시나리오 상세
					</p>
					<button
						type="button"
						className="flex items-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-5 py-2.5 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container active:scale-95"
						onClick={() => navigate("/office/scenario/releasehistory")}
					>
						<span className="material-symbols-outlined text-lg">
							arrow_back
						</span>
						목록으로
					</button>
				</div>

				{loading && (
					<div className="py-24 text-center text-sm text-on-surface-variant">
						시나리오 상세를 불러오는 중...
					</div>
				)}

				{error && !loading && (
					<div className="py-12 text-center text-sm text-red-500">{error}</div>
				)}

				{!loading && !error && (
					<>
						<div className="mb-10 grid grid-cols-12 gap-6">
							<Web_ScenarioSummaryPanel summary={scenarioSummary} />
							<Web_ScenarioMetricCards
								metrics={metrics}
								equipmentName={scenarioSummary.equipmentName}
								status={scenarioSummary.status}
							/>
						</div>
						{scenarioData?.solverSummary ? (
							<Web_SolverTimelineSection
								craneSchedule={scenarioData.craneSchedule}
								batchItems={scenarioData.batchItems}
							/>
						) : (
							<Web_ScenarioTimelineSection
								items={timelineItems}
								scenarioId={scenarioId}
							/>
						)}
					</>
				)}
			</div>
		</Web_AppLayout>
	);
}
