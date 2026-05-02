import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_Header from "../../../components/field/Header/App_Header";
import QrCameraScanner from "../../../components/field/Qr/QrCameraScanner";

const getTargetZone = (generatedWip = {}) =>
	generatedWip.zone ?? generatedWip.toZone ?? "-";

const App_ProcessingQrWipZonePage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [scanError, setScanError] = useState("");

	React.useEffect(() => {
		if (!location.state?.generatedWip) {
			navigate("/App/processing", { replace: true });
		}
	}, [location.state, navigate]);

	const {
		generatedWip = {},
		generatedItems = [],
		batches = [],
		summary = {},
		scannedWipQr = "",
		wipScannedAt = "",
		returnTo = "/App/processing/qr/wip",
	} = location.state ?? {};

	const targetZone = useMemo(() => getTargetZone(generatedWip), [generatedWip]);

	const handleScanSuccess = (decodedText) => {
		const normalized = String(decodedText ?? "").trim();
		const expectedZone = String(targetZone ?? "").trim();

		if (!normalized) {
			setScanError("스캔된 구역 QR 값이 비어 있습니다.");
			return;
		}

		if (expectedZone && expectedZone !== "-" && normalized !== expectedZone) {
			setScanError("목표 적재공간과 일치하지 않는 QR입니다.");
			return;
		}

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
				scannedLocQr: normalized,
			},
		});
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

						<QrCameraScanner onScanSuccess={handleScanSuccess} />

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
								<p className="text-sm leading-relaxed text-slate-600">
									인식이 완료되면 자동으로 다음 단계로 넘어갑니다.
								</p>
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
		</div>
	);
};

export default App_ProcessingQrWipZonePage;
