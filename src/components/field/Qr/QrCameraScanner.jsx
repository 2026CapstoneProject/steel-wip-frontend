import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { Html5Qrcode } from "html5-qrcode";

const QrCameraScanner = forwardRef(
	({ onScanSuccess, onScanError, paused = false, className = "" }, ref) => {
		const elementIdRef = useRef(
			`qr-reader-${Math.random().toString(36).slice(2)}`,
		);
		const scannerRef = useRef(null);
		const hasScannedRef = useRef(false);
		const isMountedRef = useRef(false);
		const destroyRequestedRef = useRef(false);
		const startResolvedRef = useRef(false);
		const stopPromiseRef = useRef(null);

		const [cameraError, setCameraError] = useState("");
		const [isReady, setIsReady] = useState(false);

		const hardStopTracks = useCallback(() => {
			const root = document.getElementById(elementIdRef.current);
			const videos = root ? root.querySelectorAll("video") : [];

			videos.forEach((video) => {
				const stream = video.srcObject;
				if (stream && typeof stream.getTracks === "function") {
					stream.getTracks().forEach((track) => track.stop());
					video.srcObject = null;
				}
			});

			if (root) {
				root.innerHTML = "";
			}
		}, []);

		const stopScanner = useCallback(async () => {
			if (stopPromiseRef.current) {
				return stopPromiseRef.current;
			}

			destroyRequestedRef.current = true;

			stopPromiseRef.current = (async () => {
				const scanner = scannerRef.current;

				if (scanner) {
					try {
						const state =
							typeof scanner.getState === "function"
								? scanner.getState()
								: null;

						if (state !== 0) {
							try {
								await scanner.stop();
							} catch (_) {}
						}
					} catch (_) {}

					try {
						await scanner.clear();
					} catch (_) {}
				}

				hardStopTracks();
				scannerRef.current = null;
				setIsReady(false);
			})();

			try {
				await stopPromiseRef.current;
			} finally {
				stopPromiseRef.current = null;
			}
		}, [hardStopTracks]);

		useImperativeHandle(
			ref,
			() => ({
				stop: stopScanner,
			}),
			[stopScanner],
		);

		useEffect(() => {
			isMountedRef.current = true;
			destroyRequestedRef.current = false;
			startResolvedRef.current = false;
			hasScannedRef.current = false;

			const startScanner = async () => {
				if (paused) return;

				setCameraError("");
				setIsReady(false);

				try {
					const scanner = new Html5Qrcode(elementIdRef.current);
					scannerRef.current = scanner;

					await scanner.start(
						{ facingMode: "environment" },
						{
							fps: 10,
							qrbox: { width: 220, height: 220 },
							aspectRatio: 1,
						},
						async (decodedText, decodedResult) => {
							if (destroyRequestedRef.current) return;
							if (hasScannedRef.current) return;

							hasScannedRef.current = true;
							await onScanSuccess?.(decodedText, decodedResult, stopScanner);
						},
						() => {},
					);

					startResolvedRef.current = true;

					if (destroyRequestedRef.current) {
						await stopScanner();
						return;
					}

					if (isMountedRef.current) {
						setIsReady(true);
					}
				} catch (error) {
					if (!isMountedRef.current) return;
					setCameraError(error?.message || "카메라를 시작할 수 없습니다.");
					onScanError?.(error);
					hardStopTracks();
				}
			};

			startScanner();

			return () => {
				isMountedRef.current = false;
				destroyRequestedRef.current = true;
				stopScanner();
			};
		}, [onScanSuccess, onScanError, paused, stopScanner, hardStopTracks]);

		return (
			<div
				className={`relative aspect-square w-full max-w-[340px] overflow-hidden rounded-3xl bg-black shadow-2xl ${className}`}
			>
				<div id={elementIdRef.current} className="h-full w-full" />

				{!isReady && !cameraError && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white">
						카메라 준비 중...
					</div>
				)}

				{cameraError && (
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black px-6 text-center text-white">
						<span className="material-symbols-outlined text-3xl">
							videocam_off
						</span>
						<p className="text-sm font-semibold">
							카메라를 사용할 수 없습니다.
						</p>
						<p className="text-xs text-white/70 break-all">{cameraError}</p>
					</div>
				)}

				<div className="pointer-events-none absolute inset-0">
					<div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2">
						<div className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-[#3F51B5]" />
						<div className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-[#3F51B5]" />
						<div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-[#3F51B5]" />
						<div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-[#3F51B5]" />
					</div>
				</div>
			</div>
		);
	},
);

export default QrCameraScanner;
