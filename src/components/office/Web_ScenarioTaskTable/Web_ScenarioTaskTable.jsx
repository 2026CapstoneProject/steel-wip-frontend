export default function Web_ScenarioTaskTable({
  rows,
  accentTextClass = "text-primary",
}) {
  return (
    <div className="overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/10">
            <th className="px-4 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              QR번호
            </th>
            <th className="px-4 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              두께(T)
            </th>
            <th className="px-4 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              폭(mm)
            </th>
            <th className="px-4 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              길이(mm)
            </th>
            <th className="px-4 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              초기 위치
            </th>
            <th className="px-4 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              이동 위치
            </th>
            <th className="px-4 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider text-center">
              예상소요시간(min)
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-surface-container-low">
          {rows.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-surface-container-low/50 transition-colors"
            >
              <td
                className={`px-4 py-4 font-mono text-xs font-bold ${accentTextClass}`}
              >
                {row.qrNumber}
              </td>
              <td className="px-4 py-4 text-sm">{row.thickness}</td>
              <td className="px-4 py-4 text-sm">{row.width}</td>
              <td className="px-4 py-4 text-sm">{row.length}</td>
              <td className="px-4 py-4 text-sm">{row.from}</td>
              <td
                className={`px-4 py-4 text-sm font-semibold ${accentTextClass}`}
              >
                {row.to}
              </td>
              <td className="px-4 py-4 text-sm text-center">
                {row.estimatedTime}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
