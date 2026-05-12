import { useRef, useState } from "react";
import { importLantekData } from "../../../services/lantekService";
import { createScenario } from "../../../services/scenarioService";
import Web_LoadingModal from "../Web_LoadingModal/Web_LoadingModal";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Web_LantekUploadModal({
	scenarioId,
	projectId,
	shipmentDate,
	tempSavedFile,
	onScenarioResolved,
	onClose,
	onUpload,
}) {
	const inputRef = useRef(null);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [uploading, setUploading] = useState(false);

	const createFreshScenario = async () => {
		if (!projectId || !shipmentDate) {
			throw new Error("시나리오를 다시 생성할 프로젝트 정보가 없습니다.");
		}

		const response = await createScenario({
			project_id: projectId,
			scenario_due: shipmentDate,
		});
		const scenario = response.data?.data;
		if (!scenario?.id) {
			throw new Error("시나리오 재생성에 실패했습니다.");
		}
		onScenarioResolved?.(scenario);
		return scenario.id;
	};

	const handleFilesSelect = (files) => {
		if (!files || files.length === 0) return;
		const allPdf = files.every(
			(f) =>
				f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
		);
		if (!allPdf) {
			alert("PDF 파일만 선택해주세요.");
			return;
		}
		setSelectedFiles((prev) => {
			const existing = new Set(prev.map((f) => f.name));
			const newFiles = files.filter((f) => !existing.has(f.name));
			return [...prev, ...newFiles];
		});
		if (inputRef.current) inputRef.current.value = "";
	};

	const handleConfirmUpload = async () => {
		if (selectedFiles.length === 0) {
			alert("파일을 먼저 선택해주세요.");
			return;
		}
		setUploading(true);
		const startedAt = Date.now();
		try {
			let activeScenarioId = scenarioId;
			if (!activeScenarioId) {
				activeScenarioId = await createFreshScenario();
			}

			let response;
			try {
				response = await importLantekData(activeScenarioId, selectedFiles);
			} catch (err) {
				const msg =
					err.response?.data?.message || err.response?.data?.detail || "";
				if (msg.includes("시나리오를 찾을 수 없습니다")) {
					activeScenarioId = await createFreshScenario();
					response = await importLantekData(activeScenarioId, selectedFiles);
				} else {
					throw err;
				}
			}

			// 백엔드가 반환하는 LantekScenarioData[] (data 배열의 첫번째 항목)
			const lantekDataList = response.data?.data ?? [];
			const remainingDelay = Math.max(0, 5000 - (Date.now() - startedAt));
			if (remainingDelay > 0) {
				await sleep(remainingDelay);
			}
			onUpload(selectedFiles, lantekDataList);
		} catch (err) {
			console.error("LANTEK import 실패:", err);
			const remainingDelay = Math.max(0, 5000 - (Date.now() - startedAt));
			if (remainingDelay > 0) {
				await sleep(remainingDelay);
			}
			const msg =
				err.response?.data?.message ||
				err.response?.data?.detail ||
				err.message ||
				"파일 업로드에 실패했습니다.";
			alert(msg);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]">
			<div className="w-full max-w-xl bg-surface-container-lowest rounded-modal shadow-[0_40px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
				<div className="flex items-center justify-between px-8 py-6 border-b border-surface-container">
					<h2 className="font-headline font-bold text-xl text-on-surface">
						파일 업로드
					</h2>
					<button
						type="button"
						className="text-on-surface-variant hover:text-on-surface transition-colors"
						onClick={onClose}
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				<div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto">
					<input
						ref={inputRef}
						type="file"
						accept=".pdf,application/pdf"
						multiple
						className="hidden"
						onChange={(e) => handleFilesSelect(Array.from(e.target.files))}
					/>
					<div
						className="w-full min-h-[220px] border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low flex flex-col items-center justify-center p-6 text-center"
						onDragOver={(e) => e.preventDefault()}
						onDrop={(e) => {
							e.preventDefault();
							handleFilesSelect(Array.from(e.dataTransfer.files));
						}}
					>
						<div className="mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
							<span className="material-symbols-outlined !text-3xl">
								upload_file
							</span>
						</div>
						<p className="font-body text-on-surface font-medium leading-relaxed max-w-xs mb-6">
							첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 눌러 파일을
							직접 선택해주세요.
						</p>
						<button
							type="button"
							className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dim text-white px-8 py-3 rounded-lg font-body font-semibold transition-all shadow-md active:scale-95"
							onClick={() => inputRef.current?.click()}
						>
							<span className="material-symbols-outlined">cloud_upload</span>
							파일 선택
						</button>
					</div>
					{selectedFiles.length > 0 && (
						<div className="rounded-xl border border-primary/20 bg-primary-container/30 px-4 py-4 space-y-2">
							<p className="text-sm text-on-surface-variant mb-1">
								선택한 파일 ({selectedFiles.length}개)
							</p>
							{selectedFiles.map((file, idx) => (
								<div key={idx} className="flex items-center gap-2">
									<span className="material-symbols-outlined text-primary !text-lg">
										description
									</span>
									<p className="font-semibold text-on-surface flex-1 text-sm">
										{file.name}
									</p>
									<button
										type="button"
										onClick={() =>
											setSelectedFiles((prev) =>
												prev.filter((_, i) => i !== idx),
											)
										}
										className="flex items-center justify-center w-6 h-6 rounded-full text-error hover:bg-error/10 transition-colors"
									>
										<span className="material-symbols-outlined !text-base !text-red-500">
											close
										</span>
									</button>
								</div>
							))}
						</div>
					)}
					{tempSavedFile && (
						<div className="rounded-lg bg-surface-container px-4 py-3 text-sm text-on-surface">
							임시저장 파일:{" "}
							<span className="font-semibold">{tempSavedFile.name}</span>
						</div>
					)}
					<div className="flex justify-end gap-3">
						<button
							type="button"
							className="px-5 py-3 rounded-lg bg-surface-container text-on-surface font-medium hover:bg-surface-container-high"
							onClick={onClose}
							disabled={uploading}
						>
							취소
						</button>
						<button
							type="button"
							disabled={selectedFiles.length === 0 || uploading}
							className={`px-5 py-3 rounded-lg font-semibold ${
								selectedFiles.length > 0 && !uploading
									? "bg-primary text-white hover:bg-primary-dim"
									: "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60"
							}`}
							onClick={handleConfirmUpload}
						>
							{uploading ? "업로드 중..." : "확인"}
						</button>
					</div>
				</div>
			</div>

			{uploading && (
				<Web_LoadingModal message="LANTEK 파일을 분석하는 중입니다." />
			)}
		</div>
	);
}
