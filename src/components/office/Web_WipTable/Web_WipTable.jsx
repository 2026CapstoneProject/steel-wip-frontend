function formatNumber(value) {
  return Number(value).toLocaleString();
}

export default function Web_WipTable({ rows = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low/50">
            <th className="px-4 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label">
              QR번호
            </th>
            <th className="px-4 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label">
              제강사
            </th>
            <th className="px-4 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label">
              재질
            </th>
            <th className="px-4 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label text-right">
              두께
            </th>
            <th className="px-4 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label text-right">
              폭
            </th>
            <th className="px-4 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label text-right">
              길이
            </th>
            <th className="px-4 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label text-right">
              중량 (kg)
            </th>
            <th className="px-4 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label">
              위치
            </th>
            <th className="px-6 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label text-center">
              층
            </th>
          </tr>
        </thead>

        <tbody className="divide-y-0">
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className={`group transition-colors hover:bg-surface-container-low ${
                index % 2 === 1 ? "bg-surface-container-low" : ""
              }`}
            >
              <td className="px-4 py-4 text-sm font-semibold text-primary">
                {row.qrNumber}
              </td>
              <td className="px-4 py-4 text-sm text-on-surface">
                {row.manufacturer}
              </td>
              <td className="px-4 py-4 text-sm text-on-surface">
                {row.material}
              </td>
              <td className="px-4 py-4 text-sm text-on-surface text-right font-mono">
                {row.thickness}
              </td>
              <td className="px-4 py-4 text-sm text-on-surface text-right font-mono">
                {formatNumber(row.width)}
              </td>
              <td className="px-4 py-4 text-sm text-on-surface text-right font-mono">
                {formatNumber(row.length)}
              </td>
              <td className="px-4 py-4 text-sm text-on-surface text-right font-semibold">
                {formatNumber(row.weight)}
              </td>
              <td className="px-4 py-4 text-sm text-on-surface-variant">
                {row.location}
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm text-on-surface font-medium">
                  {row.layer}
                </span>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={9}
                className="px-6 py-12 text-center text-sm text-on-surface-variant"
              >
                조회 결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
