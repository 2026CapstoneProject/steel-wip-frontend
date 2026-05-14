import { useState } from "react";
import { updateNcCode } from "../../../services/scenarioService";

export default function Web_ScenarioTaskTable({
	rows = [],
	accentTextClass = "text-primary",
	timeHeaderLabel = "예상 소요시간(분)",
	scenarioId,
}) {
	const [openNcMenuKey, setOpenNcMenuKey] = useState(null);
	const [editingNcKey, setEditingNcKey] = useState(null);
	const [ncDraft, setNcDraft] = useState("");
	const [ncCodeMap, setNcCodeMap] = useState({});

	const hasNcCodeColumn = rows.some((row) => row.ncCode !== undefined);

	const getRowKey = (row, index) => `${row.qrNumber ?? "row"}-${index}`;

	const getNcCodeValue = (row, rowKey) => {
		return ncCodeMap[rowKey] ?? row.ncCode ?? "-";
	};

	const handleOpenNcMenu = (row, rowKey) => {
		setOpenNcMenuKey((prev) => (prev === rowKey ? null : rowKey));
		setEditingNcKey(null);
		setNcDraft(getNcCodeValue(row, rowKey));
	};

	const handleCloseNcMenu = () => {
		setOpenNcMenuKey(null);
		setEditingNcKey(null);
		setNcDraft("");
	};

	const handleStartEdit = (row, rowKey) => {
		setEditingNcKey(rowKey);
		setNcDraft(getNcCodeValue(row, rowKey));
	};

	const handleCancelEdit = () => {
		setEditingNcKey(null);
		setNcDraft("");
	};

	const handleConfirmEdit = async (row, rowKey) => {
		const trimmed = ncDraft.trim();
		console.log("확인 클릭:", {
			trimmed,
			batchItemId: row.batchItemId,
			scenarioId,
		});
		if (!trimmed || !row.batchItemId || !scenarioId) return;

		try {
			await updateNcCode(scenarioId, row.batchItemId, trimmed);
			setNcCodeMap((prev) => ({ ...prev, [rowKey]: trimmed }));
		} catch (err) {
			console.error("NC코드 수정 실패:", err);
			alert("NC코드 수정에 실패했습니다.");
		} finally {
			setOpenNcMenuKey(null);
			setEditingNcKey(null);
			setNcDraft("");
		}
	};

	return (
		<div className="overflow-visible rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
			<table className="w-full border-collapse text-left">
				<thead>
					<tr className="border-b border-outline-variant/10 bg-surface-container-low">
						<th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
							QR번호
						</th>
						<th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
							두께(T)
						</th>
						<th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
							폭(mm)
						</th>
						<th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
							길이(mm)
						</th>
						<th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
							초기 위치
						</th>
						<th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
							이동 위치
						</th>

						{hasNcCodeColumn && (
							<th className="px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
								NC Code
							</th>
						)}

						<th className="px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
							{timeHeaderLabel}
						</th>
					</tr>
				</thead>

				<tbody className="divide-y divide-surface-container-low">
					{rows.map((row, index) => {
						const rowKey = getRowKey(row, index);
						const ncCodeValue = getNcCodeValue(row, rowKey);
						const isNcMenuOpen = openNcMenuKey === rowKey;
						const isEditingNc = editingNcKey === rowKey;

						return (
							<tr
								key={rowKey}
								className="transition-colors hover:bg-surface-container-low/50"
							>
								<td
									className={`px-4 py-4 text-sm font-semibold ${accentTextClass}`}
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

								{hasNcCodeColumn && (
									<td className="px-4 py-4 text-center text-sm">
										{row.ncCode !== undefined ? (
											<div className="relative inline-flex justify-center">
												<button
													type="button"
													onClick={() => handleOpenNcMenu(row, rowKey)}
													className="font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary-dim"
												>
													{ncCodeValue}
												</button>

												{isNcMenuOpen && (
													<div className="absolute left-1/2 top-full z-40 mt-3 w-56 -translate-x-1/2 rounded-2xl border border-outline-variant/10 bg-white p-4 text-left shadow-xl">
														{isEditingNc ? (
															<div className="space-y-3">
																<p className="text-xs font-semibold text-on-surface-variant">
																	NC Code 수정
																</p>

																<input
																	type="text"
																	value={ncDraft}
																	onChange={(e) => setNcDraft(e.target.value)}
																	className="h-10 w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
																	autoFocus
																/>

																<div className="flex justify-end gap-2">
																	<button
																		type="button"
																		onClick={handleCancelEdit}
																		className="rounded-lg px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
																	>
																		취소
																	</button>
																	<button
																		type="button"
																		onClick={() =>
																			handleConfirmEdit(row, rowKey)
																		}
																		className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-dim"
																	>
																		확인
																	</button>
																</div>
															</div>
														) : (
															<div className="space-y-3">
																<div>
																	<p className="text-xs font-medium text-on-surface-variant">
																		NC Code
																	</p>
																	<p className="mt-1 text-sm font-bold text-on-surface">
																		{ncCodeValue}
																	</p>
																</div>

																<div className="flex justify-end gap-2 border-t border-outline-variant/10 pt-3">
																	<button
																		type="button"
																		onClick={handleCloseNcMenu}
																		className="rounded-lg px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
																	>
																		취소
																	</button>
																	<button
																		type="button"
																		onClick={() => handleStartEdit(row, rowKey)}
																		className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-dim"
																	>
																		수정
																	</button>
																</div>
															</div>
														)}
													</div>
												)}
											</div>
										) : (
											"-"
										)}
									</td>
								)}

								<td className="px-4 py-4 text-center text-sm">
									{row.estimatedTime}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
