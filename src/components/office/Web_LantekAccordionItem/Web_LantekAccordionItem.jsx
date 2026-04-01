import { useState } from "react";

export default function Web_LantekAccordionItem({ row, index }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
      <button
        type="button"
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-surface-container-low"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-6">
          <div className="bg-primary-container text-primary w-10 h-10 rounded-lg flex items-center justify-center font-bold">
            {index + 1}
          </div>
          <div className="text-left">
            <div className="font-headline font-bold text-on-surface">
              {row.qrNumber} - {row.thickness}T / {row.width} / {row.length}
            </div>
            <div className="text-xs text-on-surface-variant font-medium">
              두께: {row.thickness}mm | 폭: {row.width}mm | 길이: {row.length}mm
            </div>
          </div>
        </div>

        <span className="material-symbols-outlined text-on-surface-variant">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-outline-variant/10 bg-surface-container-low/40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-on-surface-variant text-xs">부재명</p>
              <p className="font-medium">{row.memberName}</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs">예상 시간</p>
              <p className="font-medium">{row.estimatedTime}</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs">수량</p>
              <p className="font-medium">{row.quantity}</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs">비고</p>
              <p className="font-medium">{row.note || "-"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
