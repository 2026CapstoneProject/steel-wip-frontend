import { useRef, useState } from "react";

export default function Web_LantekUploadModal({
  tempSavedFile,
  onClose,
  onUpload,
}) {
  const inputRef = useRef(null);

  const [uploadedHistory, setUploadedHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const formatUploadTime = (date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      alert("지원하지 않는 파일 형식 입니다");
      return;
    }

    setSelectedFile(file);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleConfirmUpload = () => {
    if (!selectedFile) {
      alert("파일을 먼저 선택해주세요.");
      return;
    }

    const parsedRows = [
      {
        id: 1,
        qrNumber: "QR0001",
        thickness: 6,
        width: 1024,
        length: 6096,
        estimatedCuttingTime: "01:45:20",
        residuals: [
          {
            id: "1-1",
            thickness: 6.0,
            width: 1022,
            length: 3000,
            weight: 70.2,
            memo: "A 구역 보관",
          },
          {
            id: "1-2",
            thickness: 6.0,
            width: 500,
            length: 6094,
            weight: 72.3,
            memo: "",
          },
        ],
      },
      {
        id: 2,
        qrNumber: "QR0002",
        thickness: 12,
        width: 1524,
        length: 8000,
        estimatedCuttingTime: "00:58:10",
        residuals: [
          {
            id: "2-1",
            thickness: 12.0,
            width: 700,
            length: 2500,
            weight: 110.4,
            memo: "",
          },
        ],
      },
    ];

    const newHistory = {
      id: Date.now(),
      fileName: selectedFile.name,
      uploadedAt: formatUploadTime(new Date()),
    };

    setUploadedHistory((prev) => [newHistory, ...prev]);
    onUpload(selectedFile, parsedRows);
    setSelectedFile(null);
  };

  const handleDeleteHistory = (targetId) => {
    setUploadedHistory((prev) => prev.filter((item) => item.id !== targetId));
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
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />

          <div className="w-full min-h-[220px] border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low flex flex-col items-center justify-center p-6 text-center">
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

          {selectedFile && (
            <div className="rounded-xl border border-primary/20 bg-primary-container/30 px-4 py-4">
              <p className="text-sm text-on-surface-variant mb-1">
                선택한 파일
              </p>
              <p className="font-semibold text-on-surface">
                {selectedFile.name}
              </p>
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
            >
              취소
            </button>
            <button
              type="button"
              className={`px-5 py-3 rounded-lg font-semibold ${
                selectedFile
                  ? "bg-primary text-white hover:bg-primary-dim"
                  : "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60"
              }`}
              onClick={handleConfirmUpload}
              disabled={!selectedFile}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
