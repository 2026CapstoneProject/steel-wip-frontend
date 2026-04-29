import React, { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_Header from "../../../components/field/Header/App_Header";
import QrCameraScanner from "../../../components/field/Qr/QrCameraScanner";

const fallbackRelocation = {
	id: "relocate-01",
	manufacturer: "유성 철주",
	material: "SM355A",
	specText: "18 x 2,438 x 6,096",
	weightText: "6,300 kg",
	from: {
		zone: "Zone A-1",
	},
	to: {
		zone: "Zone B-1",
	},
};

const formatNowTime = () => {
	const now = new Date();
	const hh = String(now.getHours()).padStart(2, "0");
	const mm = String(now.getMinutes()).padStart(2, "0");
	return `${hh}:${mm}`;
};

const App_RelocateQrZonePage = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const scannerControlRef = useRef(null);

	const relocation = state?.relocation ?? fallbackRelocation;
	const batchItemId = state?.batchItemId ?? null;

	const scanState = state?.scanState ?? {
		wipScanned: false,
		wipScannedAt: "",
		zoneScanned: false,
		zoneScannedAt: "",
	};

	const badgeItems = useMemo(
		() => [
			{
				key: "toZone",
				icon: "location_on",
				label: relocation.to?.zone || relocation.toZone || "Zone B-1",
			},
		],
		[relocation],
	);

	const forceStopAllVideos = () => {
		document.querySelectorAll("video").forEach((video) => {
			const stream = video.srcObject;
			if (stream && typeof stream.getTracks === "function") {
				stream.getTracks().forEach((track) => track.stop());
				video.srcObject = null;
			}
		});
	};

	const stopCameraSafely = async () => {
		try {
			await scannerControlRef.current?.stop?.();
		} catch (_) {}

		forceStopAllVideos();
	};

	useEffect(() => {
		if (!state?.relocation) {
			navigate("/App/ready", { replace: true });
		}
	}, [state, navigate]);

	const handlePrevious = async () => {
		await stopCameraSafely();

		navigate("/App/ready/relocate", {
			replace: true,
			state: {
				relocation,
				batchItemId,
				scanState,
			},
		});
	};

	const handleScanSuccess = async (
		decodedText,
		_decodedResult,
		stopScanner,
	) => {
		const scannedAt = formatNowTime();

		try {
			await stopScanner?.();
		} catch (_) {}

		forceStopAllVideos();

		navigate("/App/ready/relocate", {
			replace: true,
			state: {
				type: "RELOCATE_ZONE_SCAN_SUCCESS",
				scannedAt,
				scannedValue: decodedText,
				batchItemId,
				relocation,
				scanState: {
					...scanState,
					zoneScanned: true,
					zoneScannedAt: scannedAt,
				},
			},
		});
	};

	return (
		<div className="h-[100dvh] overflow-hidden bg-[#F7F9FB] text-[#191C1E]">
			<App_Header />

			<main className="mx-auto flex h-[calc(100dvh-72px)] max-w-2xl flex-col">
				<div className="min-h-0 flex-1 overflow-y-auto px-6 pt-12 pb-28">
					<div className="mx-auto flex w-full flex-col items-center space-y-10">
						<section className="space-y-4 text-center">
							<h1 className="text-[32px] font-extrabold tracking-tight">
								구역 스캔
							</h1>

							<div className="flex items-center justify-center gap-3">
								{badgeItems.map((badge) => (
									<div
										key={badge.key}
										className="inline-flex items-center gap-1.5 rounded-full bg-[#D0E1FB]/30 px-4 py-2 text-sm font-bold text-[#24389C]"
									>
										<span
											className="material-symbols-outlined text-sm"
											style={{ fontVariationSettings: '"FILL" 1' }}
										>
											{badge.icon}
										</span>
										{badge.label}
									</div>
								))}
							</div>
						</section>

						<QrCameraScanner
							ref={scannerControlRef}
							onScanSuccess={handleScanSuccess}
						/>

						<section className="flex w-full items-start gap-4 rounded-xl border-l-4 border-[#3F51B5] bg-white p-5 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)]">
							<div className="rounded-lg bg-[#3F51B5]/20 p-2">
								<span className="material-symbols-outlined text-2xl text-[#24389C]">
									qr_code_2
								</span>
							</div>

							<div className="space-y-1">
								<p className="text-base font-bold text-[#191C1E]">
									QR 코드를 중앙에 맞춰주세요
								</p>
								<p className="text-sm leading-relaxed text-[#505F76]">
									인식이 완료되면 자동으로 다음 단계로 넘어갑니다.
								</p>
							</div>
						</section>
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

export default App_RelocateQrZonePage;
