import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import Web_ScenarioTaskTable from "../../../components/office/Web_ScenarioTaskTable/Web_ScenarioTaskTable";
import { getScenarioDetail } from "../../../services/scenarioService";
import { updateNcCode } from "../../../services/scenarioService";

function formatScenarioQr(item) {
	if (item?.qrCode) return item.qrCode;
	return "원자재";
}

function isPickingAction(action) {
	const raw = String(action ?? "").trim();
	return raw === "PICKING" || raw === "PICK" || raw === "피킹";
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

function mapBatchItemsToPickingRows(batchItems = []) {
	return batchItems
		.filter((item) => isPickingAction(item.batchItemAction))
		.map((item, index) => ({
			batchItemId: item.batchItemId,
			qrNumber: formatScenarioQr(item),
			thickness: item.thickness ?? "-",
			width: item.width ?? "-",
			length: item.length ?? "-",
			from: item.fromLocation || "-",
			to: item.toLocation || "-",
			ncCode: item.ncCode ?? "-",
			estimatedTime: String(
				item.expectedStartTime ?? item.expectedRunningTime ?? "-",
			),
		}));
}

function findMatchingBatchItem(batchItems = [], steelWipId) {
	return (
		batchItems.find(
			(item) =>
				isPickingAction(item.batchItemAction) &&
				Number(item.steelWipId) === Number(steelWipId),
		) ?? null
	);
}

function mapCraneScheduleToPickingRows(craneSchedule = [], batchItems = []) {
	return craneSchedule
		.filter((row) => String(row.action ?? "").trim() === "PICK")
		.map((row, index) => {
			const itemDetail = findMatchingBatchItem(batchItems, row.steelWipId);

			return {
				batchItemId: row.batchItemId ?? itemDetail?.batchItemId,
				qrNumber: row?.qrCode
					? formatScenarioQr(row)
					: formatScenarioQr(itemDetail ?? row),
				thickness: row?.thickness ?? itemDetail?.thickness ?? "-",
				width: row?.width ?? itemDetail?.width ?? "-",
				length: row?.length ?? itemDetail?.length ?? "-",
				from: mapLocationLabel(row.fromLocation ?? itemDetail?.fromLocation),
				to: mapLocationLabel(row.toLocation ?? itemDetail?.toLocation),
				ncCode: row?.ncCode ?? itemDetail?.ncCode ?? "-",
				estimatedTime: Number(row.eventMinute ?? 0).toFixed(2),
			};
		});
}

function getPickingRows(scenarioData) {
	const craneSchedule = scenarioData?.craneSchedule ?? [];
	const batchItems = scenarioData?.batchItems ?? [];

	if (
		craneSchedule.some((item) => String(item.action ?? "").trim() === "PICK")
	) {
		return mapCraneScheduleToPickingRows(craneSchedule, batchItems);
	}

	return mapBatchItemsToPickingRows(batchItems);
}

export default function Web_ScenarioReleaseNcCodePage() {
	const location = useLocation();
	const navigate = useNavigate();

	const scenarioId = location.state?.scenarioId ?? null;
	const projectInfo = location.state?.projectInfo ?? null;

	const [scenarioData, setScenarioData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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
			console.error("NC Code 목록 조회 실패:", err);
			setError("NC Code 목록을 불러오는 데 실패했습니다.");
		} finally {
			setLoading(false);
		}
	};
	// 핸들러 추가
	const handleNcCodeUpdate = async (batchItemId, newNcCode) => {
		try {
			await updateNcCode(scenarioId, batchItemId, newNcCode);
			// 수정 후 테이블 갱신
			await fetchScenarioDetail(scenarioId);
		} catch (err) {
			console.error("NC Code 수정 실패:", err);
			alert("NC Code 수정에 실패했습니다.");
		}
	};

	if (!scenarioId && !projectInfo) return null;

	const pickingRows = scenarioData ? getPickingRows(scenarioData) : [];

	const summary = {
		projectName: scenarioData?.projectTitle || projectInfo?.projectName || "-",
		productionPlanName:
			scenarioData?.scenarioTitle || projectInfo?.productionPlanName || "-",
		shipmentDate: scenarioData?.scenarioDue || projectInfo?.shipmentDate || "-",
		releaseDate: projectInfo?.releaseDate || "-",
		materialCount: projectInfo?.materialCount ?? "-",
	};

	return (
		<Web_AppLayout pageTitle="NC Code 목록">
			<div className="px-8 pb-12 pt-8">
				<div className="mb-8 flex items-end justify-between">
					<p className="font-headline text-lg font-bold tracking-tight text-on-surface">
						현장 전송 이력 &gt; NC Code 목록
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

				<section className="mb-8 rounded-xl border border-outline-variant/10 bg-white p-6 shadow-sm">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-5">
						<div>
							<p className="text-xs font-semibold text-on-surface-variant">
								프로젝트명
							</p>
							<p className="mt-1 text-sm font-bold text-on-surface">
								{summary.projectName}
							</p>
						</div>
						<div>
							<p className="text-xs font-semibold text-on-surface-variant">
								생산계획명
							</p>
							<p className="mt-1 text-sm font-bold text-on-surface">
								{summary.productionPlanName}
							</p>
						</div>
						<div>
							<p className="text-xs font-semibold text-on-surface-variant">
								시나리오 납기일
							</p>
							<p className="mt-1 text-sm font-bold text-on-surface">
								{summary.shipmentDate}
							</p>
						</div>
						<div>
							<p className="text-xs font-semibold text-on-surface-variant">
								현장 전송일
							</p>
							<p className="mt-1 text-sm font-bold text-on-surface">
								{summary.releaseDate}
							</p>
						</div>
						<div>
							<p className="text-xs font-semibold text-on-surface-variant">
								투입 자재 수
							</p>
							<p className="mt-1 text-sm font-bold text-primary">
								{summary.materialCount}
							</p>
						</div>
					</div>
				</section>

				{loading && (
					<div className="py-24 text-center text-sm text-on-surface-variant">
						NC Code 목록을 불러오는 중...
					</div>
				)}

				{error && !loading && (
					<div className="py-12 text-center text-sm text-red-500">{error}</div>
				)}

				{!loading && !error && (
					<>
						{pickingRows.length > 0 ? (
							<div className="relative">
								<div className="relative border-l-2 border-surface-container-highest pl-8">
									<div className="relative">
										<div className="absolute -left-[41px] top-0 h-4 w-4 rounded-full bg-red-500 ring-4 ring-surface" />

										<div className="mb-4 flex items-center gap-3">
											<h3 className="flex items-center gap-2 text-lg font-bold text-on-surface">
												<span className="material-symbols-outlined text-secondary">
													inventory
												</span>
												피킹 (Picking)
												<span className="text-xs font-medium text-on-surface-variant">
													{pickingRows.length}건
												</span>
											</h3>
										</div>

										<Web_ScenarioTaskTable
											rows={pickingRows}
											accentTextClass="text-secondary"
											timeHeaderLabel="예상 소요시간(분)"
											scenarioId={scenarioId} // ← 추가
											onNcCodeUpdate={handleNcCodeUpdate} // ← 추가
										/>
									</div>
								</div>
							</div>
						) : (
							<div className="rounded-xl bg-surface-container-lowest px-6 py-16 text-center shadow-sm">
								<p className="text-sm font-medium text-on-surface-variant">
									NC Code가 부여된 피킹 작업이 없습니다.
								</p>
							</div>
						)}
					</>
				)}
			</div>
		</Web_AppLayout>
	);
}
