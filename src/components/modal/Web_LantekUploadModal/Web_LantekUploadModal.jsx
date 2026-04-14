import { useRef, useState } from "react";
import { importLantekData } from "../../../services/lantekService";

export default function Web_LantekUploadModal({
  scenarioId,
  tempSavedFile,
  onClose,
  onUpload,
}) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      alert("지원하지 않는 파일 형식입니다. PDF 파일을 선택해주세요.");
      return;
    }
    setSelectedFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) {
      alert("파일을 먼저 선택해주세요.");
      return;
    }
    if (!scenarioId) {
      alert("시나리오 ID가 없습니다. 생산계획명을 먼저 조회해주세요.");
      return;
    }

    setUploading(true);
    try {
      const response = await importLantekData(scenarioId, selectedFile);
      // 백엔드가 반환하는 LantekScenarioData[] (data 배열의 첫번째 항목)
      const lantekDataList = response.data?.data ?? [];
      onUpload(selectedFile, lantekDataList);
    } catch (err) {
      console.error("LANTEK import 실패:", err);
      const msg = err.response?.data?.message || "파일 업로드에 실패했습니다.";
      alert(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-modal shadow-[0_40px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-surface-container">
          <h2 className="font-headline font-bold text-xl text-on-surface">파일 업로드</h2>
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
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />

          <div
            className="w-full min-h-[220px] border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low flex flex-col items-center justify-center p-6 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelect(e.dataTransfer.files?.[0]);
            }}
          >
            <div className="mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined !text-3xl">upload_file</span>
            </div>
            <p className="font-body text-on-surface font-medium leading-relaxed max-w-xs mb-6">
              첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 눌러 파일을 직접 선택해주세요.
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

          {selectedFile && (
            <div className="rounded-xl border border-primary/20 bg-primary-container/30 px-4 py-4">
              <p className="text-sm text-on-surface-variant mb-1">선택한 파일</p>
              <p className="font-semibold text-on-surface">{selectedFile.name}</p>
            </div>
          )}

          {tempSavedFile && (
            <div className="rounded-lg bg-surface-container px-4 py-3 text-sm text-on-surface">
              임시저장 파일: <span className="font-semibold">{tempSavedFile.name}</span>
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
              disabled={!selectedFile || uploading}
              className={`px-5 py-3 rounded-lg font-semibold ${
                selectedFile && !uploading
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
    </div>
  );
}
