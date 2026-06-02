import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import App_ProcessTabs from "../../../components/field/ProcessTabs/App_ProcessTabs";
import App_Header from "../../../components/field/Header/App_Header";
import workOrderPdf from "../../../assets/Steel_all_Work_instruction.pdf";
import { completeBatch, getFieldReady } from "../../../services/fieldService";
import { useNextScenario } from "../../../components/field/NextScenario/App_NextScenarioProvider";
import {
	getSelectedFieldScenarioId,
	setSelectedFieldScenarioId,
} from "../../../utils/App/selectedScenario";

// ─── 헬퍼 함수 ──────────────────────────────────────────────────────

const buildRelocateActionKey = (taskId, itemId) =>
	`${taskId}-relocate-${itemId}`;

const buildPickingActionKey = (taskId, itemId) => `${taskId}-picking-${itemId}`;

const extractSlotNumber = (value) => {
	const match = String(value ?? "").match(/(\d+)/);
	return match ? match[1] : "";
};

const parseDurationMinutes = (value) => {
	const raw = String(value ?? "").trim();
	if (!raw || raw === "0") return 0;
	const plainNumber = raw.match(/^(\d+)$/);
	if (plainNumber) return Number(plainNumber[1]);
	const hourMatches = [...raw.matchAll(/(\d+)\s*(h|시간)/gi)];
	const minuteMatches = [...raw.matchAll(/(\d+)\s*(m|분)/gi)];
	const hours = hourMatches.reduce((sum, m) => sum + Number(m[1] || 0), 0);
	const minutes = minuteMatches.reduce((sum, m) => sum + Number(m[1] || 0), 0);
	return hours * 60 + minutes;
};

const formatMinuteText = (value) => `${Number(value ?? 0)}분`;

const formatExpectedTimeText = (startTime, runningTime) => {
	const running = Number(runningTime ?? 0);

	if (running > 0) {
		return `예상 소요 시간 ${formatMinuteText(running)}`;
	}

	return "";
};

const formatSpecText = (value) => {
	const raw = String(value ?? "").trim();
	if (!raw) return "";
	return raw.replace(/\s*[xX]\s*/g, " X ");
};

const isDirectStartFieldItem = (item) =>
	String(item?.batchItemAction ?? "").toUpperCase() === "RELOCATE" &&
	!item?.fromLocationName &&
	String(item?.toLocationName ?? "").startsWith("S4-");

const mapOrderedItemsToDisplayEntries = (orderedItems = []) => {
	const entries = [];
	let taskNumber = 1;

	for (let index = 0; index < orderedItems.length; index += 1) {
		const item = orderedItems[index];
		const action = String(item?.batchItemAction ?? "").toUpperCase();
		const wip = item?.wip?.[0] ?? null;

		if (action === "INBOUND") {
			let count = 1;
			let cursor = index + 1;
			while (
				cursor < orderedItems.length &&
				String(orderedItems[cursor]?.batchItemAction ?? "").toUpperCase() === "INBOUND"
			) {
				count += 1;
				cursor += 1;
			}

			entries.push({
				id: `inbound-${item.batchItemId}`,
				kind: "inbound",
				count,
			});
			index = cursor - 1;
			continue;
		}

		const specText = wip
			? formatSpecText(
					`${wip.thickness || ""}X${wip.width || ""}X${wip.length || ""}`,
				)
			: "";
		const weightText = wip?.weight ? `${wip.weight}kg` : "-";
		const expectedStartTime = Number(item?.expectedStartTime ?? 0);
		const expectedRunningTime = Number(item?.expectedRunningTime ?? 0);

		if (action === "PICKING" || isDirectStartFieldItem(item)) {
			const isRaw = isDirectStartFieldItem(item);
			entries.push({
				id: `task-${item.batchItemId}`,
				kind: "task",
				task: {
					id: `task-${item.batchItemId}`,
					title: `Task ${String(taskNumber).padStart(2, "0")}`,
					relocations: [],
					pickings: [
						{
							id: String(item.batchItemId),
							batchItemId: Number(item.batchItemId),
							title: `Picking 1`,
							type: isRaw ? "원자재 투입" : "Picking",
							actionType: isRaw ? "DIRECT_START" : "PICKING",
							isRaw,
							wipQr: wip?.qrId ?? "",
							manufacturer: wip?.manufacturer ?? "-",
							materialName: wip?.material ?? "-",
							specText,
							weightText,
							currentZone: item?.fromLocationName || "",
							targetPositionLabel: item?.toLocationName || "",
							infoLabel: isRaw ? "투입 위치" : "현재 위치",
							infoValue: isRaw
								? item?.toLocationName || "-"
								: item?.fromLocationName || "-",
							expectedStartTime,
							expectedRunningTime,
							expectedTimeText: formatExpectedTimeText(
								expectedStartTime,
								expectedRunningTime,
							),
						},
					],
				},
			});
			taskNumber += 1;
			continue;
		}

		entries.push({
			id: `task-${item.batchItemId}`,
			kind: "task",
			task: {
				id: `task-${item.batchItemId}`,
				title: `Task ${String(taskNumber).padStart(2, "0")}`,
				relocations: [
					{
						id: String(item.batchItemId),
						batchItemId: Number(item.batchItemId),
						wipQr: wip?.qrId ?? "",
						manufacturer: wip?.manufacturer ?? "-",
						materialName: wip?.material ?? "-",
						specText,
						weightText,
						fromZone: item?.fromLocationName || "-",
						toZone: item?.toLocationName || "-",
						expectedStartTime,
						expectedRunningTime,
						expectedTimeText: formatExpectedTimeText(
							expectedStartTime,
							expectedRunningTime,
						),
					},
				],
				pickings: [],
			},
		});
		taskNumber += 1;
	}

	return entries;
};

