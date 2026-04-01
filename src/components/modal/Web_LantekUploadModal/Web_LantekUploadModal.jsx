import { useRef, useState } from "react";

const mockUploadedHistory = [
  {
    id: 1,
    fileName: "tornado_lantek_result.pdf",
    uploadedAt: "2026-04-01 13:20",
  },
  {
    id: 2,
    fileName: "blizzard_cutting_plan.pdf",
    uploadedAt: "2026-04-01 13:21",
  },
];

export default function Web_LantekUploadModal({
  tempSavedFile,
  onClose,
  onUpload,
}) {
  const inputRef = useRef(null);
  const [uploadedHistory, setUploadedHistory] = useState(mockUploadedHistory);

  const handleFileSelect = (file) => {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      alert("지원하지 않는 파일 형식 입니다");
      return;
    }

    const parsedRows = [
      {
        id: 1,
        qrNumber: "QR0001",
        thickness: 6,
        width: 1024,
        length: 6096,
        memberName: "B1",
        estimatedTime: "00:12:30",
        quantity: 4,
        note: "",
      },
      {
        id: 2,
        qrNumber: "QR0002",
        thickness: 12,
        width: 1524,
        length: 8000,
        memberName: "B2",
        estimatedTime: "00:18:40",
        quantity: 2,
        note: "",
      },
      {
        id: 3,
        qrNumber: "QR0003",
        thickness: 9,
        width: 1524,
        length: 6096,
        memberName: "B3",
        estimatedTime: "00:10:10",
        quantity: 1,
        note: "발생 잔재 없음",
      },
    ];

    const newHistory = {
      id: Date.now(),
      fileName: file.name,
      uploadedAt: new Date().toLocaleString("ko-KR"),
    };

    setUploadedHistory((prev) => [newHistory, ...prev]);
    onUpload(file, parsedRows);
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
          <div className="relative group">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            <div className="w-full min-h-[220px] border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low flex flex-col items-center justify-center p-6 text-center transition-all group-hover:bg-surface-container group-hover:border-primary/40">
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

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined !text-sm">
                  check_circle
                </span>
                Support: PDF
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined !text-sm">info</span>
                Max Size: 50MB
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-headline font-bold text-base text-on-surface border-l-4 border-primary pl-3">
              업로드 파일
            </h3>

            {tempSavedFile && (
              <div className="rounded-lg bg-primary-container/40 px-4 py-3 text-sm text-on-surface">
                임시저장 파일:{" "}
                <span className="font-semibold">{tempSavedFile.name}</span>
              </div>
            )}

            <div className="border border-surface-container rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">파일명</th>
                    <th className="px-4 py-3">업로드 일시</th>
                    <th className="px-4 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {uploadedHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-container-low/50"
                    >
                      <td className="px-4 py-3">{item.fileName}</td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {item.uploadedAt}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="rounded-lg bg-secondary-container px-3 py-2 text-xs font-semibold text-on-secondary-container hover:bg-secondary-fixed-dim"
                        >
                          보기
                        </button>
                      </td>
                    </tr>
                  ))}

                  {uploadedHistory.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-on-surface-variant"
                      >
                        업로드 이력이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
