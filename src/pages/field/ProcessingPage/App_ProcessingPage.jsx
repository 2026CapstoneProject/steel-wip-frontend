import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_ProcessTabs from "../../../components/field/ProcessTabs/App_ProcessTabs";
import App_Header from "../../../components/field/Header/App_Header";
import workOrderPdf from "../../../assets/Steel_all_Work_instruction.pdf";
import {
	getFieldProgress,
	completeBatch,
} from "../../../services/fieldService";
import { useNextScenario } from "../../../components/field/NextScenario/App_NextScenarioProvider";
import {
	getSelectedFieldScenarioId,
	setSelectedFieldScenarioId,
} from "../../../utils/App/selectedScenario";

const PROCESS_STATUS_META = {
	// 절단 완료 → 적재 대기 (QR 스캔하여 적재 가능)
	pending: {
		label: "적재 대기",
		className: "bg-cyan-50 text-cyan-700",
	},
	// 절단 진행 중 → 생성 대기 (적재 불가, 목록에 표시만)
	generating: {
		label: "생성 대기",
		className: "bg-slate-100 text-slate-500",
	},
	complete: {
		label: "완료",
		className: "bg-green-50 text-green-700",
	},
};

const formatDurationText = (minutes) => {
	const safeMinutes = Math.max(0, Number(minutes) || 0);
	if (safeMinutes === 0) return "-";
	const hours = Math.floor(safeMinutes / 60);
	const remainMinutes = safeMinutes % 60;

	if (hours > 0 && remainMinutes > 0) return `${hours}h ${remainMinutes}m`;
	if (hours > 0) return `${hours}h`;
	return `${safeMinutes}m`;
};

function mapProgressData(progressData) {
	const cuttings = progressData?.lazer_cutting ?? [];

	const batches = cuttings.map((cutting) => ({
		id: String(cutting.lazerCuttingId),
		inputLabel: "투입",
		materialName: cutting.material || "-",
		manufacturer: "-",
		estimatedCuttingTime: cutting.estimatedCuttingTime ?? 0,
		duration: formatDurationText(cutting.estimatedCuttingTime ?? 0),
		generatedItems: (cutting.wip ?? []).map((wip, wipIdx) => ({
			id: String(wip.wipId),
			batchItemId: wip.batchItemId ?? null,
			wipQr: wip.wipQr ?? "",
			title: wip.wipName || `발생한 재공품 ${wipIdx + 1}`,
			manufacturer: wip.manufacturer ?? "-",
			material: wip.material ?? "-",
			specText: wip.specText ?? "",
			weightText: wip.weightText ?? "",
			zone: wip.toLocation || "-",
			// ✅ 백엔드 상태값 3단계 매핑
			// - "적재 완료" → complete (완료)
			// - "적재 대기" → pending (절단 완료, QR 스캔 가능)
			// - "생성 대기" → generating (절단 진행 중, 스캔 불가)
			status:
				wip.status === "적재 완료"
					? "complete"
					: wip.status === "적재 대기"
						? "pending"
						: "generating",
		})),
	}));

	return {
		summaryCountLabel: "남은 작업",
		scenarioId: progressData?.scenarioId ?? null,
		scenarioTitle: progressData?.scenarioTitle ?? "",
		batchProgressRate: progressData?.batchProgressRate ?? 0,
		completedTaskCount: progressData?.completedTaskCount ?? 0,
		totalTaskCount: progressData?.totalTaskCount ?? 0,
		remainingTaskCount: progressData?.remainingTaskCount ?? 0,
		expectedTotalMinutes: progressData?.expectedTotalRunningTime ?? 0,
		hasNoWip: progressData?.hasNoWip ?? false, // ✅ 추가
		batchId: progressData?.batchId ?? null, // ✅ 추가
		canCompleteProduction: progressData?.canCompleteProduction ?? false,
		batches,
	};
}

// ✅ complete가 아닌 항목 모두를 "남은 작업"으로 집계 (generating 포함)
const getRemainingGeneratedCount = (batches = []) =>
	batches.reduce((sum, batch) => {
		const pendingCount = (batch.generatedItems ?? []).filter(
			(item) => item.status !== "complete",
		).length;
		return sum + pendingCount;
	}, 0);

