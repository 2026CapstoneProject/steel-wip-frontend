import React from "react";

const NextScenarioToast = ({ visible, onClick }) => {
	if (!visible) return null;

	return (
		<div className="pointer-events-none fixed left-1/2 top-[84px] z-[60] w-[calc(100%-32px)] max-w-md -translate-x-1/2">
			<button
				type="button"
				onClick={onClick}
				className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-[#5B56C8]/90 px-5 py-4 text-left text-white shadow-2xl backdrop-blur-sm transition active:scale-[0.99]"
			>
				<span className="material-symbols-outlined text-indigo-100">info</span>

				<div className="min-w-0 flex-1">
					<p className="truncate text-[15px] font-bold">
						작업이 완료되었습니다
					</p>
					<p className="mt-0.5 text-[12px] text-indigo-100/90">
						눌러서 다음 시나리오 진행 여부를 확인하세요
					</p>
				</div>

				<span className="material-symbols-outlined text-indigo-100">
					chevron_right
				</span>
			</button>
		</div>
	);
};

const NextScenarioSelectModal = ({ visible, onNoClick, onYesClick }) => {
	if (!visible) return null;

	return (
		<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-6 backdrop-blur-[2px]">
			<div className="w-full max-w-sm rounded-[28px] bg-white p-8 shadow-2xl">
				<p className="mb-8 text-center text-[20px] font-bold leading-[1.35] text-slate-900">
					다음 시나리오를
					<br />
					이행하시겠습니까?
				</p>

				<div className="flex w-full gap-3">
					<button
						type="button"
						onClick={onNoClick}
						className="flex-1 rounded-2xl bg-slate-100 px-6 py-4 text-base font-bold text-slate-800 transition active:scale-95"
					>
						아니오
					</button>

					<button
						type="button"
						onClick={onYesClick}
						className="flex-1 rounded-2xl bg-[#3F46B5] px-6 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/20 transition active:scale-95"
					>
						네
					</button>
				</div>
			</div>
		</div>
	);
};

const App_NextScenario = ({
	showToast,
	showSelectModal,
	onToastClick,
	onNoClick,
	onYesClick,
}) => {
	return (
		<>
			<NextScenarioToast visible={showToast} onClick={onToastClick} />

			<NextScenarioSelectModal
				visible={showSelectModal}
				onNoClick={onNoClick}
				onYesClick={onYesClick}
			/>
		</>
	);
};

export default App_NextScenario;