// FieldBatchGroup[] → expectedStartTime 기반으로 동적 배치 그룹화
function mapBatchesToTaskGroups(batchGroups) {
	const allGroups = [];

	(batchGroups ?? []).forEach((group, batchIndex) => {
		// 1. relocation + picking을 actions으로 변환
		const actions = [
			...(group.relocation ?? []).map((item) => ({
				kind: "relocation",
				expectedStartTime: Number(item.expectedStartTime ?? 0),
				payload: {
					id: String(item.batchItemId),
					batchItemId: item.batchItemId,
					wipQr: item.wipQr ?? "",
					manufacturer: item.manufacturer ?? "-",
					materialName: item.material || "-",
					specText: formatSpecText(item.specText ?? ""),
					weightText: item.weightText ?? "-",
					fromZone: item.fromLocationName || "-",
					toZone: item.toLocationName || "-",
					expectedStartTime: Number(item.expectedStartTime ?? 0),
					expectedRunningTime: Number(item.expectedRunningTime ?? 0),
					expectedTimeText: formatExpectedTimeText(
						item.expectedStartTime,
						item.expectedRunningTime,
					),
				},
			})),
			...(group.picking ?? []).map((item, pickIdx) => {
				const isRaw =
					item.actionType === "DIRECT_START" ||
					!item.fromLocationName ||
					item.fromLocationName === "" ||
					!item.wipQr ||
					item.wipQr === "";
				const specText =
					formatSpecText(item.specText) ||
					(item.thickness && item.width && item.height
						? `${item.thickness} x ${item.width} x ${item.height}`
						: "");

				return {
					kind: "picking",
					expectedStartTime: Number(item.expectedStartTime ?? 0),
					payload: {
						id: String(item.batchItemId),
						batchItemId: item.batchItemId,
						title: `Picking ${pickIdx + 1}`,
						type: isRaw ? "원자재 투입" : "Picking",
						actionType: item.actionType || "PICKING",
						isRaw,
						wipQr: item.wipQr ?? "",
						manufacturer: item.manufacturer ?? "-",
						materialName: item.material || "-",
						specText,
						weightText: item.weightText ?? "-",
						currentZone: item.fromLocationName || "",
						targetPositionLabel:
							item.toLocationName || `Position ${pickIdx + 1}`,
						infoLabel: isRaw ? "투입 위치" : "현재 위치",
						infoValue: isRaw
							? item.toLocationName || `Position ${pickIdx + 1}`
							: item.fromLocationName || "-",
						expectedStartTime: Number(item.expectedStartTime ?? 0),
						expectedRunningTime: Number(item.expectedRunningTime ?? 0),
						expectedTimeText: formatExpectedTimeText(
							item.expectedStartTime,
							item.expectedRunningTime,
						),
					},
				};
			}),
		].sort((a, b) => {
			if (a.expectedStartTime !== b.expectedStartTime) {
				return a.expectedStartTime - b.expectedStartTime;
			}
			return Number(a.payload.batchItemId ?? 0) - Number(b.payload.batchItemId ?? 0);
		});

		// 2. inbound의 expectedStartTime 배열
		const inboundTimes = (group.inbound ?? [])
			.map((item) => Number(item.expectedStartTime ?? 0))
			.sort((a, b) => a - b);

		// 3. expectedStartTime 기준으로 배치 그룹 나누기
		if (inboundTimes.length === 0) {
			// inbound가 없으면 모든 actions을 하나의 그룹으로
			const taskItems = actions.map((entry, actionIndex) => ({
				id: `batch-${batchIndex}-action-${actionIndex}`,
				title: `Task ${String(actionIndex + 1).padStart(2, "0")}`,
				relocations: entry.kind === "relocation" ? [entry.payload] : [],
				pickings: entry.kind === "picking" ? [entry.payload] : [],
			}));

			allGroups.push({
				batchIndex,
				tasks: taskItems,
				inboundCount: 0,
			});
			return;
		}

		// expectedStartTime 경계점으로 배치 분할
		let currentGroupActions = [];
		let currentGroupIndex = 0;
		let nextBoundaryTime = inboundTimes[0];

		actions.forEach((action) => {
			// 다음 경계에 도달했으면 현재 그룹을 저장
			if (action.expectedStartTime >= nextBoundaryTime) {
				// ✅ 앞선 task가 없어도 (빈 그룹이어도) 적재 카드는 항상 push
				//    TEMP_MOVE 같은 선행 작업이 완료된 후에도 적재 대기 카드가 유지되어야 함
				const taskItems = currentGroupActions.map((entry, actionIndex) => ({
					id: `batch-${batchIndex}-group-${currentGroupIndex}-action-${actionIndex}`,
					title: `Task ${String(actionIndex + 1).padStart(2, "0")}`,
					relocations: entry.kind === "relocation" ? [entry.payload] : [],
					pickings: entry.kind === "picking" ? [entry.payload] : [],
				}));

				allGroups.push({
					batchIndex,
					groupIndex: currentGroupIndex,
					tasks: taskItems,        // 빈 배열일 수 있음 → InboundPromptCard만 표시
					inboundCount: 1,
				});

				currentGroupActions = [];
				currentGroupIndex += 1;
				nextBoundaryTime = inboundTimes[currentGroupIndex] ?? Infinity;
			}

			currentGroupActions.push(action);
		});

		// 마지막 그룹 저장
		if (currentGroupActions.length > 0) {
			const taskItems = currentGroupActions.map((entry, actionIndex) => ({
				id: `batch-${batchIndex}-group-${currentGroupIndex}-action-${actionIndex}`,
				title: `Task ${String(actionIndex + 1).padStart(2, "0")}`,
				relocations: entry.kind === "relocation" ? [entry.payload] : [],
				pickings: entry.kind === "picking" ? [entry.payload] : [],
			}));

			allGroups.push({
				batchIndex,
				groupIndex: currentGroupIndex,
				tasks: taskItems,
				inboundCount: 1,
			});
		}
	});

	return allGroups;
}

