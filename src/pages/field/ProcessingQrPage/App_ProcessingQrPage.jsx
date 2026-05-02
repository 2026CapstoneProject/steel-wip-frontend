import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_Header from "../../../components/field/Header/App_Header";
import QrCameraScanner from "../../../components/field/Qr/QrCameraScanner";

const MOVE_NEXT_DELAY_MS = 250;

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
							paused={scanStatus === "recognized"}
						/>

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
								<p className="text-sm leading-relaxed text-slate-500">
									인식이 완료되면 자동으로 다음 단계로 넘어갑니다.
								</p>
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
		</div>
	);
};

export default App_ProcessingQrPage;
