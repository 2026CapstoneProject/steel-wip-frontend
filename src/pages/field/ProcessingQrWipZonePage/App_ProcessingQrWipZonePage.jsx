import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_Header from "../../../components/field/Header/App_Header";
import QrCameraScanner from "../../../components/field/Qr/QrCameraScanner";
import App_ScanIssue from "../../../components/modal/App_ScanIssue/App_ScanIssue";
import {
	getFieldQrFlowState,
	setFieldQrFlowState,
} from "../../../utils/App/fieldQrFlow";
import { formatFieldLocationLabel } from "../../../utils/App/locationLabel";

const PROCESSING_ZONE_QR_CACHE_KEY = "processing-zone-qr";

const getTargetZone = (generatedWip = {}) =>
	formatFieldLocationLabel(
		generatedWip.zone ?? generatedWip.toZone ?? generatedWip.toLocation ?? "-",
	);

const getTargetZoneQr = (generatedWip = {}) => {
	const qr = String(
		generatedWip.locQr ??
			generatedWip.locQR ??
			generatedWip.locationQr ??
			generatedWip.locationQR ??
			generatedWip.zoneQr ??
			generatedWip.zoneQR ??
			getTargetZone(generatedWip),
	).trim();

	return qr || "-";
};

const App_ProcessingQrWipZonePage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const routeState =
		location.state ?? getFieldQrFlowState(PROCESSING_ZONE_QR_CACHE_KEY) ?? {};

	const [scanError, setScanError] = useState("");
	const [isScanIssueOpen, setIsScanIssueOpen] = useState(false);

	React.useEffect(() => {
		if (routeState?.generatedWip) {
			setFieldQrFlowState(PROCESSING_ZONE_QR_CACHE_KEY, routeState);
		}

		if (!routeState?.generatedWip) {
			navigate("/App/processing", { replace: true });
		}
	}, [routeState, navigate]);

	const {
		generatedWip = {},
		generatedItems = [],
		batches = [],
		summary = {},
		scannedWipQr = "",
		wipScannedAt = "",
		returnTo = "/App/processing/qr/wip",
	} = routeState ?? {};

	const targetZone = useMemo(() => getTargetZone(generatedWip), [generatedWip]);

	const targetZoneQr = useMemo(
		() => getTargetZoneQr(generatedWip),
		[generatedWip],
	);

	const scanIssueDetails = useMemo(() => {
		const details = [{ label: "적재 구역", value: targetZone }];

		if (targetZoneQr && targetZoneQr !== "-" && targetZoneQr !== targetZone) {
			details.push({ label: "구역 QR", value: targetZoneQr });
		}

		return details;
	}, [targetZone, targetZoneQr]);

	const completeZoneScan = (scannedLocQr) => {
		const scannedAt = new Date().toISOString();

		navigate(returnTo, {
			replace: true,
			state: {
				generatedWip,
				generatedItems,
				batches,
				summary,
				scannedWipQr,
				wipScannedAt,
				zoneScanCompleted: true,
				zoneScannedAt: scannedAt,
				scannedLocQr,
			},
		});
	};

	const handleScanSuccess = (decodedText) => {
		const normalized = String(decodedText ?? "").trim();
		const expectedZoneQr = String(targetZoneQr ?? "").trim();

		if (!normalized) {
			setScanError("스캔된 구역 QR 값이 비어 있습니다.");
			return;
		}

		if (!expectedZoneQr || expectedZoneQr === "-") {
			setScanError("비교할 구역 QR 값이 없습니다.");
			return;
		}

		if (normalized !== expectedZoneQr) {
			setScanError("목표 적재공간과 일치하지 않는 QR입니다.");
			return;
		}

		setScanError("");
		completeZoneScan(normalized);
	};

	const handleScanIssueClick = () => {
		setScanError("");
		setIsScanIssueOpen(true);
	};

	const handleScanIssueConfirm = () => {
		if (!targetZoneQr || targetZoneQr === "-") {
			setIsScanIssueOpen(false);
			setScanError("비교할 구역 QR 값이 없습니다.");
			return;
		}

		setScanError("");
		setIsScanIssueOpen(false);
		completeZoneScan(targetZoneQr);
	};

	const handlePrevious = () => {
		navigate(-1);
	};

	return (
		<div className="h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
			<App_Header />

			<main className="mx-auto flex h-[calc(100dvh-72px)] max-w-md flex-col">
				<div className="min-h-0 flex-1 overflow-y-auto px-6 pt-12 pb-28">
					<div className="flex flex-col items-center space-y-10">
						<section className="space-y-4 text-center">
							<h1 className="text-[32px] font-extrabold tracking-tight text-slate-900">
								구역 스캔
							</h1>

							<div className="inline-flex items-center gap-1.5 rounded-full bg-[#d0e1fb]/30 px-4 py-2 text-sm font-bold text-[#24389c]">
								<span
									className="material-symbols-outlined text-sm"
									style={{ fontVariationSettings: '"FILL" 1' }}
								>
									location_on
								</span>
								{targetZone}
							</div>
						</section>

						<QrCameraScanner
							onScanSuccess={handleScanSuccess}
							paused={isScanIssueOpen}
						/>

						<section className="flex w-full items-start gap-4 rounded-xl border-l-4 border-[#3F51B5] bg-white p-5 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)]">
							<div className="rounded-lg bg-[#3F51B5]/10 p-2">
								<span className="material-symbols-outlined text-2xl text-[#24389c]">
									qr_code_2
								</span>
							</div>

							<div className="space-y-1">
								<p className="text-base font-bold text-slate-900">
									QR 코드를 중앙에 맞춰주세요
								</p>

								<div className="space-y-0.5">
									<p className="text-sm leading-relaxed text-slate-600">
										인식이 완료되면 자동으로 다음 단계로 넘어갑니다.
									</p>

									<button
										type="button"
										onClick={handleScanIssueClick}
										className="block text-left text-sm font-medium leading-relaxed text-slate-600 underline underline-offset-2 decoration-slate-400"
									>
										QR 인식에 문제가 있나요?
									</button>
								</div>

								{scanError ? (
									<p className="pt-1 text-sm font-semibold text-red-600">
										{scanError}
									</p>
								) : null}
							</div>
						</section>
					</div>
				</div>
			</main>

			<nav className="fixed bottom-0 left-0 z-50 flex w-full flex-col items-center rounded-t-xl bg-white shadow-[0_-4px_20px_rgba(25,28,30,0.06)]">
				<button
					type="button"
					onClick={handlePrevious}
					className="mx-6 my-4 flex w-[calc(100%-3rem)] items-center justify-center gap-2 rounded-xl bg-[#24389c]/10 py-4 text-sm font-semibold uppercase tracking-wider text-[#24389c] transition-all active:translate-y-0.5"
				>
					<span className="material-symbols-outlined">arrow_back</span>
					Previous
				</button>
			</nav>

			<App_ScanIssue
				isOpen={isScanIssueOpen}
				title="QR 정보 확인"
				description="아래 위치 정보와 스캔하려는 구역 QR 정보가 맞나요?"
				details={scanIssueDetails}
				onCancel={() => setIsScanIssueOpen(false)}
				onConfirm={handleScanIssueConfirm}
			/>
		</div>
	);
};

export default App_ProcessingQrWipZonePage;