// ─── 서브 컴포넌트 ──────────────────────────────────────────────────

const InboundPromptCard = ({ count, groupTasksCount, onStartInbound }) => (
	<section className="space-y-3">
		{/* 구분선 */}
		<div className="border-t-2 border-slate-300 pt-6" />

		{/* 적재 섹션 */}
		<div className="rounded-2xl border-2 border-cyan-400 bg-gradient-to-br from-cyan-50 to-cyan-100/50 p-5 shadow-md">
			<div className="mb-4 flex items-start justify-between">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/20">
						<span className="material-symbols-outlined text-xl text-cyan-600">
							package_2
						</span>
					</div>
					<div>
						<h3 className="text-base font-extrabold text-slate-900">
							발생 재공품 적재
						</h3>
						<p className="mt-1 text-xs font-medium text-slate-600">
							위 작업들의 결과물을 적재해주세요
						</p>
					</div>
				</div>
			</div>

			{/* 적재 개수 정보 */}
			<div className="mb-4 rounded-lg bg-white/70 px-3 py-2">
				<p className="text-sm font-semibold text-slate-700">
					적재 대기: <span className="text-cyan-600">{count}개</span>
				</p>
			</div>

			{/* 시작 버튼 */}
			<button
				type="button"
				onClick={() => onStartInbound(groupTasksCount)}
				className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 px-4 py-2.5 font-bold text-white shadow-md transition hover:shadow-lg active:scale-95"
			>
				<span className="flex items-center justify-center gap-2">
					<span className="material-symbols-outlined text-lg">arrow_forward</span>
					적재 시작하기
				</span>
			</button>
		</div>
	</section>
);

