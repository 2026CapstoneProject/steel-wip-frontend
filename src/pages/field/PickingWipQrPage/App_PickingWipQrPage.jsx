import React, { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_Header from "../../../components/field/Header/App_Header";
import QrCameraScanner from "../../../components/field/Qr/QrCameraScanner";

const fallbackPicking = {
	id: "picking-wip-01",
	manufacturer: "현대 제철",
	material: "SS275",
	specText: "22 x 2,438 x 6,096",
	weightText: "7,698 kg",
	duration: "6m",
	expectedDurationText: "6m",
	expectedDurationMinutes: 6,
	from: {
		zone: "Zone C-3",
		time: "",
	},
	to: {
		zone: "Position 2",
		time: "",
	},
	layout: {
		highlightedSlot: "2",
		slots: ["1", "2", "3", "4"],
		wallLabel: "벽",
		equipmentLabel: "설비",
	},
};

const extractSlotNumber = (value) => {
	const match = String(value ?? "").match(/(\d+)/);
	return match ? match[1] : "";
};

const parseDurationMinutes = (value) => {
	const raw = String(value ?? "").trim();
	if (!raw) return 0;

	const hourMatches = [...raw.matchAll(/(\d+)\s*h/gi)];
	const minuteMatches = [...raw.matchAll(/(\d+)\s*m/gi)];

	if (hourMatches.length || minuteMatches.length) {
		const hours = hourMatches.reduce(
			(sum, match) => sum + Number(match[1] || 0),
			0,
		);
		const minutes = minuteMatches.reduce(
			(sum, match) => sum + Number(match[1] || 0),
			0,
		);
		return hours * 60 + minutes;
	}

	const plainNumber = raw.match(/(\d+)/);
	return plainNumber ? Number(plainNumber[1]) : 0;
};

const formatPositionLabel = (value) => {
	if (value === null || value === undefined || value === "") return "";
	const raw = String(value).trim();
	if (!raw) return "";
	if (/position/i.test(raw)) return raw;
	if (/^\d+$/.test(raw)) return `Position ${raw}`;
	return raw;
};

const buildSpecText = (source) => {
	if (source?.specText) return source.specText;

	const thickness = source?.thickness ?? source?.spec?.thickness;
	const width = source?.width ?? source?.spec?.width;
	const length = source?.length ?? source?.spec?.length;

	if (thickness && width && length) {
		return `${thickness} x ${width} x ${length}`;
	}

	return fallbackPicking.specText;
};

const formatTime = (date) => {
	const hh = String(date.getHours()).padStart(2, "0");
	const mm = String(date.getMinutes()).padStart(2, "0");
	return `${hh}:${mm}`;
};

const normalizePickingData = (source = {}) => {
	const currentZone =
		source?.currentZone ||
		source?.current?.zone ||
		source?.from?.zone ||
		source?.zone ||
		fallbackPicking.from.zone;

	const rawPosition =
		source?.to?.zone ||
		source?.toZone ||
		source?.positionLabel ||
		source?.targetPositionLabel ||
		source?.targetPosition ||
		source?.position ||
		source?.layout?.highlightedSlot ||
		fallbackPicking.to.zone;

	const highlightedSlot = String(
		source?.layout?.highlightedSlot ||
			source?.highlightedSlot ||
			extractSlotNumber(rawPosition) ||
			fallbackPicking.layout.highlightedSlot,
	);

	const toZone =
		formatPositionLabel(rawPosition) || `Position ${highlightedSlot}`;

	const expectedDurationText =
		source?.expectedDurationText ||
		source?.duration ||
		fallbackPicking.duration;

	const expectedDurationMinutes =
		typeof source?.expectedDurationMinutes === "number"
			? source.expectedDurationMinutes
			: parseDurationMinutes(expectedDurationText);

	return {
		...fallbackPicking,
		...source,
		manufacturer:
			source?.manufacturer ||
			source?.maker ||
			source?.company ||
			fallbackPicking.manufacturer,
		material: source?.material || source?.grade || fallbackPicking.material,
		specText: buildSpecText(source),
		weightText:
			source?.weightText ||
			source?.weight ||
			source?.weightKg ||
			fallbackPicking.weightText,
		duration: source?.duration || expectedDurationText,
		expectedDurationText,
		expectedDurationMinutes,
		from: {
			...fallbackPicking.from,
			...(source?.from ?? {}),
			zone: currentZone,
			time: source?.from?.time || source?.fromTime || "",
		},
		to: {
			...fallbackPicking.to,
			...(source?.to ?? {}),
			zone: toZone,
			time: source?.to?.time || source?.toTime || "",
		},
		layout: {
			...fallbackPicking.layout,
			...(source?.layout ?? {}),
			highlightedSlot,
		},
	};
};

export default function App_PickingWipQrPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const scannerControlRef = useRef(null);

	useEffect(() => {
		if (
			!location.state?.picking &&
			!location.state?.item &&
			!location.state?.task
		) {
			navigate("/App/ready", { replace: true });
		}
	}, [location.state, navigate]);

	const routeState = location.state || {};
	const returnPath = routeState.returnPath || "/App/ready/picking/wip";

	const picking = useMemo(() => {
		const source =
			routeState.picking ||
			routeState.item ||
			routeState.task ||
			fallbackPicking;

		return normalizePickingData(source);
	}, [routeState]);

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

	const handleScanSuccess = async (
		decodedText,
		_decodedResult,
		stopScanner,
	) => {
		const scannedDate = new Date();
		const scannedAt = formatTime(scannedDate);
		const scannedValue = String(decodedText ?? "").trim();
		const expectedWipQr = String(picking.wipQr ?? "").trim();

		try {
			await stopScanner?.();
		} catch (_) {}

		forceStopAllVideos();

		if (!expectedWipQr) {
			alert("비교할 재공품 QR 값이 없습니다.");
			navigate(returnPath, {
				replace: true,
				state: {
					...routeState,
					picking,
					item: picking,
				},
			});
			return;
		}

		if (scannedValue !== expectedWipQr) {
			alert(
				`재공품 QR 불일치\n기대값: ${expectedWipQr}\n스캔값: ${scannedValue}`,
			);

			navigate(returnPath, {
				replace: true,
				state: {
					...routeState,
					picking,
					item: picking,
				},
			});
			return;
		}

		const expectedDurationMinutes = Number.isFinite(
			picking.expectedDurationMinutes,
		)
			? picking.expectedDurationMinutes
			: 0;

		const estimatedToDate = new Date(
			scannedDate.getTime() + expectedDurationMinutes * 60 * 1000,
		);
		const estimatedToTime = formatTime(estimatedToDate);

		const nextPicking = {
			...picking,
			from: {
				...picking.from,
				time: scannedAt,
			},
			to: {
				...picking.to,
				time: estimatedToTime,
			},
		};

		alert(`재공품 QR 일치\n기대값: ${expectedWipQr}\n스캔값: ${scannedValue}`);

		navigate(returnPath, {
			replace: true,
			state: {
				...routeState,
				type: "PICKING_WIP_QR_SUCCESS",
				scannedAt,
				scannedValue,
				estimatedToTime,
				picking: nextPicking,
				item: nextPicking,
				scanState: {
					...(routeState.scanState ?? {}),
					qrScanned: true,
					fromTime: scannedAt,
					toTime: estimatedToTime,
					expectedDurationMinutes,
					wipScannedValue: scannedValue,
				},
			},
		});
	};

	const handlePrev = async () => {
		await stopCameraSafely();
		navigate(-1);
	};

	return (
		<div className="h-[100dvh] overflow-hidden bg-[#F7F9FB] text-[#191C1E]">
			<App_Header />

			<main className="mx-auto flex h-[calc(100dvh-72px)] max-w-2xl flex-col">
				<div className="min-h-0 flex-1 overflow-y-auto px-6 pt-12 pb-28">
					<div className="mx-auto flex w-full flex-col items-center space-y-10">
						<div className="space-y-4 text-center">
							<h1 className="text-[32px] font-extrabold tracking-tight text-[#191C1E]">
								재공품 스캔
							</h1>

							<div className="flex flex-wrap items-center justify-center gap-3">
								<div className="inline-flex items-center gap-1.5 rounded-full bg-[#D0E1FB]/30 px-4 py-2 text-sm font-bold text-[#24389C]">
									<span
										className="material-symbols-outlined text-sm"
										style={{ fontVariationSettings: '"FILL" 1' }}
									>
										inventory_2
									</span>
									{picking.material}
								</div>

								<div className="inline-flex items-center gap-1.5 rounded-full bg-[#D0E1FB]/30 px-4 py-2 text-sm font-bold text-[#24389C]">
									<span
										className="material-symbols-outlined text-sm"
										style={{ fontVariationSettings: '"FILL" 1' }}
									>
										location_on
									</span>
									{picking.from?.zone} → {picking.to?.zone}
								</div>
							</div>
						</div>

						<QrCameraScanner
							ref={scannerControlRef}
							onScanSuccess={handleScanSuccess}
						/>

						<div className="flex w-full items-start gap-4 rounded-xl border-l-4 border-[#3F51B5] bg-white p-5 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)]">
							<div className="rounded-lg bg-[#3F51B5]/10 p-2">
								<span className="material-symbols-outlined text-2xl text-[#24389C]">
									qr_code_2
								</span>
							</div>

							<div className="space-y-1">
								<p className="text-base font-bold text-[#191C1E]">
									재공품 QR 코드를 중앙에 맞춰주세요
								</p>
								<p className="text-sm leading-relaxed text-[#505F76]">
									인식이 완료되면 자동으로 다음 단계로 넘어갑니다.
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>

			<nav className="fixed bottom-0 left-0 z-50 flex w-full flex-col items-center rounded-t-xl bg-white shadow-[0_-4px_20px_rgba(25,28,30,0.06)]">
				<button
					type="button"
					onClick={handlePrev}
					className="mx-6 my-4 flex w-[calc(100%-3rem)] flex-row items-center justify-center gap-2 rounded-xl bg-[#24389C]/10 py-4 text-sm font-semibold uppercase tracking-wider text-[#24389C] transition-all active:translate-y-0.5"
				>
					<span className="material-symbols-outlined">arrow_back</span>
					Previous
				</button>
			</nav>
		</div>
	);
}