const SummarySection = ({
	progressPercent,
	remainingCount,
	totalEstimatedTimeText,
	countLabel,
	timeLabel,
	onQrClick,
	qrEnabled,
	className = "",
}) => (
	<section
		className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm ${className}`}
	>
		<div className="mb-4 flex gap-4">
			<div className="flex-1">
				<div className="mb-3 flex items-end justify-between">
					<span className="text-sm font-bold text-slate-900">생산 진행도</span>
					<span className="text-lg font-extrabold text-indigo-700">
						{progressPercent}%
					</span>
				</div>

				<div className="h-3 w-full overflow-hidden rounded-full bg-indigo-100">
					<div
						className="h-full rounded-full bg-[#3F51B5]"
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
			</div>

			<div className="flex shrink-0 items-end">
				<button
					type="button"
					onClick={onQrClick}
					disabled={!qrEnabled}
					className={`rounded-lg border p-2 shadow-sm transition ${
						qrEnabled
							? "border-indigo-200 bg-white active:scale-95"
							: "cursor-not-allowed border-slate-200 bg-slate-100 opacity-50"
					}`}
				>
					<span className="material-symbols-outlined block text-4xl text-indigo-700">
						qr_code_2
					</span>
				</button>
			</div>
		</div>

		<div className="grid grid-cols-2 gap-4">
			<div className="rounded-xl bg-slate-50 p-3">
				<p className="mb-1 text-[11px] font-medium text-slate-500">
					{countLabel}
				</p>
				<p className="text-lg font-bold text-slate-900">{remainingCount}개</p>
			</div>

			<div className="rounded-xl bg-slate-50 p-3">
				<p className="mb-1 text-[11px] font-medium text-slate-500">
					{timeLabel}
				</p>
				<p className="text-lg font-bold text-slate-900">
					{totalEstimatedTimeText}
				</p>
			</div>
		</div>
	</section>
);

const GeneratedItemRow = ({ item, isLast }) => {
	// ✅ generating 상태도 메타 존재 → fallback은 generating으로 변경
	const statusMeta =
		PROCESS_STATUS_META[item.status] ?? PROCESS_STATUS_META.generating;

	return (
		<div className={`${!isLast ? "mb-4 border-b border-slate-50 pb-4" : ""}`}>
			<div className="flex items-center justify-between gap-4">
				<span className="text-[15px] font-extrabold text-slate-900">
					{item.title}
				</span>

				<div className="flex items-center gap-4">
					<span className="text-[14px] font-bold text-indigo-600">
						{item.zone}
					</span>

					<span
						className={`min-w-[42px] rounded-full px-3 py-1 text-center text-[11px] font-bold ${statusMeta.className}`}
					>
						{statusMeta.label}
					</span>
				</div>
			</div>
		</div>
	);
};

const ProcessingBatchCard = ({ batch, onWorkOrderClick }) => (
	<div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
		<div className="flex items-start justify-between border-b border-slate-50 bg-slate-50/30 px-6 py-5">
			<div>
				<h3 className="text-[14px] font-medium leading-tight text-slate-500">
					{batch.inputLabel ?? "투입"} {batch.materialName}
				</h3>

				<div className="mt-1.5 flex items-center gap-1 text-slate-400">
					<span className="material-symbols-outlined text-[14px]">
						schedule
					</span>
					<span className="text-[12px] font-medium">{batch.duration}</span>
				</div>
			</div>

			<button
				type="button"
				onClick={() => onWorkOrderClick(batch)}
				className="text-slate-400 transition hover:text-slate-600"
			>
				<span className="material-symbols-outlined text-[24px]">
					description
				</span>
			</button>
		</div>

		<div className="space-y-0 px-6 py-5">
			{(batch.generatedItems ?? []).length === 0 ? (
				<p className="text-sm text-slate-400">발생하는 재공품 없음</p>
			) : (
				(batch.generatedItems ?? []).map((item, index, list) => (
					<GeneratedItemRow
						key={item.id}
						item={item}
						isLast={index === list.length - 1}
					/>
				))
			)}
		</div>
	</div>
);

const App_ProcessingPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { notifyNextScenarioProgress } = useNextScenario();

	const selectedScenarioId =
		location.state?.selectedScenarioId ?? getSelectedFieldScenarioId();

	const [progressData, setProgressData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (location.state?.selectedScenarioId) {
			setSelectedFieldScenarioId(location.state.selectedScenarioId);
		}
	}, [location.state]);

	const fetchProgressData = async () => {
		setLoading(true);
		try {
			const response = await getFieldProgress();
			const dataList = response.data?.data ?? [];
			const matchedData =
				dataList.find((item) => item.scenarioId === selectedScenarioId) ??
				dataList[0] ??
				null;

			if (matchedData?.scenarioId) {
				setSelectedFieldScenarioId(matchedData.scenarioId);
			}

			if (matchedData) {
				notifyNextScenarioProgress({
					scenarioId: matchedData.scenarioId,
					progressRate: matchedData.scenarioProgressRate,
				});
			}

			setProgressData(matchedData);
		} catch (err) {
			console.error("생산 중 데이터 조회 실패:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProgressData();
	}, [selectedScenarioId]);

	useEffect(() => {
		if (location.state?.savedGeneratedWipId) {
			fetchProgressData();
		}
	}, [location.state]);

	const mappedData = useMemo(
		() => mapProgressData(progressData),
		[progressData],
	);
	const currentProcessingBatch = mappedData.batches[0] ?? null;
	const currentProcessingPendingCount = useMemo(
		() =>
			(currentProcessingBatch?.generatedItems ?? []).filter(
				(item) => item.status !== "complete",
			).length,
		[currentProcessingBatch],
	);
	const totalEstimatedTimeText = formatDurationText(
		currentProcessingBatch?.estimatedCuttingTime ?? 0,
	);

	const remainingGeneratedCount = useMemo(
		() => getRemainingGeneratedCount(mappedData.batches),
		[mappedData.batches],
	);

	const progressPercent = useMemo(
		() =>
			Math.round(
				Number.isFinite(mappedData.batchProgressRate)
					? mappedData.batchProgressRate * 100
					: 0,
			),
		[mappedData.batchProgressRate],
	);

	const remainingCount = currentProcessingPendingCount;

	const generatedItemsForQr = useMemo(
		() =>
			mappedData.batches.flatMap((batch) =>
				(batch.generatedItems ?? []).map((item) => ({
					...item,
					inputMaterialName: batch.materialName,
					manufacturer: item.manufacturer ?? batch.manufacturer ?? "-",
					expectedDurationText: batch.duration,
					estimatedCuttingTime: batch.estimatedCuttingTime,
				})),
			),
		[mappedData.batches],
	);

	// ✅ QR 적재 대상: "적재 대기" 상태인 항목만 (절단 완료 후 스캔 가능)
	// "생성 대기" 항목은 절단 진행 중이므로 QR 흐름에서 제외
	const pendingGeneratedItems = useMemo(
		() => generatedItemsForQr.filter((item) => item.status === "pending"),
		[generatedItemsForQr],
	);

	const isQrEnabled = pendingGeneratedItems.length > 0;

	const handleQrClick = () => {
		if (!isQrEnabled) return;

		navigate("/App/processing/qr", {
			state: {
				generatedItems: pendingGeneratedItems,
				batches: mappedData.batches,
				summary: {
					scenarioId: mappedData.scenarioId,
					progressPercent,
					remainingCount,
					totalEstimatedMinutes: mappedData.expectedTotalMinutes,
					totalEstimatedTimeText,
					countLabel: mappedData.summaryCountLabel,
				},
			},
		});
	};

	const handleCompleteProduction = async () => {
		if (!window.confirm("생산을 완료 처리하시겠습니까?")) return;
		try {
			const response = await completeBatch(mappedData.batchId);
			const result = response?.data?.data ?? {};
			const nextStage = result.nextStage ?? "end";
			const nextPath =
				nextStage === "processing"
					? "/App/processing"
					: nextStage === "ready"
						? "/App/ready"
						: "/App/end";

			navigate(nextPath, {
				replace: true,
				state: {
					selectedScenarioId: result.scenarioId ?? mappedData.scenarioId,
				},
			});
		} catch (err) {
			console.error("생산완료 처리 실패:", err);
			alert("완료 처리 중 오류가 발생했습니다.");
		}
	};

	const handleWorkOrderClick = () => {
		window.open(workOrderPdf, "_self");
	};

	return (
		<div className="h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
			<App_Header showBackButton />

			<main className="mx-auto flex h-[calc(100dvh-72px)] w-full max-w-md flex-col px-4">
				<div className="shrink-0 bg-[#f7f9fb] pt-3">
					<App_ProcessTabs activeKey="processing" className="mb-0" />

					<SummarySection
						className="mt-4 mb-4"
						progressPercent={progressPercent}
						remainingCount={remainingCount}
						totalEstimatedTimeText={totalEstimatedTimeText}
						countLabel={mappedData.summaryCountLabel}
						timeLabel="예상 소요 시간"
						onQrClick={handleQrClick}
						qrEnabled={isQrEnabled}
					/>
				</div>
				<div className="min-h-0 flex-1 overflow-y-auto pb-8">
					{loading ? (
						<div className="py-12 text-center text-sm text-slate-500">
							데이터를 불러오는 중...
						</div>
					) : mappedData.batches.length === 0 && !mappedData.hasNoWip ? (
						<div className="py-12 text-center text-sm text-slate-500">
							현재 진행 중인 생산 작업이 없습니다.
						</div>
					) : (
						<div className="space-y-4 pb-2">
							{mappedData.batches.map((batch) => (
								<ProcessingBatchCard
									key={batch.id}
									batch={batch}
									onWorkOrderClick={handleWorkOrderClick}
								/>
							))}

							{/* ✅ 재공품 없는 배치일 때만 생산완료 버튼 표시 */}
							{mappedData.hasNoWip && mappedData.canCompleteProduction && (
								<button
									type="button"
									onClick={handleCompleteProduction}
									className="w-full rounded-2xl bg-[#3F51B5] py-4 text-base font-bold text-white shadow-sm transition active:scale-95 active:opacity-90"
								>
									생산완료
								</button>
							)}
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default App_ProcessingPage;
