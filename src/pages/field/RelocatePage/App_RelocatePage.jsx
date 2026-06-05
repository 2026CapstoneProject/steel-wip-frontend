import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_Header from "../../../components/field/Header/App_Header";
import { saveBatchItem } from "../../../services/fieldService";
import { formatFieldLocationLabel } from "../../../utils/App/locationLabel";

const fallbackRelocation = {
	id: "relocate-01",
	manufacturer: "유성 철주",
	material: "GS400",
	specText: "18 x 2,438 x 6,096",
	weightText: "6,300 kg",
	from: {
		zone: "Zone A-2",
	},
	to: {
		zone: "Zone B-1",
	},
};

const formatNowTime = () => {
	const now = new Date();
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
};

const InfoCard = ({ label, zone, time }) => {
	return (
		<div className="flex items-center gap-4 rounded-xl bg-slate-100 p-4">
			<div className="rounded-full bg-indigo-100 p-3">
				<span className="material-symbols-outlined text-[#24389c]">
					location_on
				</span>
			</div>

			<div>
				<p className="text-xs font-medium uppercase tracking-wider text-slate-500">
					{label}
				</p>
				<p className="text-base font-bold text-slate-900">
					{zone}
					{time ? (
						<span className="ml-3 text-xs font-normal text-slate-500">
							{time}
						</span>
					) : null}
				</p>
			</div>
		</div>
	);
};

const StepCircle = ({ type = "inactive" }) => {
	if (type === "done") {
		return (
			<div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#24389c]">
				<span
					className="material-symbols-outlined text-[14px] text-white"
					style={{ fontVariationSettings: '"FILL" 1' }}
				>
					check
				</span>
			</div>
		);
	}

	if (type === "active") {
		return (
			<div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#24389c] ring-4 ring-indigo-100">
				<span
					className="material-symbols-outlined text-[14px] text-white"
					style={{ fontVariationSettings: '"FILL" 1' }}
				>
					check
				</span>
			</div>
		);
	}

	return (
		<div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100">
			<span className="material-symbols-outlined text-[14px] text-slate-500">
				inventory_2
			</span>
		</div>
	);
};

