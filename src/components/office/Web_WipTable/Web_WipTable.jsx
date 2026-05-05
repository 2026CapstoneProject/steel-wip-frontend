function formatNumber(value) {
	return Number(value).toLocaleString();
}

function getStatusMeta(status) {
	switch (status) {
		case "RESERVATED":
			return {
				rowClass: "bg-amber-50/80 hover:bg-amber-50 text-on-surface",
				qrClass: "text-amber-700",
				subTextClass: "text-amber-700/80",
				badgeClass: "bg-amber-100 text-amber-800 border border-amber-200",
				badgeLabel: "사용 예정",
				helperText: "생산 계획에 할당된 재고로 현재 사용할 수 없습니다.",
			};

		case "REGISTERED":
			return {
				rowClass: "bg-slate-100/90 hover:bg-slate-100 text-on-surface-variant",
				qrClass: "text-slate-600",
				subTextClass: "text-slate-500",
				badgeClass: "bg-slate-200 text-slate-700 border border-slate-300",
				badgeLabel: "미적재",
				helperText: "생산 후 적재 예정인 재공품으로 아직 사용할 수 없습니다.",
			};

		case "IN_STOCK":
		default:
			return {
				rowClass: "text-on-surface",
				qrClass: "text-primary",
				subTextClass: "hidden",
				badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
				badgeLabel: "가용",
				helperText: "",
			};
	}
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
						<th className="px-4 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label text-right">
							위치
						</th>
						<th className="px-6 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label text-right">
							층
						</th>

						<th className="px-4 py-4 text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-widest font-label text-center">
							상태
						</th>
					</tr>
				</thead>

				<tbody className="divide-y divide-outline-variant/10">
					{rows.map((row, index) => {
						const statusMeta = getStatusMeta(row.status);
						const isDisabledStatus =
							row.status === "RESERVATED" || row.status === "REGISTERED";

						return (
							<tr
								key={row.id}
								className={`group transition-colors ${
									index % 2 === 1 && row.status === "IN_STOCK"
										? "bg-surface-container-low"
										: ""
								} ${statusMeta.rowClass}`}
							>
								<td className="px-4 py-4">
									<div className="flex flex-col gap-1">
										<span
											className={`text-sm font-semibold ${statusMeta.qrClass}`}
										>
											{row.qrNumber}
										</span>
										{isDisabledStatus && (
											<span className={`text-xs ${statusMeta.subTextClass}`}>
												{statusMeta.helperText}
											</span>
										)}
									</div>
								</td>

								<td className="px-4 py-4 text-sm">{row.manufacturer}</td>

								<td className="px-4 py-4 text-sm">{row.material}</td>

								<td className="px-4 py-4 text-sm text-right font-mono">
									{row.thickness}
								</td>

								<td className="px-4 py-4 text-sm text-right font-mono">
									{formatNumber(row.width)}
								</td>

								<td className="px-4 py-4 text-sm text-right font-mono">
									{formatNumber(row.length)}
								</td>

								<td className="px-4 py-4 text-sm text-right font-mono">
									{formatNumber(row.weight)}
								</td>

								<td className="px-4 py-4 text-sm text-right">{row.location}</td>

								<td className="px-6 py-4 text-sm text-right">{row.layer}</td>
								<td className="px-4 py-4 text-center">
									<span
										className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
									>
										{statusMeta.badgeLabel}
									</span>
								</td>
							</tr>
						);
					})}

					{rows.length === 0 && (
						<tr>
							<td
								colSpan={10}
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
