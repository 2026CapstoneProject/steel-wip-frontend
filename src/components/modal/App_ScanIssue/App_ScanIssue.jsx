const App_ScanIssue = ({
	isOpen,
	title = "QR 정보 확인",
	description = "아래 상세 정보와 스캔하려는 QR 정보가 맞나요?",
	details = [],
	onCancel,
	onConfirm,
}) => {
	if (!isOpen) return null;

	const visibleDetails = details.filter(
		(item) =>
			item?.label &&
			item?.value !== undefined &&
			item?.value !== null &&
			item?.value !== "",
	);

	return (
		<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
			<div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl">
				<div className="mb-5 flex flex-col items-center text-center">
					<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#3F51B5]/10">
						<span className="material-symbols-outlined text-3xl text-[#24389C]">
							qr_code_2
						</span>
					</div>

					<h2 className="text-xl font-extrabold text-[#191C1E]">
						{title}
					</h2>

					<p className="mt-2 text-sm leading-relaxed text-[#505F76]">
						{description}
					</p>
				</div>

				<div className="mb-6 rounded-2xl bg-[#F7F9FB] p-4">
					<div className="space-y-3">
						{visibleDetails.map((item) => (
							<div
								key={item.label}
								className="flex items-start justify-between gap-4"
							>
								<p className="shrink-0 text-sm font-semibold text-[#6B7688]">
									{item.label}
								</p>
								<p className="text-right text-sm font-bold text-[#191C1E]">
									{item.value}
								</p>
							</div>
						))}
					</div>
				</div>

				<p className="mb-5 text-center text-base font-bold text-[#191C1E]">
					해당 정보가 맞나요?
				</p>

				<div className="grid grid-cols-2 gap-3">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-xl bg-[#ECEEF0] py-3 text-sm font-bold text-[#505F76] transition active:scale-95"
					>
						아니오
					</button>

					<button
						type="button"
						onClick={onConfirm}
						className="rounded-xl bg-[#24389C] py-3 text-sm font-bold text-white shadow-lg shadow-[#24389C]/20 transition active:scale-95"
					>
						예
					</button>
				</div>
			</div>
		</div>
	);
};

export default App_ScanIssue;