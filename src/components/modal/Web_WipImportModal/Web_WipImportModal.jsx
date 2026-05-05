import { useRef, useState } from "react";
import { wipService } from "../../../services/wipService";
import Web_LoadingModal from "../Web_LoadingModal/Web_LoadingModal";

// ── 상수 ──────────────────────────────────────────────────────────────────────
const STEPS = { UPLOAD: "UPLOAD", REVIEW: "REVIEW", DONE: "DONE" };

const FIELD_LABELS = {
	material: "재질",
	thickness: "두께",
	width: "폭",
	length: "길이",
	weight: "중량(kg)",
	manufacturer: "제강사",
	location_id: "위치 ID",
	stack_level: "층",
};

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────
function TagBadge({ type }) {
	const map = {
		create: { label: "추가", cls: "bg-green-100 text-green-700" },
		update: { label: "변경", cls: "bg-blue-100 text-blue-700" },
		delete: { label: "삭제", cls: "bg-red-100 text-red-700" },
	};
	const { label, cls } = map[type] ?? {
		label: type,
		cls: "bg-gray-100 text-gray-600",
	};
	return (
		<span
			className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${cls}`}
		>
			{label}
		</span>
	);
}

// ── 변동 행: 추가 / 변경 ───────────────────────────────────────────────────────
function ChangeRow({ item, type, checked, onToggle }) {
	return (
		<tr
			className={`border-b border-surface-container last:border-0 ${checked ? "bg-primary/5" : ""}`}
		>
			<td className="px-4 py-3 text-center">
				<input
					type="checkbox"
					checked={checked}
					onChange={onToggle}
					className="w-4 h-4 accent-primary cursor-pointer"
				/>
			</td>
			<td className="px-4 py-3">
				<TagBadge type={type} />
			</td>
			<td className="px-4 py-3 font-mono text-sm text-on-surface font-medium">
				{item.qr_code ?? item.qr_code_value ?? "-"}
			</td>
			<td className="px-4 py-3 text-sm text-on-surface-variant">
				{type === "create" ? (
					<CreateFieldSummary fields={item.fields} />
				) : (
					<UpdateDiffSummary before={item.before} after={item.after} />
				)}
			</td>
		</tr>
	);
}

// ── 삭제 행 ───────────────────────────────────────────────────────────────────
function DeleteRow({ item, checked, onToggle }) {
	const isInUse = item.status === "CONSUMED" || item.status === "RESERVATED";

	// 추가 행(CreateFieldSummary)과 동일한 형식으로 구성
	const fields = {
		material: item.material,
		thickness: item.thickness,
		width: item.width,
		length: item.length,
		weight: item.weight,
	};

	return (
		<tr
			className={`border-b border-surface-container last:border-0 ${checked ? "bg-red-50/60" : ""} ${isInUse ? "opacity-50" : ""}`}
		>
			<td className="px-4 py-3 text-center">
				<input
					type="checkbox"
					checked={checked}
					onChange={onToggle}
					disabled={isInUse}
					className="w-4 h-4 accent-red-500 cursor-pointer disabled:cursor-not-allowed"
				/>
			</td>
			<td className="px-4 py-3">
				<TagBadge type="delete" />
			</td>
			<td className="px-4 py-3 font-mono text-sm text-on-surface font-medium">
				{item.qr_code ?? "-"}
			</td>
			<td className="px-4 py-3 text-sm text-on-surface-variant">
				{isInUse ? (
					<span className="text-error text-xs">
						생산 투입 중 — 삭제 불가 ({item.status})
					</span>
				) : (
					<CreateFieldSummary fields={fields} />
				)}
			</td>
		</tr>
	);
}

function CreateFieldSummary({ fields }) {
	if (!fields) return <span className="text-on-surface-variant">-</span>;
	const entries = Object.entries(fields)
		.filter(([, v]) => v !== null && v !== undefined)
		.map(([k, v]) => `${FIELD_LABELS[k] ?? k}: ${v}`);
	return (
		<span className="text-xs leading-relaxed">
			{entries.join(" · ") || "-"}
		</span>
	);
}

function UpdateDiffSummary({ before, after }) {
	if (!before || !after)
		return <span className="text-on-surface-variant">-</span>;
	const changed = Object.keys(after).filter(
		(k) => String(before[k] ?? "") !== String(after[k] ?? ""),
	);
	if (!changed.length)
		return <span className="text-on-surface-variant">변동 없음</span>;
	return (
		<span className="text-xs leading-relaxed">
			{changed
				.map(
					(k) =>
						`${FIELD_LABELS[k] ?? k}: ${before[k] ?? "-"} → ${after[k] ?? "-"}`,
				)
				.join(" · ")}
		</span>
	);
}

// ── 스킵 행 ───────────────────────────────────────────────────────────────────
function SkippedRow({ item }) {
	return (
		<tr className="border-b border-surface-container last:border-0">
			<td className="px-4 py-3 font-mono text-sm text-on-surface-variant">
				{item.qr_code ?? "-"}
			</td>
			<td className="px-4 py-3 text-sm text-error">{item.reason ?? "-"}</td>
		</tr>
	);
}

// ── 요약 카드 ─────────────────────────────────────────────────────────────────
function SummaryCard({ label, count, color, bg }) {
	return (
		<div className={`rounded-lg px-3 py-3 ${bg} text-center`}>
			<p className={`text-2xl font-bold ${color}`}>{count}</p>
			<p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
		</div>
	);
}

// ── Step 인디케이터 ───────────────────────────────────────────────────────────
function StepIndicator({ current }) {
	const steps = [
		{ key: STEPS.UPLOAD, label: "파일 업로드" },
		{ key: STEPS.REVIEW, label: "변동 확인" },
		{ key: STEPS.DONE, label: "완료" },
	];
	const currentIdx = steps.findIndex((s) => s.key === current);
	return (
		<div className="flex items-center gap-1 text-xs text-on-surface-variant">
			{steps.map((s, idx) => (
				<span key={s.key} className="flex items-center gap-1">
					<span
						className={`font-semibold ${
							idx < currentIdx
								? "text-primary"
								: idx === currentIdx
									? "text-on-surface"
									: "text-on-surface-variant/50"
						}`}
					>
						{s.label}
					</span>
					{idx < steps.length - 1 && (
						<span className="material-symbols-outlined !text-base text-on-surface-variant/40">
							chevron_right
						</span>
					)}
				</span>
			))}
		</div>
	);
}

// ── Step 1: 업로드 ────────────────────────────────────────────────────────────
function UploadStep({ inputRef, selectedFile, onFileSelect, onClearFile }) {
	return (
		<div className="space-y-6">
			<input
				ref={inputRef}
				type="file"
				accept=".csv,.xlsx,.xls"
				className="hidden"
				onChange={(e) => onFileSelect(e.target.files?.[0])}
			/>
			<div
				className="w-full min-h-[220px] border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
				onDragOver={(e) => e.preventDefault()}
				onDrop={(e) => {
					e.preventDefault();
					onFileSelect(e.dataTransfer.files?.[0]);
				}}
				onClick={() => inputRef.current?.click()}
			>
				<div className="mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
					<span className="material-symbols-outlined !text-3xl">
						upload_file
					</span>
				</div>
				<p className="font-body text-on-surface font-medium leading-relaxed max-w-xs mb-2">
					첨부할 파일을 여기에 끌어다 놓거나 클릭하여 파일을 선택해주세요.
				</p>
				<p className="text-xs text-on-surface-variant">
					지원 형식: CSV, XLSX, XLS
				</p>
			</div>
			{selectedFile && (
				<div className="rounded-xl border border-primary/20 bg-primary-container/30 px-4 py-4">
					<p className="text-xs text-on-surface-variant mb-1">선택한 파일</p>
					<div className="flex items-center gap-2">
						<span className="material-symbols-outlined text-primary !text-lg">
							description
						</span>
						<p className="font-semibold text-on-surface flex-1">
							{selectedFile.name}
						</p>
						<button
							type="button"
							onClick={onClearFile}
							className="ml-2 flex items-center justify-center w-6 h-6 rounded-full text-error hover:bg-error/10 transition-colors"
							title="파일 선택 취소"
						>
							<span className="material-symbols-outlined !text-base !text-red-500">
								close
							</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

// ── Step 2: 변동 확인 ─────────────────────────────────────────────────────────
function ReviewStep({
	toUpdate,
	toCreate,
	toDelete,
	skipped,
	unchanged,
	selectedUpdates,
	selectedCreates,
	selectedDeletes,
	onToggleUpdate,
	onToggleCreate,
	onToggleDelete,
	onToggleAllUpdates,
	onToggleAllCreates,
	onToggleAllDeletes,
}) {
	const totalChanges = toCreate.length + toUpdate.length + toDelete.length;
	const totalSelected =
		selectedUpdates.size + selectedCreates.size + selectedDeletes.size;

	const allSelected = totalSelected === totalChanges && totalChanges > 0;

	const handleToggleAll = () => {
		if (allSelected) {
			onToggleAllUpdates(false);
			onToggleAllCreates(false);
			onToggleAllDeletes(false);
		} else {
			onToggleAllUpdates(true);
			onToggleAllCreates(true);
			onToggleAllDeletes(true);
		}
	};

	return (
		<div className="space-y-6">
			{/* 요약 */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<SummaryCard
					label="신규 추가"
					count={toCreate.length}
					color="text-green-600"
					bg="bg-green-50"
				/>
				<SummaryCard
					label="변경"
					count={toUpdate.length}
					color="text-blue-600"
					bg="bg-blue-50"
				/>
				<SummaryCard
					label="삭제 후보"
					count={toDelete.length}
					color="text-red-600"
					bg="bg-red-50"
				/>
				<SummaryCard
					label="동일 (미반영)"
					count={unchanged}
					color="text-on-surface-variant"
					bg="bg-surface-container"
				/>
			</div>

			{totalChanges > 0 ? (
				<div className="rounded-xl border border-surface-container overflow-hidden">
					{/* 테이블 헤더 */}
					<div className="px-4 py-3 bg-surface-container-low flex items-center justify-between">
						<span className="font-semibold text-on-surface text-sm">
							반영 항목 선택 ({totalSelected}/{totalChanges})
						</span>
						<button
							type="button"
							className="text-xs text-primary hover:underline"
							onClick={handleToggleAll}
						>
							{allSelected ? "전체 해제" : "전체 선택"}
						</button>
					</div>

					<table className="w-full">
						<thead className="bg-surface-container/60">
							<tr className="text-xs text-on-surface-variant font-medium">
								<th className="px-4 py-2 w-10">
									<input
										type="checkbox"
										className="w-4 h-4 accent-primary cursor-pointer"
										checked={allSelected}
										onChange={handleToggleAll}
									/>
								</th>
								<th className="px-4 py-2 text-left w-16">구분</th>
								<th className="px-4 py-2 text-left w-28">QR코드</th>
								<th className="px-4 py-2 text-left">내용</th>
							</tr>
						</thead>
						<tbody>
							{toCreate.map((item, i) => (
								<ChangeRow
									key={`create-${i}`}
									item={item}
									type="create"
									checked={selectedCreates.has(i)}
									onToggle={() => onToggleCreate(i)}
								/>
							))}
							{toUpdate.map((item, i) => (
								<ChangeRow
									key={`update-${i}`}
									item={item}
									type="update"
									checked={selectedUpdates.has(i)}
									onToggle={() => onToggleUpdate(i)}
								/>
							))}
							{toDelete.map((item, i) => (
								<DeleteRow
									key={`delete-${i}`}
									item={item}
									checked={selectedDeletes.has(i)}
									onToggle={() => onToggleDelete(i)}
								/>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<div className="rounded-xl bg-surface-container px-6 py-10 text-center text-on-surface-variant">
					<span className="material-symbols-outlined !text-4xl mb-2 block">
						check_circle
					</span>
					파일과 DB 데이터가 모두 동일합니다. 반영할 변동사항이 없습니다.
				</div>
			)}

			{/* 업로드 스킵 항목 */}
			{skipped.length > 0 && (
				<div className="rounded-xl border border-error/20 overflow-hidden">
					<div className="px-4 py-3 bg-error/5">
						<span className="font-semibold text-error text-sm">
							업로드 불가 항목 ({skipped.length}건) — 이미 생산에 투입된 재고
						</span>
					</div>
					<table className="w-full">
						<thead className="bg-surface-container/40">
							<tr className="text-xs text-on-surface-variant font-medium">
								<th className="px-4 py-2 text-left">QR코드</th>
								<th className="px-4 py-2 text-left">사유</th>
							</tr>
						</thead>
						<tbody>
							{skipped.map((item, i) => (
								<SkippedRow key={i} item={item} />
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

// ── Step 3: 완료 ──────────────────────────────────────────────────────────────
function DoneStep({ summary }) {
	if (!summary) return null;
	return (
		<div className="flex flex-col items-center text-center py-8 space-y-6">
			<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
				<span className="material-symbols-outlined !text-3xl">
					check_circle
				</span>
			</div>
			<div>
				<p className="font-headline font-bold text-xl text-on-surface mb-1">
					업로드 완료
				</p>
				<p className="text-on-surface-variant text-sm">
					재고 데이터가 성공적으로 반영되었습니다.
				</p>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
				<SummaryCard
					label="신규 등록"
					count={summary.created}
					color="text-green-600"
					bg="bg-green-50"
				/>
				<SummaryCard
					label="업데이트"
					count={summary.updated}
					color="text-blue-600"
					bg="bg-blue-50"
				/>
				<SummaryCard
					label="삭제"
					count={summary.deleted}
					color="text-red-600"
					bg="bg-red-50"
				/>
				<SummaryCard
					label="스킵"
					count={summary.skipped}
					color="text-error"
					bg="bg-error/5"
				/>
			</div>
			{summary.skippedList?.length > 0 && (
				<div className="w-full rounded-xl border border-error/20 overflow-hidden text-left">
					<div className="px-4 py-2 bg-error/5 text-xs font-semibold text-error">
						반영되지 않은 항목
					</div>
					<table className="w-full">
						<tbody>
							{summary.skippedList.map((item, i) => (
								<SkippedRow key={i} item={item} />
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

// ── 메인 모달 ─────────────────────────────────────────────────────────────────
export default function Web_WipImportModal({ onClose, onImportDone }) {
	const inputRef = useRef(null);
	const [step, setStep] = useState(STEPS.UPLOAD);
	const [selectedFile, setSelectedFile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("");

	// preview 결과
	const [toUpdate, setToUpdate] = useState([]);
	const [toCreate, setToCreate] = useState([]);
	const [toDelete, setToDelete] = useState([]); // ← missing_in_file → 삭제 후보
	const [skipped, setSkipped] = useState([]);
	const [unchanged, setUnchanged] = useState(0);

	// 선택 상태
	const [selectedUpdates, setSelectedUpdates] = useState(new Set());
	const [selectedCreates, setSelectedCreates] = useState(new Set());
	const [selectedDeletes, setSelectedDeletes] = useState(new Set());

	// confirm 결과
	const [resultSummary, setResultSummary] = useState(null);

	// ── 파일 선택 ───────────────────────────────────────────────────────────────
	const handleFileSelect = (file) => {
		if (!file) return;
		const ext = file.name.split(".").pop().toLowerCase();
		if (!["csv", "xlsx", "xls"].includes(ext)) {
			alert("CSV 또는 Excel(xlsx/xls) 파일만 업로드할 수 있습니다.");
			return;
		}
		setSelectedFile(file);
		if (inputRef.current) inputRef.current.value = "";
	};

	// ── Step1: 파일 업로드 → preview ────────────────────────────────────────────
	const handlePreview = async () => {
		if (!selectedFile) {
			alert("파일을 먼저 선택해주세요.");
			return;
		}
		setLoading(true);
		setLoadingMessage("파일을 분석하는 중입니다...");
		try {
			const res = await wipService.previewFile(selectedFile);
			const data = res.data?.data ?? {};
			setToUpdate(data.to_update ?? []);
			setToCreate(data.to_create ?? []);

			// missing_in_file이 삭제 후보
			const deleteCandidates = data.missing_in_file ?? [];
			setToDelete(deleteCandidates);
			setSkipped(data.skipped ?? []);
			setUnchanged(data.unchanged_count ?? data.unchanged ?? 0);

			// 기본값: 추가·변경은 전체 선택, 삭제는 전체 미선택 (안전)
			setSelectedUpdates(new Set((data.to_update ?? []).map((_, i) => i)));
			setSelectedCreates(new Set((data.to_create ?? []).map((_, i) => i)));
			setSelectedDeletes(new Set()); // ← 삭제는 기본 미선택 (실수 방지)

			setStep(STEPS.REVIEW);
		} catch (err) {
			alert(
				err.response?.data?.detail ??
					err.message ??
					"파일 분석에 실패했습니다.",
			);
		} finally {
			setLoading(false);
		}
	};

	// ── Step2: 선택 항목 confirm + delete 병렬 처리 ───────────────────────────
	const handleConfirm = async () => {
		const updates = [...selectedUpdates].map((i) => ({
			wip_id: toUpdate[i].wip_id,
			after: toUpdate[i].after,
		}));
		const creates = [...selectedCreates].map((i) => ({
			qr_code: toCreate[i].qr_code,
			qr_id: toCreate[i].qr_id ?? null,
			fields: toCreate[i].fields,
		}));
		const deleteIds = [...selectedDeletes]
			.map((i) => toDelete[i].wip_id)
			.filter(Boolean);

		const hasConfirm = updates.length + creates.length > 0;
		const hasDelete = deleteIds.length > 0;

		if (!hasConfirm && !hasDelete) {
			alert("반영할 항목을 하나 이상 선택해주세요.");
			return;
		}

		setLoading(true);
		setLoadingMessage("DB에 반영하는 중입니다...");

		try {
			// confirm과 delete를 병렬 처리
			const [confirmRes, deleteRes] = await Promise.all([
				hasConfirm
					? wipService.confirmImport(updates, creates)
					: Promise.resolve(null),
				hasDelete ? wipService.deleteWips(deleteIds) : Promise.resolve(null),
			]);

			const confirmData = confirmRes?.data?.data ?? {};
			const deleteData = deleteRes?.data?.data ?? {};

			const allSkipped = [
				...(confirmData.skipped ?? []),
				...(deleteData.skipped ?? []),
			];

			setResultSummary({
				created: confirmData.created_count ?? 0,
				updated: confirmData.updated_count ?? 0,
				deleted: deleteData.deleted_count ?? 0,
				skipped: allSkipped.length,
				skippedList: allSkipped,
			});

			setStep(STEPS.DONE);
			onImportDone?.();
		} catch (err) {
			alert(
				err.response?.data?.detail ?? err.message ?? "반영에 실패했습니다.",
			);
		} finally {
			setLoading(false);
		}
	};

	// ── 토글 헬퍼 ────────────────────────────────────────────────────────────────
	const makeToggle = (setter) => (i) =>
		setter((prev) => {
			const next = new Set(prev);
			next.has(i) ? next.delete(i) : next.add(i);
			return next;
		});

	const makeToggleAll = (items, setter) => (force) =>
		setter((prev) => {
			const shouldSelectAll =
				force !== undefined ? force : prev.size !== items.length;
			return shouldSelectAll ? new Set(items.map((_, i) => i)) : new Set();
		});

	// 삭제 전체 선택은 생산 투입 중인 항목 제외
	const makeToggleAllDeletes = (items, setter) => (force) =>
		setter((prev) => {
			const eligible = items
				.map((item, i) => ({ item, i }))
				.filter(
					({ item }) =>
						item.status !== "CONSUMED" && item.status !== "RESERVATED",
				)
				.map(({ i }) => i);
			const shouldSelectAll =
				force !== undefined ? force : prev.size !== eligible.length;
			return shouldSelectAll ? new Set(eligible) : new Set();
		});

	const totalSelected =
		selectedUpdates.size + selectedCreates.size + selectedDeletes.size;

	// ── 렌더 ──────────────────────────────────────────────────────────────────
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]">
			<div className="w-full max-w-3xl bg-surface-container-lowest rounded-modal shadow-[0_40px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
				{/* 헤더 */}
				<div className="flex items-center justify-between px-8 py-6 border-b border-surface-container shrink-0">
					<div className="flex items-center gap-3">
						<h2 className="font-headline font-bold text-xl text-on-surface">
							재고 Import
						</h2>
						<StepIndicator current={step} />
					</div>
					<button
						type="button"
						className="text-on-surface-variant hover:text-on-surface transition-colors"
						onClick={onClose}
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				{/* 바디 */}
				<div className="flex-1 overflow-y-auto p-8 space-y-6">
					{step === STEPS.UPLOAD && (
						<UploadStep
							inputRef={inputRef}
							selectedFile={selectedFile}
							onFileSelect={handleFileSelect}
							onClearFile={() => {
								setSelectedFile(null);
								if (inputRef.current) inputRef.current.value = "";
							}}
						/>
					)}
					{step === STEPS.REVIEW && (
						<ReviewStep
							toUpdate={toUpdate}
							toCreate={toCreate}
							toDelete={toDelete}
							skipped={skipped}
							unchanged={unchanged}
							selectedUpdates={selectedUpdates}
							selectedCreates={selectedCreates}
							selectedDeletes={selectedDeletes}
							onToggleUpdate={makeToggle(setSelectedUpdates)}
							onToggleCreate={makeToggle(setSelectedCreates)}
							onToggleDelete={makeToggle(setSelectedDeletes)}
							onToggleAllUpdates={makeToggleAll(toUpdate, setSelectedUpdates)}
							onToggleAllCreates={makeToggleAll(toCreate, setSelectedCreates)}
							onToggleAllDeletes={makeToggleAllDeletes(
								toDelete,
								setSelectedDeletes,
							)}
						/>
					)}
					{step === STEPS.DONE && <DoneStep summary={resultSummary} />}
				</div>

				{/* 푸터 */}
				<div className="flex justify-end gap-3 px-8 py-5 border-t border-surface-container shrink-0 bg-surface-container-low/40">
					{step === STEPS.UPLOAD && (
						<>
							<button
								type="button"
								className="px-5 py-3 rounded-lg bg-surface-container text-on-surface font-medium hover:bg-surface-container-high transition-colors"
								onClick={onClose}
							>
								취소
							</button>
							<button
								type="button"
								disabled={!selectedFile}
								className={`px-5 py-3 rounded-lg font-semibold transition-all ${
									selectedFile
										? "bg-primary text-white hover:bg-primary-dim active:scale-95"
										: "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60"
								}`}
								onClick={handlePreview}
							>
								변동사항 확인
							</button>
						</>
					)}
					{step === STEPS.REVIEW && (
						<>
							<button
								type="button"
								className="px-5 py-3 rounded-lg bg-surface-container text-on-surface font-medium hover:bg-surface-container-high transition-colors"
								onClick={() => setStep(STEPS.UPLOAD)}
							>
								이전
							</button>
							<button
								type="button"
								disabled={totalSelected === 0}
								className={`px-5 py-3 rounded-lg font-semibold transition-all ${
									totalSelected > 0
										? "bg-primary text-white hover:bg-primary-dim active:scale-95"
										: "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60"
								}`}
								onClick={handleConfirm}
							>
								업로드 ({totalSelected}건 반영)
							</button>
						</>
					)}
					{step === STEPS.DONE && (
						<button
							type="button"
							className="px-5 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dim transition-colors"
							onClick={onClose}
						>
							닫기
						</button>
					)}
				</div>
			</div>

			{loading && <Web_LoadingModal message={loadingMessage} />}
		</div>
	);
}