const SummarySection = ({
	progressPercent,
	remainingTaskCount,
	remainingWorkTime,
	className = "",
}) => (
	<section
		className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm ${className}`}
	>
		<div className="mb-4 flex gap-4">
			<div className="flex-1">
				<div className="mb-3 flex items-end justify-between">
					<span className="text-sm font-bold text-slate-900">전체 진행도</span>
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
		</div>
		<div className="grid grid-cols-2 gap-4">
			<div className="rounded-xl bg-slate-50 p-3">
				<p className="mb-1 text-[11px] font-medium text-slate-500">남은 작업</p>
				<p className="text-lg font-bold text-slate-900">
					{remainingTaskCount}개
				</p>
			</div>
			<div className="rounded-xl bg-slate-50 p-3">
				<p className="mb-1 text-[11px] font-medium text-slate-500">
					남은 작업 시간
				</p>
				<p className="text-lg font-bold text-slate-900">{remainingWorkTime}</p>
			</div>
		</div>
	</section>
);

const RelocateCard = ({ item, onQrClick }) => (
	<div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
		<div className="mb-3 flex items-start justify-between">
			<div>
				<h3 className="text-sm font-bold text-indigo-700">
					{item.materialName} - {item.manufacturer}
				</h3>
				<span className="text-xs font-bold text-slate-700">
					{item.specText} | {item.wipQr}
				</span>
				<div className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
					<span>{item.fromZone}</span>
					<span>→</span>
					<span>{item.toZone}</span>
				</div>
			</div>
			<button
				type="button"
				onClick={onQrClick}
				className="rounded-lg border border-indigo-200 bg-white p-2 shadow-sm transition active:scale-95"
			>
				<span className="material-symbols-outlined block text-4xl text-indigo-700">
					qr_code_2
				</span>
			</button>
		</div>
		<div className="flex items-center gap-1.5 text-[12px] text-slate-400">
			<span className="material-symbols-outlined text-[18px] leading-none">
				schedule
			</span>
			<span>{item.expectedTimeText}</span>
		</div>
	</div>
);

const PickingCard = ({ item, onActionClick, onWorkOrderClick }) => {
	const isRawMaterial = item?.isRaw ?? false;
	const actionIcon = isRawMaterial ? "input" : "qr_code_2";
	const displayInfoValue = item?.infoValue ?? "";
	const cardClassName = isRawMaterial
		? "rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 shadow-sm"
		: "rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm";
	const iconButtonClassName = isRawMaterial
		? "rounded-lg border border-purple-200 bg-white p-2 shadow-sm transition active:scale-95"
		: "rounded-lg border border-indigo-200 bg-white p-2 shadow-sm transition active:scale-95";
	const iconClassName = isRawMaterial
		? "material-symbols-outlined block text-4xl text-purple-700"
		: "material-symbols-outlined block text-4xl text-indigo-700";

	return (
		<div className={cardClassName}>
			<div className="mb-2 flex items-start justify-between">
				<div>
					<div className="mb-2 flex items-center gap-2">
						<span
							className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
								isRawMaterial
									? "bg-purple-100 text-purple-700"
									: "bg-indigo-100 text-indigo-700"
							}`}
						>
							<span className="material-symbols-outlined text-[12px]">
								{isRawMaterial ? "input" : "inventory_2"}
							</span>
							{isRawMaterial ? "원자재 피킹" : item.type}
						</span>
					</div>
					<p
						className={`mb-1 text-sm font-bold ${
							isRawMaterial ? "text-purple-700" : "text-indigo-700"
						}`}
					>
						{item.materialName} - {item.manufacturer}
						<br />
						<span className="text-xs font-bold text-slate-900">
							{item.specText} | {isRawMaterial ? "원자재" : item.wipQr}
						</span>
					</p>
					{displayInfoValue ? (
						<div className="flex items-center gap-1.5">
							<span className="text-[11px] font-medium text-slate-500">
								{item.infoLabel}
							</span>
							<span
								className={`text-[12px] font-bold ${
									isRawMaterial ? "text-purple-700" : "text-indigo-700"
								}`}
							>
								{displayInfoValue}
							</span>
						</div>
					) : null}
				</div>
				<div className="flex items-center gap-4">
					<button
						type="button"
						onClick={() => onWorkOrderClick(item)}
						className="p-1"
					>
						<span className="material-symbols-outlined text-[21px] text-slate-500">
							description
						</span>
					</button>
					<button
						type="button"
						onClick={onActionClick}
						className={iconButtonClassName}
					>
						<span className={iconClassName}>
							{actionIcon}
						</span>
					</button>
				</div>
			</div>
			<div className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-400">
				<span className="material-symbols-outlined text-[18px] leading-none">
					schedule
				</span>
				<span>{item.expectedTimeText}</span>
			</div>
		</div>
	);
};

