import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import App_ProcessTabs from "../../../components/field/ProcessTabs/App_ProcessTabs";
import App_Header from "../../../components/field/Header/App_Header";
import workOrderPdf from "../../../assets/Steel_all_Work_instruction.pdf";
import { getFieldEnd } from "../../../services/fieldService";
import {
	getSelectedFieldScenarioId,
	setSelectedFieldScenarioId,
} from "../../../utils/App/selectedScenario";

// ─── 날짜 포맷 헬퍼 ──────────────────────────────────────────────
const formatSummaryDate = () => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}.${month}.${day}`;
};

// ─── 백엔드 FieldEndData → UI tasks 변환 ─────────────────────────
// 생산 준비 페이지와 동일하게 relocation + picking만 표시
function mapEndDataToTasks(endDataList) {
	const tasks = [];

	(endDataList ?? []).forEach((endData) => {
		(endData.batch ?? []).forEach((group, groupIdx) => {
			const relocations = (group.relocation ?? []).map((item, rIdx) => ({
				id: String(item.batchItemId),
				title: `Relocate ${rIdx + 1}`,
				materialName: item.material || "-",
				manufacturer: item.manufacturer || "-",
				specText: item.specText || "-",
				weightText: item.weightText || "-",
				wipQr: item.wipQr || "-",
				fromZone: item.fromLocationName || "-",
				toZone: item.toLocationName || "-",
				duration: item.expectedRunningTime
					? `${item.expectedRunningTime}m`
					: null,
			}));

			const pickings = (group.picking ?? []).map((item, pIdx) => {
				const isRaw = !item.wipId || item.wipId === 0;

				return {
					id: String(item.batchItemId),
					title: `Picking ${pIdx + 1}`,
					type: isRaw ? "원자재" : "재공품",
					materialName: item.material || "-",
					manufacturer: item.manufacturer || "-",
					specText: item.specText || "-",
					weightText: item.weightText || "-",
					wipQr: item.wipQr || "-",
					infoLabel: isRaw ? "두께×폭x길이" : "현재 위치",
					infoValue: isRaw
						? item.thickness && item.width && item.height
							? `${item.thickness} × ${item.width} × ${item.height}`
							: item.specText || "-"
						: item.fromLocationName || "-",
					duration: item.expectedRunningTime
						? `${item.expectedRunningTime}m`
						: null,
				};
			});
			const inbounds = (group.inbound ?? []).map((item, iIdx) => ({
				id: String(item.batchItemId),
				title: `Inbound ${iIdx + 1}`,
				materialName: item.material || "-",
				manufacturer: item.manufacturer || "-",
				specText: item.specText || "-",
				weightText: item.weightText || "-",
				wipQr: item.wipQr || "-",
				toZone: item.toLocationName || "-",
				duration: item.expectedRunningTime
					? `${item.expectedRunningTime}m`
					: null,
			}));
			if (relocations.length === 0 && pickings.length === 0) return;

			tasks.push({
				id: `batch-group-${groupIdx}`,
				title: `Task ${String(groupIdx + 1).padStart(2, "0")}`,
				relocations,
				pickings,
			});
		});
	});

	return tasks;
}

// ─── 서브 컴포넌트 ──────────────────────────────────────────────

const SummarySection = ({ summaryDate, progressPercent }) => (
	<section className="mt-4 mb-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
		<div className="flex flex-col gap-1.5">
			<p className="text-[12px] font-medium text-slate-500">{summaryDate}</p>
			<h2 className="text-lg font-extrabold text-slate-900">작업 완료</h2>

			<div className="mt-1.5 flex items-center gap-3">
				<div className="h-3 flex-1 overflow-hidden rounded-full bg-indigo-100">
					<div
						className="h-full rounded-full bg-[#3F51B5]"
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
				<span className="min-w-[40px] text-right text-lg font-extrabold text-indigo-700">
					{progressPercent}%
				</span>
			</div>
		</div>
	</section>
);

const EndRelocateCard = ({ item }) => (
	<div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
		<div className="mb-3 flex items-start justify-between">
			<div>
				<h3 className="text-sm font-bold text-indigo-700">
					{item.materialName} · {item.manufacturer}
				</h3>
				<span className="text-xs font-semibold text-slate-700">
					{item.specText} | {item.wipQr}
				</span>
				<div className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
					<span>{item.fromZone}</span>
					<span>→</span>
					<span>{item.toZone}</span>
				</div>
			</div>

			{item.duration ? (
				<div className="flex items-center gap-1.5 text-[12px] text-slate-400">
					<span className="material-symbols-outlined text-[18px] leading-none">
						schedule
					</span>
					<span>{item.duration}</span>
				</div>
			) : null}
		</div>
	</div>
);

const EndPickingCard = ({ item, onWorkOrderClick }) => (
	<div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
		<div className="flex items-start justify-between gap-3">
			<div>
				<div className="mb-2 flex items-center gap-2">
					<h3 className="text-[15px] font-extrabold text-slate-900">
						{item.title}
					</h3>

					<span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
						{item.type}
					</span>
				</div>

				<p className="mb-1 text-sm font-bold text-slate-900">
					{item.materialName} · {item.manufacturer}
					<br />
					<span className="text-xs font-semibold text-slate-700">
						{item.specText} | {item.wipQr}
					</span>
				</p>

				<div className="flex items-center gap-1.5">
					<span className="text-[11px] font-medium text-slate-500">
						{item.infoLabel}
					</span>
					<span className="text-[12px] font-bold text-indigo-700">
						{item.infoValue}
					</span>
				</div>
			</div>

			<div className="flex shrink-0 flex-col items-end gap-2">
				{item.duration ? (
					<div className="flex items-center gap-1 text-slate-400">
						<span className="material-symbols-outlined text-xs">schedule</span>
						<span className="text-[11px]">{item.duration}</span>
					</div>
				) : null}

				<button
					type="button"
					onClick={() => onWorkOrderClick(item)}
					className="p-1"
				>
					<span className="material-symbols-outlined text-2xl text-slate-500">
						description
					</span>
				</button>
			</div>
		</div>
	</div>
);

const CompletedTaskCard = ({ task, isOpen, onToggle, onWorkOrderClick }) => {
	const relocations = Array.isArray(task?.relocations) ? task.relocations : [];
	const pickings = Array.isArray(task?.pickings) ? task.pickings : [];

	return (
		<div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between px-5 py-4 text-left"
			>
				<div className="flex items-center gap-2">
					<div className="h-5 w-1.5 rounded-full bg-indigo-700" />
					<h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
				</div>

				<span
					className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${
						isOpen ? "rotate-180" : ""
					}`}
				>
					expand_more
				</span>
			</button>

			{isOpen ? (
				<div className="space-y-3 px-5 pb-5">
					{relocations.map((item) => (
						<EndRelocateCard key={item.id} item={item} />
					))}

					{pickings.map((item) => (
						<EndPickingCard
							key={item.id}
							item={item}
							onWorkOrderClick={onWorkOrderClick}
						/>
					))}
				</div>
			) : null}
		</div>
	);
};

