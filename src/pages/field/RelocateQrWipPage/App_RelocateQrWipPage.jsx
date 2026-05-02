import React, { useEffect, useMemo, useRef, useState } from "react";
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

const ERROR_COOLDOWN_MS = 100;

const formatNowTime = () => {
	const now = new Date();
	const hh = String(now.getHours()).padStart(2, "0");
	const mm = String(now.getMinutes()).padStart(2, "0");
	return `${hh}:${mm}`;
};

const App_RelocateQrWipPage = () => {
	const navigate = useNavigate();
	const { state } = useLocation();

	const scannerControlRef = useRef(null);
	const cooldownTimerRef = useRef(null);
	const scanBusyRef = useRef(false);

	const [scanStatus, setScanStatus] = useState("idle");
	const [scanError, setScanError] = useState("");
	const [scannerVisible, setScannerVisible] = useState(true);
	const [scannerSessionKey, setScannerSessionKey] = useState(0);

	useEffect(() => {
		if (!state?.relocation) {
			navigate("/App/ready", { replace: true });
		}

		return () => {
			if (cooldownTimerRef.current) {
				window.clearTimeout(cooldownTimerRef.current);
			}
		};
	}, [state, navigate]);

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
				key: "material",
				icon: "inventory_2",
				label: relocation.material || relocation.wipCode || "SM355A",
			},
			{
				key: "fromZone",
				icon: "location_on",
				label: relocation.from?.zone || relocation.fromZone || "Zone A-1",
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

	const restartScannerAfterCooldown = async (message, stopScanner) => {
		if (scanBusyRef.current) return;
		scanBusyRef.current = true;

		setScanError(message);
		setScanStatus("error");

		try {
			await stopScanner?.();
		} catch (_) {}

		await stopCameraSafely();

		setScannerVisible(false);

		if (cooldownTimerRef.current) {
			window.clearTimeout(cooldownTimerRef.current);
		}

		cooldownTimerRef.current = window.setTimeout(() => {
			setScanStatus("idle");
			setScannerSessionKey((prev) => prev + 1);
			setScannerVisible(true);
			scanBusyRef.current = false;
		}, ERROR_COOLDOWN_MS);
	};

	const handlePrevious = async () => {
		if (cooldownTimerRef.current) {
			window.clearTimeout(cooldownTimerRef.current);
		}

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
		if (scanBusyRef.current || scanStatus === "recognized") return;

		const scannedAt = formatNowTime();
		const scannedValue = String(decodedText ?? "").trim();
		const expectedWipQr = String(relocation.wipQr ?? "").trim();

		if (!expectedWipQr) {
			await restartScannerAfterCooldown(
				"비교할 재공품 QR 값이 없습니다.",
				stopScanner,
			);
			return;
		}

		if (scannedValue !== expectedWipQr) {
			await restartScannerAfterCooldown(
				"예정된 발생 재공품과 일치하지 않는 QR입니다.",
				stopScanner,
			);
			return;
		}

		scanBusyRef.current = true;
		setScanError("");
		setScanStatus("recognized");

		try {
			await stopScanner?.();
		} catch (_) {}

		await stopCameraSafely();

		navigate("/App/ready/relocate", {
			replace: true,
			state: {
				type: "RELOCATE_WIP_SCAN_SUCCESS",
				scannedAt,
				scannedValue,
				batchItemId,
				relocation,
				scanState: {
					...scanState,
					wipScanned: true,
					wipScannedAt: scannedAt,
					wipScannedValue: scannedValue,
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
								재공품 스캔
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

						{scannerVisible ? (
							<QrCameraScanner
								key={scannerSessionKey}
								ref={scannerControlRef}
								onScanSuccess={handleScanSuccess}
							/>
						) : (
							<div className="relative aspect-square w-full max-w-[340px] overflow-hidden rounded-3xl bg-black shadow-2xl" />
						)}

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
					className="mx-6 my-4 flex w-[calc(100%-3rem)] items-center justify-center gap-2 rounded-xl bg-indigo-100 py-4 text-sm font-semibold uppercase tracking-wider text-[#24389c] transition-all active:translate-y-0.5"
				>
					<span className="material-symbols-outlined">arrow_back</span>
					Previous
				</button>
			</nav>
		</div>
	);
};

export default App_RelocateQrWipPage;