const TaskSection = ({
	task,
	activeActionKey,
	onRelocateQrClick,
	onPickingActionClick,
	onWorkOrderClick,
}) => (
	<section className="space-y-4">
		<div className="flex items-center gap-2 px-1">
			<div className="h-5 w-1.5 rounded-full bg-indigo-700" />
			<h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
		</div>

		{task.relocations?.length > 0 && (
			<div className="space-y-3">
				{task.relocations.map((item) => {
					const actionKey = buildRelocateActionKey(task.id, item.id);

					return (
						<RelocateCard
							key={item.id}
							item={item}
							onQrClick={() => onRelocateQrClick(item, actionKey)}
						/>
					);
				})}
			</div>
		)}

		{task.pickings?.length > 0 && (
			<div className="mt-4 space-y-3">
				{task.pickings.map((item, index) => {
					const actionKey = buildPickingActionKey(task.id, item.id);

					return (
						<PickingCard
							key={item.id}
							item={item}
							onActionClick={() =>
								onPickingActionClick(item, index, task.pickings, actionKey)
							}
							onWorkOrderClick={onWorkOrderClick}
						/>
					);
				})}
			</div>
		)}
	</section>
);

// ─── 메인 컴포넌트 ──────────────────────────────────────────────────

const App_ReadyPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { notifyNextScenarioProgress } = useNextScenario();

	const selectedScenarioId =
		location.state?.selectedScenarioId ?? getSelectedFieldScenarioId();

	const [readyData, setReadyData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isOrderPopupOpen, setIsOrderPopupOpen] = useState(false);
	const [isInboundWarningOpen, setIsInboundWarningOpen] = useState(false);
	const [pendingAction, setPendingAction] = useState(null);
	const [isProductionConfirmOpen, setIsProductionConfirmOpen] = useState(false);

	useEffect(() => {
		if (location.state?.selectedScenarioId) {
			setSelectedFieldScenarioId(location.state.selectedScenarioId);
		}
	}, [location.state]);

	useEffect(() => {
		fetchReadyData();
	}, [selectedScenarioId]);

	useEffect(() => {
		if (location.state?.savedGeneratedWipId || location.state?.justCompletedBatch) {
			fetchReadyData();
		}
	}, [location.state]);

	useEffect(() => {
		if (!isOrderPopupOpen) return;

		const timer = window.setTimeout(() => {
			setIsOrderPopupOpen(false);
		}, 1200);

		return () => window.clearTimeout(timer);
	}, [isOrderPopupOpen]);

	const fetchReadyData = async () => {
		setLoading(true);
		try {
			const readyResponse = await getFieldReady();
			const dataList = readyResponse.data?.data ?? [];
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

			setReadyData(matchedData);
		} catch (err) {
			console.error("생산 준비 데이터 조회 실패:", err);
		} finally {
			setLoading(false);
		}
	};

	const orderedEntries =
		readyData?.orderedItems?.length > 0
			? mapOrderedItemsToDisplayEntries(readyData.orderedItems)
			: mapBatchesToTaskGroups(readyData?.batch ?? []).flatMap((group) => {
					const taskEntries = group.tasks.map((task) => ({
						id: task.id,
						kind: "task",
						task,
					}));
					if (group.inboundCount > 0) {
						taskEntries.push({
							id: `inbound-fallback-${group.batchIndex}-${group.groupIndex ?? 0}`,
							kind: "inbound",
							count: group.inboundCount,
						});
					}
					return taskEntries;
				});
	const allTasks = orderedEntries
		.filter((entry) => entry.kind === "task")
		.map((entry) => entry.task);

	const progressPercent = Math.round(
		(readyData?.scenarioProgressRate ?? 0) * 100,
	);
	const visibleReadyTaskCount = allTasks.reduce(
		(sum, t) => sum + (t.relocations?.length ?? 0) + (t.pickings?.length ?? 0),
		0,
	);
	const hiddenCurrentBatchTaskCount =
		readyData?.currentBatchRemainingTaskCount ?? 0;
	const hiddenInboundTaskCount =
		readyData?.currentBatchPendingInboundCount ?? 0;
	const shouldShowInboundPrompt =
		!loading &&
		(hiddenInboundTaskCount > 0 ||
			orderedEntries.some((entry) => entry.kind === "inbound"));
	const remainingTaskCount =
		visibleReadyTaskCount > 0
			? visibleReadyTaskCount
			: hiddenCurrentBatchTaskCount;

	const getTaskActionKeys = (task) => [
		...(task.relocations ?? []).map((item) =>
			buildRelocateActionKey(task.id, item.id),
		),
		...(task.pickings ?? []).map((item) =>
			buildPickingActionKey(task.id, item.id),
		),
	];

	const activeEntry =
		orderedEntries[0] ??
		(shouldShowInboundPrompt
			? {
					id: "hidden-inbound",
					kind: "inbound",
				}
			: null);

	const activeActionKeys =
		activeEntry?.kind === "task" ? getTaskActionKeys(activeEntry.task) : [];
	const activeActionKey = activeActionKeys[0] ?? "";
	const isInboundAllowed = activeEntry?.kind === "inbound";

	const isActionAllowed = (actionKey) => {
		if (!activeEntry) return true;
		if (activeEntry.kind !== "task") return false;
		return !activeActionKey || activeActionKey === actionKey;
	};

	const requiresProductionCompletion =
		readyData?.requiresProductionCompletion &&
		readyData?.blockingProductionBatchId;

	const runOrConfirmProductionCompletion = (action) => {
		if (!requiresProductionCompletion) {
			action();
			return;
		}

		setPendingAction(() => action);
		setIsProductionConfirmOpen(true);
	};

	const openOrderPopup = () => {
		setIsOrderPopupOpen(true);
	};

	const handleRelocateQrClick = (item, actionKey) => {
		if (!isActionAllowed(actionKey)) {
			openOrderPopup();
			return;
		}

		navigate("/App/ready/relocate", {
			state: {
				batchItemId: item.batchItemId,
				relocation: {
					id: item.id,
					wipQr: item.wipQr ?? "",
					manufacturer: item.manufacturer ?? "-",
					material: item.materialName,
					specText: item.specText ?? "",
					weightText: item.weightText ?? "-",
					from: { zone: item.fromZone },
					to: { zone: item.toZone },
				},
			},
		});
	};

	const handlePickingActionClick = (item, index, pickingList, actionKey) => {
		if (!isActionAllowed(actionKey)) {
			openOrderPopup();
			return;
		}

		const order = index + 1;
		const totalCount = pickingList.length;
		const targetPosition = item?.targetPositionLabel || `Position ${order}`;
		const highlightedSlot = extractSlotNumber(targetPosition) || String(order);
		const expectedDurationText =
			item?.expectedRunningTime > 0
				? formatMinuteText(item.expectedRunningTime)
				: "";
		const expectedDurationMinutes = parseDurationMinutes(expectedDurationText);

		const commonPickingState = {
			...item,
			batchItemId: item.batchItemId,
			manufacturer: item?.manufacturer || "-",
			material: item?.materialName || "",
			specText: item?.specText || "",
			weightText: item?.weightText || "-",
			duration: expectedDurationText,
			expectedDurationText,
			expectedDurationMinutes,
			from: { zone: item?.currentZone || item?.infoValue || "" },
			to: { zone: targetPosition },
			layout: { highlightedSlot },
			pickingOrder: order,
			totalPickingCount: totalCount,
			isLastPicking: order === totalCount,
		};

		// ✅ isRaw 속성으로 판단: 원자재(raw) vs 재공품(WIP)
		const isRaw = item?.isRaw ?? false;
		const targetRoute = isRaw ? "/App/ready/picking/raw" : "/App/ready/picking/wip";

		runOrConfirmProductionCompletion(() => {
			navigate(targetRoute, {
				state: {
					picking: commonPickingState,
					pickingOrder: order,
					totalPickingCount: totalCount,
				},
			});
		});
	};

	const handleWorkOrderClick = () => {
		window.open(workOrderPdf, "_self");
	};

	const handleStartInbound = (groupTasksCount) => {
		if (!isInboundAllowed) {
			openOrderPopup();
			return;
		}

		// ✅ 현재 그룹의 작업이 남아있으면 경고
		if (groupTasksCount > 0) {
			setIsInboundWarningOpen(true);
			return;
		}

		// 모두 완료되었으면 생산중 페이지로 이동
		navigate("/App/processing", {
			state: {
				selectedScenarioId,
			},
		});
	};

	const handleConfirmProductionCompletion = async () => {
		const blockingBatchId = readyData?.blockingProductionBatchId;
		if (!blockingBatchId || !pendingAction) {
			setIsProductionConfirmOpen(false);
			setPendingAction(null);
			return;
		}

		try {
			await completeBatch(blockingBatchId);
			setIsProductionConfirmOpen(false);
			const action = pendingAction;
			setPendingAction(null);
			action();
		} catch (err) {
			console.error("선행 생산 완료 처리 실패:", err);
			alert("이전 생산 완료 처리 중 오류가 발생했습니다.");
			setIsProductionConfirmOpen(false);
			setPendingAction(null);
		}
	};

	return (
		<div className="relative h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
			<App_Header showBackButton />

			<main
				className={`mx-auto flex h-[calc(100dvh-72px)] w-full max-w-md flex-col px-4 ${
					isOrderPopupOpen ? "blur-sm" : ""
				}`}
			>
				<div className="shrink-0 bg-[#f7f9fb] pt-3">
					<App_ProcessTabs activeKey="ready" className="mb-0" />

					<SummarySection
						className="mt-4 mb-4"
						progressPercent={progressPercent}
						remainingTaskCount={remainingTaskCount}
						remainingWorkTime="-"
					/>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto pb-8">
					{loading && (
						<div className="py-12 text-center text-sm text-slate-500">
							데이터를 불러오는 중...
						</div>
					)}

					{!loading &&
						allTasks.length === 0 &&
						(hiddenCurrentBatchTaskCount > 0 && !shouldShowInboundPrompt ? (
							<div className="rounded-2xl border border-indigo-100 bg-white px-5 py-6 text-center shadow-sm">
								<p className="text-sm font-semibold text-slate-700">
									현재 생산 중인 배치에 남은 작업이 있습니다.
								</p>
								<p className="mt-2 text-sm text-slate-500">
									{hiddenInboundTaskCount > 0
										? `적재 작업 ${hiddenInboundTaskCount}개가 남아 있어 생산 준비 목록에는 보이지 않습니다. 생산 중 탭에서 이어서 완료해주세요.`
										: `현재 생산 중 배치 작업 ${hiddenCurrentBatchTaskCount}개가 남아 있어 생산 준비 목록에는 아직 표시되지 않습니다.`}
								</p>
							</div>
						) : (
							<div className="py-12 text-center text-sm text-slate-500">
								준비 중인 작업이 없습니다.
							</div>
						))}

					{/* ✅ Tasks 또는 적재 섹션이 있으면 표시 (적재 전까지 버튼 유지) */}
					{!loading && (orderedEntries.length > 0 || shouldShowInboundPrompt) && (
						<div className="space-y-8 pb-2">
							{orderedEntries.map((entry) =>
								entry.kind === "task" ? (
									<div key={entry.id} className="mb-8">
										<TaskSection
											task={entry.task}
											activeActionKey={activeActionKey}
											onRelocateQrClick={handleRelocateQrClick}
											onPickingActionClick={handlePickingActionClick}
											onWorkOrderClick={handleWorkOrderClick}
										/>
									</div>
								) : shouldShowInboundPrompt ? (
									<InboundPromptCard
										key={entry.id}
										count={entry.count}
										groupTasksCount={0}
										onStartInbound={handleStartInbound}
									/>
								) : null,
							)}

							{shouldShowInboundPrompt &&
								!orderedEntries.some((entry) => entry.kind === "inbound") && (
									<InboundPromptCard
										count={hiddenInboundTaskCount}
										groupTasksCount={0}
										onStartInbound={handleStartInbound}
									/>
								)}
						</div>
					)}
				</div>
			</main>

			{isOrderPopupOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
					<div className="flex w-full max-w-sm flex-col items-center rounded-[2rem] bg-white p-8 shadow-2xl">
						<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#3F51B5]/10">
							<span
								className="material-symbols-outlined text-4xl text-[#3F51B5]"
								style={{ fontVariationSettings: '"FILL" 1' }}
							>
								info
							</span>
						</div>

						<h2 className="text-center text-2xl font-extrabold leading-tight text-slate-900">
							이전 작업을 먼저 진행해주세요
						</h2>
					</div>
				</div>
			)}

			{isProductionConfirmOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
					<div className="flex w-full max-w-sm flex-col items-center rounded-[2rem] bg-white p-8 shadow-2xl">
						<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
							<span
								className="material-symbols-outlined text-4xl text-amber-600"
								style={{ fontVariationSettings: '"FILL" 1' }}
							>
								help
							</span>
						</div>

						<h2 className="text-center text-xl font-extrabold leading-tight text-slate-900 mb-2">
							생산이 완료되었나요?
						</h2>
						<p className="text-center text-sm text-slate-600 mb-6">
							예를 누르면 이전 생산을 완료 처리하고<br />
							다음 작업을 진행합니다.
						</p>

						<div className="flex w-full gap-3">
							<button
								type="button"
								onClick={() => {
									setIsProductionConfirmOpen(false);
									setPendingAction(null);
								}}
								className="flex-1 rounded-lg bg-slate-200 px-4 py-2.5 font-bold text-slate-900 transition hover:bg-slate-300 active:scale-95"
							>
								아니오
							</button>
							<button
								type="button"
								onClick={handleConfirmProductionCompletion}
								className="flex-1 rounded-lg bg-[#3F51B5] px-4 py-2.5 font-bold text-white transition active:scale-95"
							>
								예
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ✅ 적재 작업 전 완료 확인 */}
			{isInboundWarningOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
					<div className="flex w-full max-w-sm flex-col items-center rounded-[2rem] bg-white p-8 shadow-2xl">
						<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
							<span
								className="material-symbols-outlined text-4xl text-red-600"
								style={{ fontVariationSettings: '"FILL" 1' }}
							>
								warning
							</span>
						</div>

						<h2 className="text-center text-xl font-extrabold leading-tight text-slate-900 mb-2">
							이전 작업을 완료해주세요
						</h2>
						<p className="text-center text-sm text-slate-600 mb-6">
							현재 그룹의 모든 작업을 완료한 후<br />
							적재 작업을 시작해주세요.
						</p>

						<button
							type="button"
							onClick={() => setIsInboundWarningOpen(false)}
							className="w-full rounded-lg bg-slate-200 px-4 py-2.5 font-bold text-slate-900 transition hover:bg-slate-300 active:scale-95"
						>
							확인
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default App_ReadyPage;