const EmptyCompletedTaskState = () => (
	<div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
		<p className="text-sm font-medium text-slate-500">
			완료된 작업이 없습니다.
		</p>
	</div>
);

// ─── 메인 컴포넌트 ──────────────────────────────────────────────

const App_EndPage = () => {
	const location = useLocation();

	const selectedScenarioId =
		location.state?.selectedScenarioId ?? getSelectedFieldScenarioId();

	const [tasks, setTasks] = useState([]);
	const [progressPercent, setProgressPercent] = useState(0);
	const [loading, setLoading] = useState(true);
	const [openTaskIds, setOpenTaskIds] = useState([]);

	const summaryDate = formatSummaryDate();

	useEffect(() => {
		if (location.state?.selectedScenarioId) {
			setSelectedFieldScenarioId(location.state.selectedScenarioId);
		}
	}, [location.state]);

	useEffect(() => {
		fetchEndData();
	}, [selectedScenarioId]);

	const fetchEndData = async () => {
		setLoading(true);

		try {
			const response = await getFieldEnd();
			const endDataList = response.data?.data ?? [];

			const matchedData =
				endDataList.find((item) => item.scenarioId === selectedScenarioId) ??
				endDataList[0] ??
				null;

			if (matchedData?.scenarioId) {
				setSelectedFieldScenarioId(matchedData.scenarioId);
			}

			const mappedTasks = mapEndDataToTasks(matchedData ? [matchedData] : []);
			setTasks(mappedTasks);

			if (matchedData) {
				setProgressPercent(
					Math.round((matchedData.scenarioProgressRate ?? 0) * 100),
				);
			} else {
				setProgressPercent(0);
			}

			if (mappedTasks.length > 0) {
				setOpenTaskIds([mappedTasks[0].id]);
			} else {
				setOpenTaskIds([]);
			}
		} catch (err) {
			console.error("작업 완료 데이터 조회 실패:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleTask = (taskId) => {
		setOpenTaskIds((prev) =>
			prev.includes(taskId)
				? prev.filter((id) => id !== taskId)
				: [...prev, taskId],
		);
	};

	const handleWorkOrderClick = () => {
		window.open(workOrderPdf, "_self");
	};

	return (
		<div className="h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
			<App_Header />

			<main className="mx-auto flex h-[calc(100dvh-72px)] w-full max-w-md flex-col px-4">
				<div className="shrink-0 bg-[#f7f9fb] pt-3">
					<App_ProcessTabs activeKey="end" className="mb-0" />
					<SummarySection
						summaryDate={summaryDate}
						progressPercent={progressPercent}
					/>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto pb-8">
					{loading ? (
						<div className="py-12 text-center text-sm text-slate-500">
							데이터를 불러오는 중...
						</div>
					) : (
						<div className="space-y-4 pb-2">
							{tasks.length > 0 ? (
								tasks.map((task) => (
									<CompletedTaskCard
										key={task.id}
										task={task}
										isOpen={openTaskIds.includes(task.id)}
										onToggle={() => handleToggleTask(task.id)}
										onWorkOrderClick={handleWorkOrderClick}
									/>
								))
							) : (
								<EmptyCompletedTaskState />
							)}
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default App_EndPage;
