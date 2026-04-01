import { useState } from "react";

export default function Web_LantekAccordionItem({ row, index }) {
  const [isOpen, setIsOpen] = useState(true);
  const [residuals, setResiduals] = useState(row.residuals || []);

  const handleMemoChange = (targetId, value) => {
    setResiduals((prev) =>
      prev.map((item) =>
        item.id === targetId
          ? {
              ...item,
              memo: value,
            }
          : item,
      ),
    );
  };

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
            <div className="font-headline font-bold text-on-surface text-[1.1rem]">
              {row.qrNumber} - {row.thickness}T / {row.width} / {row.length}
            </div>
            <div className="text-sm text-on-surface-variant font-medium">
              두께: {row.thickness}mm | 폭: {row.width}mm | 길이: {row.length}mm
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Estimated Time
            </div>
            <div className="text-2xl font-bold text-on-surface">
              {row.estimatedCuttingTime || "-"}
            </div>
          </div>

          <span className="material-symbols-outlined text-on-surface-variant">
            {isOpen ? "expand_less" : "expand_more"}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-outline-variant/10 bg-surface-container-low/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <span className="text-lg leading-none">•</span>
              <span>발생 잔재 정보 ({residuals.length})</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant">
                <tr>
                  <th className="px-4 py-4 text-center font-semibold">NO</th>
                  <th className="px-4 py-4 text-center font-semibold">
                    절단 후 두께(T)
                  </th>
                  <th className="px-4 py-4 text-center font-semibold">
                    절단 후 폭(MM)
                  </th>
                  <th className="px-4 py-4 text-center font-semibold">
                    절단 후 길이(MM)
                  </th>
                  <th className="px-4 py-4 text-center font-semibold">
                    절단 후 무게(KG)
                  </th>
                  <th className="px-4 py-4 text-center font-semibold">메모</th>
                </tr>
              </thead>

              <tbody>
                {residuals.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-outline-variant/10"
                  >
                    <td className="px-4 py-4 text-center font-semibold text-on-surface">
                      {item.id}
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={item.thickness}
                        readOnly
                        className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-on-surface"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={item.width}
                        readOnly
                        className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-on-surface"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={item.length}
                        readOnly
                        className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-on-surface"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={item.weight}
                        readOnly
                        className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-on-surface"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={item.memo}
                        onChange={(e) =>
                          handleMemoChange(item.id, e.target.value)
                        }
                        placeholder="메모 입력"
                        className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-on-surface placeholder:text-on-surface-variant"
                      />
                    </td>
                  </tr>
                ))}

                {residuals.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-on-surface-variant"
                    >
                      등록된 잔재 정보가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
