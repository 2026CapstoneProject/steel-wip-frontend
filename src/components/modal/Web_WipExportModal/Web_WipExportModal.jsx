import { useState } from "react";
import { wipService } from "../../../services/wipService";

export default function Web_WipExportModal({ onClose }) {
	const [format, setFormat] = useState("xlsx");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleExport = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await wipService.exportFile(format);
			const ext = format === "csv" ? "csv" : "xlsx";
			const mime =
				format === "csv"
					? "text/csv"
					: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
			const url = window.URL.createObjectURL(
				new Blob([res.data], { type: mime }),
			);
			const a = document.createElement("a");
			a.href = url;
			a.download = `steel_wip_export.${ext}`;
			a.click();
			window.URL.revokeObjectURL(url);
			onClose();
		} catch (err) {
			console.error("Export 실패:", err);
			setError("파일 다운로드에 실패했습니다. 다시 시도해주세요.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
				{/* 헤더 */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-surface-container">
					<div className="flex items-center gap-2">
						<span className="material-symbols-outlined text-primary !text-xl">
							download
						</span>
						<h2 className="font-headline text-lg font-bold text-on-surface">
							재고 Export
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-on-surface-variant hover:text-on-surface transition-colors"
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				{/* 본문 */}
				<div className="px-6 py-6 space-y-5">
					<p className="text-sm text-on-surface-variant">
						현재 재고 전체를 선택한 파일 형식으로 다운로드합니다.
					</p>

					<div className="space-y-2">
						<p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
							파일 형식
						</p>
						<div className="flex gap-3">
							{["xlsx", "csv"].map((f) => (
								<button
									key={f}
									type="button"
									onClick={() => setFormat(f)}
									className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
										format === f
											? "border-primary bg-primary/5 text-primary"
											: "border-surface-container text-on-surface-variant hover:border-primary/40"
									}`}
								>
									<span className="material-symbols-outlined !text-lg">
										{f === "xlsx" ? "table_chart" : "csv"}
									</span>
									.{f.toUpperCase()}
								</button>
							))}
						</div>
					</div>

					{error && (
						<p className="text-sm text-error bg-error/5 rounded-lg px-4 py-3">
							{error}
						</p>
					)}
				</div>

				{/* 푸터 */}
				<div className="px-6 pb-6 flex gap-3">
					<button
						type="button"
						onClick={onClose}
						className="flex-1 py-3 rounded-xl border border-surface-container text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
					>
						취소
					</button>
					<button
						type="button"
						onClick={handleExport}
						disabled={loading}
						className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dim active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{loading ? (
							<>
								<span className="material-symbols-outlined !text-lg animate-spin">
									progress_activity
								</span>
								다운로드 중...
							</>
						) : (
							<>
								<span className="material-symbols-outlined !text-lg">
									download
								</span>
								다운로드
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
