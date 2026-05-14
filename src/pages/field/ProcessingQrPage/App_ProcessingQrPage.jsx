import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_Header from "../../../components/field/Header/App_Header";
import QrCameraScanner from "../../../components/field/Qr/QrCameraScanner";
import App_ScanIssue from "../../../components/modal/App_ScanIssue/App_ScanIssue";

const MOVE_NEXT_DELAY_MS = 250;

const getItemMaterial = (item) =>
	item?.material || item?.materialName || item?.inputMaterialName || "-";

const getItemSpecText = (item) =>
	item?.specText || item?.spec || item?.sizeText || item?.title || "-";

const getItemWeightText = (item) =>
	item?.weightText || item?.weight || item?.weightLabel || "-";

const getItemZone = (item) =>
	item?.zone || item?.toLocation || item?.toZone || "-";

const getItemQrNumber = (item) => {
	const qr = String(item?.wipQr || item?.qr || item?.qrCode || "").trim();
	return qr || "-";
};

const App_ProcessingQrPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const moveTimerRef = useRef(null);

	React.useEffect(() => {
		if (!location.state?.generatedItems) {
			navigate("/App/processing", { replace: true });
		}
	}, [location.state, navigate]);

	const {
		generatedItems = [],
		batches = [],
		summary = {},
	} = location.state ?? {};

	const pendingItems = useMemo(
		() => generatedItems.filter((item) => item.status !== "complete"),
		[generatedItems],
	);

	const [scanStatus, setScanStatus] = useState("idle");
	const [scanError, setScanError] = useState("");
	const [isIssueListOpen, setIsIssueListOpen] = useState(false);
	const [selectedIssueItem, setSelectedIssueItem] = useState(null);
	const [isScanIssueOpen, setIsScanIssueOpen] = useState(false);

	const moveToNextPage = (item, decodedText) => {
		navigate("/App/processing/qr/wip", {
			state: {
				generatedWip: {
					...item,
					scanCompletedAt: new Date().toISOString(),
				},
				generatedItems,
				batches,
				summary,
				scannedWipQr: decodedText,
				wipScannedAt: new Date().toISOString(),
			},
			replace: true,
		});
	};

	const handleScanSuccess = (decodedText) => {
		if (scanStatus === "recognized") return;

		const normalized = String(decodedText ?? "").trim();
		const matchedItem = pendingItems.find(
			(item) => String(item.wipQr ?? "").trim() === normalized,
		);

		if (!matchedItem) {
			setScanError("예정된 발생 재공품과 일치하지 않는 QR입니다.");
			return;
		}

		setScanError("");
		setScanStatus("recognized");

		if (moveTimerRef.current) {
			window.clearTimeout(moveTimerRef.current);
		}

		moveTimerRef.current = window.setTimeout(() => {
			moveToNextPage(matchedItem, normalized);
		}, MOVE_NEXT_DELAY_MS);
	};

	const handleIssueListClick = () => {
		setScanError("");
		setIsIssueListOpen((prev) => !prev);
	};

	const handleSelectIssueItem = (item) => {
		setScanError("");
		setSelectedIssueItem(item);
	};

	const handleOpenScanIssuePopup = () => {
		if (!selectedIssueItem) {
			setScanError("재공품을 먼저 선택해주세요.");
			return;
		}

		setScanError("");
		setIsScanIssueOpen(true);
	};

	const handleScanIssueConfirm = () => {
		const expectedWipQr = String(selectedIssueItem?.wipQr ?? "").trim();

		if (!expectedWipQr) {
			setIsScanIssueOpen(false);
			setScanError("선택한 재공품 QR 값이 없습니다.");
			return;
		}

		setIsScanIssueOpen(false);
		setScanStatus("recognized");

		if (moveTimerRef.current) {
			window.clearTimeout(moveTimerRef.current);
		}

		moveTimerRef.current = window.setTimeout(() => {
			moveToNextPage(selectedIssueItem, expectedWipQr);
		}, MOVE_NEXT_DELAY_MS);
	};

	const handlePrevious = () => {
		if (moveTimerRef.current) {
			window.clearTimeout(moveTimerRef.current);
		}
		navigate(-1);
	};

	return (
		<div className="h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
			<App_Header />

			<main className="mx-auto flex h-[calc(100dvh-72px)] w-full max-w-md flex-col">
				<div className="min-h-0 flex-1 overflow-y-auto px-6 pt-12 pb-28">
					<div className="flex flex-col items-center space-y-10">
						<div className="space-y-4 text-center">
							<h1 className="text-[32px] font-extrabold tracking-tight text-slate-900">
								재공품 스캔
							</h1>
						</div>

						<QrCameraScanner
							onScanSuccess={handleScanSuccess}
							paused={scanStatus === "recognized" || isScanIssueOpen}
						/>

						<div className="w-full space-y-3">
							<div className="flex w-full items-start gap-4 rounded-xl border-l-4 border-[#3F51B5] bg-white p-5 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)]">
								<div className="rounded-lg bg-[#3F51B5]/20 p-2">
									<span className="material-symbols-outlined text-2xl text-[#24389C]">
										qr_code_2
									</span>
								</div>

								<div className="space-y-1">
									<p className="text-base font-bold text-slate-900">
										QR 코드를 중앙에 맞춰주세요
									</p>

									<div className="space-y-0.5">
										<p className="text-sm leading-relaxed text-slate-500">
											인식이 완료되면 자동으로 다음 단계로 넘어갑니다.
										</p>

										<button
											type="button"
											onClick={handleIssueListClick}
											className="block text-left text-sm font-medium leading-relaxed text-slate-500 underline underline-offset-2 decoration-slate-400"
										>
											QR 인식에 문제가 있나요?
										</button>
									</div>

									{scanError ? (
										<p className="pt-1 text-sm font-semibold text-red-600">
											{scanError}
										</p>
									) : null}

									{pendingItems.length === 0 ? (
										<p className="pt-1 text-sm font-semibold text-slate-500">
											스캔할 재공품이 없습니다.
										</p>
									) : null}
								</div>
							</div>

							{isIssueListOpen ? (
								<section className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_12px_24px_-10px_rgba(0,0,0,0.08)]">
									<div className="border-b border-slate-100 px-5 py-4">
										<p className="text-base font-extrabold text-slate-900">
											발생 재공품 선택
										</p>
										<p className="mt-1 text-xs leading-relaxed text-slate-500">
											스캔하려는 재공품을 선택한 뒤 확인을 눌러주세요.
										</p>
									</div>

									<div>
										{pendingItems.length === 0 ? (
											<p className="px-5 py-5 text-sm font-medium text-slate-500">
												발생되는 재공품이 없습니다.
											</p>
										) : (
											pendingItems.map((item, index) => {
												const isSelected =
													Boolean(selectedIssueItem) &&
													(selectedIssueItem?.id === item.id ||
														selectedIssueItem?.wipQr === item.wipQr);

												return (
													<button
														key={item.id || item.wipQr || index}
														type="button"
														onClick={() => handleSelectIssueItem(item)}
														className={`flex w-full items-center gap-4 px-5 py-4 text-left transition active:bg-slate-50 ${
															index !== pendingItems.length - 1
																? "border-b border-slate-100"
																: ""
														}`}
													>
														<div
															className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
																isSelected
																	? "border-[#3F51B5]"
																	: "border-slate-300"
															}`}
														>
															{isSelected ? (
																<div className="h-2.5 w-2.5 rounded-full bg-[#3F51B5]" />
															) : null}
														</div>

														<div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4">
															<div className="min-w-0">
																<p className="truncate text-[15px] font-extrabold text-slate-900">
																	{getItemMaterial(item)}
																</p>
																<p className="mt-1 truncate text-xs font-semibold text-slate-500">
																	{getItemSpecText(item)}
																</p>
															</div>

															<div className="min-w-0 text-right">
																<p className="truncate text-sm font-bold text-[#3F51B5]">
																	적재 위치 {getItemZone(item)}
																</p>
																<p className="mt-1 truncate text-xs font-semibold text-slate-400">
																	{getItemQrNumber(item)}
																</p>
															</div>
														</div>
													</button>
												);
											})
										)}
									</div>

									<div className="border-t border-slate-100 px-5 py-4">
										<button
											type="button"
											onClick={handleOpenScanIssuePopup}
											disabled={!selectedIssueItem}
											className={`flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold transition active:scale-95 ${
												selectedIssueItem
													? "bg-[#24389C] text-white shadow-lg shadow-[#24389C]/20"
													: "cursor-not-allowed bg-slate-100 text-slate-400"
											}`}
										>
											확인
										</button>
									</div>
								</section>
							) : null}
						</div>
					</div>
				</div>
			</main>

			<nav className="fixed bottom-0 left-0 z-50 flex w-full flex-col items-center rounded-t-xl bg-white shadow-[0_-4px_20px_rgba(25,28,30,0.06)]">
				<button
					type="button"
					onClick={handlePrevious}
					className="mx-6 my-4 flex w-[calc(100%-3rem)] items-center justify-center gap-2 rounded-xl bg-[#24389C]/10 py-4 text-sm font-semibold uppercase tracking-wider text-[#24389C] transition-all active:translate-y-0.5"
				>
					<span className="material-symbols-outlined">arrow_back</span>
					Previous
				</button>
			</nav>

			<App_ScanIssue
				isOpen={isScanIssueOpen}
				title="발생 재공품 정보 확인"
				description="선택한 재공품 정보와 상세 정보가 맞나요?"
				details={[
					{ label: "제조사", value: selectedIssueItem?.manufacturer || "-" },
					{ label: "재질", value: getItemMaterial(selectedIssueItem) },
					{ label: "규격", value: getItemSpecText(selectedIssueItem) },
					{ label: "중량", value: getItemWeightText(selectedIssueItem) },
					{ label: "QR", value: getItemQrNumber(selectedIssueItem) },
					{ label: "적재 위치", value: getItemZone(selectedIssueItem) },
				]}
				onCancel={() => setIsScanIssueOpen(false)}
				onConfirm={handleScanIssueConfirm}
			/>
		</div>
	);
};

export default App_ProcessingQrPage;