const App_RelocatePage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const processedScanKeyRef = useRef("");

	// state 없이 직접 접근 시 Ready 페이지로 리다이렉트
	useEffect(() => {
		if (!location.state?.relocation) {
			navigate("/App/ready", { replace: true });
		}
	}, []);

	const relocation = location.state?.relocation ?? fallbackRelocation;
	const toZone = String(relocation.to?.zone || relocation.toZone || "").trim().toUpperCase();

	const isVirtualBufferTarget = toZone === "BUF-1";
	// ✅ S로 시작하는 설비인지 확인
	const isEquipmentTarget = toZone.startsWith("S");

	const [scanState, setScanState] = useState({
		wipScanned: location.state?.scanState?.wipScanned ?? false,
		zoneScanned: location.state?.scanState?.zoneScanned ?? false,
		wipScannedAt: location.state?.scanState?.wipScannedAt ?? "",
		zoneScannedAt: location.state?.scanState?.zoneScannedAt ?? "",
		wipScannedValue: location.state?.scanState?.wipScannedValue ?? "",
		zoneScannedValue: location.state?.scanState?.zoneScannedValue ?? "",
	});

	const [isSavePopupOpen, setIsSavePopupOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	// ✅ 설비 올림 확인 팝업
	const [isEquipmentConfirmOpen, setIsEquipmentConfirmOpen] = useState(false);

	// QR 스캔 후 돌아올 때 location.state가 덮어씌워지므로
	// 첫 마운트 시 batchItemId를 useState로 한 번만 고정 보관
	const [batchItemId] = useState(() => location.state?.batchItemId);

	const isStarted = scanState.wipScanned;
	const isCompleted = scanState.wipScanned && scanState.zoneScanned;
	const isExitLocked = scanState.wipScanned || scanState.zoneScanned;

	const isWipScanEnabled = !scanState.wipScanned;
	const isZoneScanEnabled =
		!isVirtualBufferTarget && scanState.wipScanned && !scanState.zoneScanned;
	const isSaveEnabled = isCompleted;

	const statusText = isCompleted
		? "이동 완료"
		: isStarted
			? "이동 중"
			: "이동 전";

	const statusClassName = isCompleted
		? "bg-indigo-100 text-[#24389c]"
		: isStarted
			? "bg-indigo-100 text-[#24389c]"
			: "bg-slate-200 text-slate-500";

	const progressWidth = isCompleted ? "100%" : isStarted ? "66.6667%" : "0%";

	useEffect(() => {
		if (!isSavePopupOpen) return;

		const timer = window.setTimeout(() => {
			navigate("/App/ready");
		}, 1200);

		return () => window.clearTimeout(timer);
	}, [isSavePopupOpen, navigate]);

	useEffect(() => {
		const returnedState = location.state;
		if (!returnedState?.type) return;

		const currentKey = `${location.key}-${returnedState.type}-${returnedState.scannedAt || ""}`;
		if (processedScanKeyRef.current === currentKey) return;
		processedScanKeyRef.current = currentKey;

		if (returnedState.type === "RELOCATE_WIP_SCAN_SUCCESS") {
			setScanState((prev) => ({
				...prev,
				wipScanned: true,
				wipScannedAt:
					prev.wipScannedAt || returnedState.scannedAt || formatNowTime(),
				wipScannedValue:
					returnedState.scannedValue ?? prev.wipScannedValue ?? "",
			}));
			return;
		}

		if (returnedState.type === "RELOCATE_ZONE_SCAN_SUCCESS") {
			setScanState((prev) => ({
				...prev,
				zoneScanned: true,
				zoneScannedAt:
					prev.zoneScannedAt || returnedState.scannedAt || formatNowTime(),
				zoneScannedValue:
					returnedState.scannedValue ?? prev.zoneScannedValue ?? "",
			}));
		}
	}, [location.key, location.state]);

	const handlePrevClick = () => {
		if (isExitLocked) return;
		navigate(-1);
	};

	const handleWipScanClick = () => {
		if (!isWipScanEnabled) return;

		navigate("/App/ready/relocate/qr/wip", {
			state: { batchItemId, relocation, scanState },
		});
	};

	const handleZoneScanClick = () => {
		if (!isZoneScanEnabled) return;

		navigate("/App/ready/relocate/qr/zone", {
			state: { batchItemId, relocation, scanState },
		});
	};

	const handleVirtualBufferConfirm = () => {
		if (!scanState.wipScanned || scanState.zoneScanned) return;
		setScanState((prev) => ({
			...prev,
			zoneScanned: true,
			zoneScannedAt: prev.zoneScannedAt || formatNowTime(),
			zoneScannedValue: "BUF-1",
		}));
	};

	// ✅ 설비 위에 올렸는지 확인 핸들러
	const handleEquipmentConfirm = () => {
		if (!scanState.wipScanned || scanState.zoneScanned) return;
		setIsEquipmentConfirmOpen(true);
	};

	// ✅ 설비 올림 확인 후 저장
	const handleEquipmentConfirmYes = () => {
		setScanState((prev) => ({
			...prev,
			zoneScanned: true,
			zoneScannedAt: prev.zoneScannedAt || formatNowTime(),
			zoneScannedValue: toZone,
		}));
		setIsEquipmentConfirmOpen(false);
	};

	const handleSaveClick = async () => {
		if (!isSaveEnabled || isSaving) return;

		if (!batchItemId) {
			alert("작업 정보를 찾을 수 없어 완료 처리할 수 없습니다.");
			return;
		}

		const wipQR = String(scanState.wipScannedValue ?? "").trim();
		const locQR = String(scanState.zoneScannedValue ?? "").trim();

		if (!wipQR) {
			alert("재공품 QR 스캔값이 없습니다.");
			return;
		}

		if (!locQR && !isVirtualBufferTarget) {
			alert("구역 QR 스캔값이 없습니다.");
			return;
		}

		const payload = {
			wipQR,
			...(locQR ? { locQR } : {}),
		};

		setIsSaving(true);

		try {
			const response = await saveBatchItem(batchItemId, payload);

			console.log("작업 완료 처리 성공:", response?.data);
			setIsSavePopupOpen(true);
		} catch (err) {
			console.error("작업 완료 처리 실패:", err);

			const errorMessage =
				err?.response?.data?.detail ||
				err?.response?.data?.message ||
				"작업 완료 처리에 실패했습니다.";

			alert(errorMessage);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="relative h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
			<App_Header />

			{isExitLocked && (
				<div
					className="pointer-events-none fixed left-1/2 top-0 z-[60] h-[72px] w-full max-w-md -translate-x-1/2"
					aria-hidden="true"
				>
					<div className="pointer-events-auto h-full w-[180px]" />
				</div>
			)}

			<main
				className={`mx-auto flex h-[calc(100dvh-72px)] w-full max-w-md flex-col ${
					isSavePopupOpen ? "blur-sm" : ""
				}`}
			>
				<div className="min-h-0 flex-1 overflow-y-auto px-6 pb-28 pt-10">
					<div className="flex flex-col gap-6 pb-6">
						<section>
							<div className="mb-3 flex items-center justify-between">
								<h2 className="text-lg font-bold text-slate-900">
									재공품 상세 정보
								</h2>
							</div>

							<div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(25,28,30,0.04)]">
								<div className="grid grid-cols-2 gap-y-4">
									<div>
										<p className="mb-1 text-xs font-medium text-slate-500">
											제조사
										</p>
										<p className="font-semibold text-slate-900">
											{relocation.manufacturer}
										</p>
									</div>

									<div>
										<p className="mb-1 text-xs font-medium text-slate-500">
											재질
										</p>
										<p className="font-semibold text-slate-900">
											{relocation.material}
										</p>
									</div>

									<div className="col-span-2 pt-2">
										<p className="mb-1 text-xs font-medium text-slate-500">
											규격 (두께 x 폭 x 길이)
										</p>
										<p className="text-lg font-bold text-[#24389c]">
											{relocation.specText}
										</p>
									</div>

									<div>
										<p className="mb-1 text-xs font-medium text-slate-500">
											중량
										</p>
										<p className="font-semibold text-slate-900">
											{relocation.weightText}
										</p>
									</div>
									<div>
										<p className="mb-1 text-xs font-medium text-slate-500">
											QR
										</p>
										<p className="font-semibold text-slate-900">
											{relocation.wipQr}
										</p>
									</div>
								</div>
							</div>
						</section>

						<section className="space-y-3">
							<InfoCard
								label="FROM"
								zone={formatFieldLocationLabel(relocation.from?.zone)}
								time={scanState.wipScannedAt}
							/>
							<InfoCard
								label="TO"
								zone={formatFieldLocationLabel(relocation.to?.zone)}
								time={scanState.zoneScannedAt}
							/>
						</section>

						<section className="flex flex-col items-center py-2">
							<div className="relative mb-6 flex h-1 w-full max-w-xs items-center rounded-full bg-slate-200">
								<div
									className="absolute left-0 top-0 h-full rounded-full bg-[#24389c] transition-all"
									style={{ width: progressWidth }}
								/>
								<div className="absolute inset-0 flex items-center justify-between">
									<StepCircle type="done" />
									<StepCircle
										type={
											isCompleted ? "done" : isStarted ? "active" : "inactive"
										}
									/>
									<StepCircle type={isCompleted ? "done" : "inactive"} />
								</div>
							</div>

							<p
								className={`rounded-full px-4 py-1 text-sm font-bold ${statusClassName}`}
							>
								{statusText}
							</p>
						</section>

						<section className="space-y-4">
							<div className="rounded-2xl bg-white p-8 text-center shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
								<div className="relative mx-auto mb-6 flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
									<span className="material-symbols-outlined text-5xl text-[#24389c]/30">
										qr_code_2
									</span>

									<div className="absolute left-6 top-6 h-8 w-8 rounded-tl-sm border-l-2 border-t-2 border-[#24389c]/40" />
									<div className="absolute right-6 top-6 h-8 w-8 rounded-tr-sm border-r-2 border-t-2 border-[#24389c]/40" />
									<div className="absolute bottom-6 left-6 h-8 w-8 rounded-bl-sm border-b-2 border-l-2 border-[#24389c]/40" />
									<div className="absolute bottom-6 right-6 h-8 w-8 rounded-br-sm border-b-2 border-r-2 border-[#24389c]/40" />
									<div className="absolute inset-x-10 top-1/2 h-px bg-[#24389c]/20" />
								</div>

								<div className="space-y-3">
									<button
										type="button"
										onClick={handleWipScanClick}
										disabled={!isWipScanEnabled}
										className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold transition ${
											isWipScanEnabled
												? "bg-gradient-to-br from-[#24389c] to-[#3f51b5] text-white shadow-lg shadow-indigo-200 active:scale-95"
												: "cursor-not-allowed bg-slate-200 text-slate-400"
										}`}
									>
										<span className="material-symbols-outlined">
											center_focus_weak
										</span>
										재공품 scan
									</button>

									<button
										type="button"
										onClick={
											isEquipmentTarget
												? handleEquipmentConfirm
												: isVirtualBufferTarget
													? handleVirtualBufferConfirm
													: handleZoneScanClick
										}
										disabled={
											isEquipmentTarget
												? !scanState.wipScanned || scanState.zoneScanned
												: isVirtualBufferTarget
													? !scanState.wipScanned || scanState.zoneScanned
													: !isZoneScanEnabled
										}
										className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold transition ${
											(isEquipmentTarget
												? scanState.wipScanned && !scanState.zoneScanned
												: isVirtualBufferTarget
													? scanState.wipScanned && !scanState.zoneScanned
													: isZoneScanEnabled)
												? "bg-gradient-to-br from-[#24389c] to-[#3f51b5] text-white shadow-lg shadow-indigo-200 active:scale-95"
												: "cursor-not-allowed bg-slate-200 text-slate-400"
										}`}
									>
										<span className="material-symbols-outlined">
											{isEquipmentTarget
												? "inventory_2"
												: isVirtualBufferTarget
													? "check_circle"
													: "center_focus_weak"}
										</span>
										{isEquipmentTarget
											? "설비에 올림"
											: isVirtualBufferTarget
												? "임시이동 완료 확인"
												: "구역 scan"}
									</button>
								</div>
							</div>

							<div className="flex justify-end">
								<button
									type="button"
									onClick={handleSaveClick}
									disabled={!isSaveEnabled}
									className={`flex items-center gap-2 rounded-xl px-10 py-4 font-bold transition ${
										isSaveEnabled
											? "bg-[#1a237e] text-white shadow-lg active:scale-95"
											: "cursor-not-allowed bg-slate-200 text-slate-400"
									}`}
								>
									<span className="material-symbols-outlined">save</span>
									저장
								</button>
							</div>
						</section>
					</div>
				</div>
			</main>

			<nav
				className={`fixed bottom-0 left-0 z-40 flex w-full flex-col items-center rounded-t-xl bg-white shadow-[0_-4px_20px_rgba(25,28,30,0.06)] ${
					isSavePopupOpen ? "blur-sm" : ""
				}`}
			>
				<button
					type="button"
					onClick={handlePrevClick}
					className="mx-6 my-4 flex w-[calc(100%-3rem)] items-center justify-center gap-2 rounded-xl bg-indigo-100 py-4 text-sm font-semibold uppercase tracking-wider text-[#24389c] transition active:translate-y-0.5"
				>
					<span className="material-symbols-outlined">arrow_back</span>
					Previous
				</button>
			</nav>

			{/* ✅ 설비 올림 확인 팝업 */}
			{isEquipmentConfirmOpen && (
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
							설비 위에 올렸습니까?
						</h2>
						<p className="text-center text-sm text-slate-600 mb-6">
							재공품을{" "}
							<span className="font-bold text-amber-600">
								{formatFieldLocationLabel(toZone)}
							</span>{" "}
							위에 올렸다면
							<br />
							확인 버튼을 눌러주세요.
						</p>

						<div className="flex w-full gap-3">
							<button
								type="button"
								onClick={() => setIsEquipmentConfirmOpen(false)}
								className="flex-1 rounded-lg bg-slate-200 px-4 py-3 font-bold text-slate-900 transition hover:bg-slate-300 active:scale-95"
							>
								취소
							</button>
							<button
								type="button"
								onClick={handleEquipmentConfirmYes}
								className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-bold text-white transition hover:shadow-lg active:scale-95"
							>
								확인
							</button>
						</div>
					</div>
				</div>
			)}

			{isSavePopupOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
					<div className="flex w-full max-w-sm flex-col items-center rounded-[2rem] bg-white p-8 shadow-2xl">
						<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#3F51B5]/10">
							<span
								className="material-symbols-outlined text-4xl text-[#3F51B5]"
								style={{ fontVariationSettings: '"FILL" 1' }}
							>
								check_circle
							</span>
						</div>

						<h2 className="text-center text-2xl font-extrabold leading-tight text-slate-900">
							이동이 완료되었습니다
						</h2>
					</div>
				</div>
			)}
		</div>
	);
};

export default App_RelocatePage;
