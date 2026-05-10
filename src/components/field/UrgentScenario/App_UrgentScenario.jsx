import React from "react";

const App_UrgentScenario = ({ visible = false, onClick = () => {} }) => {
	if (!visible) return null;

	return (
		<div className="pointer-events-none fixed left-1/2 top-[84px] z-[60] w-[calc(100%-32px)] max-w-md -translate-x-1/2">
			<button
				type="button"
				onClick={onClick}
				className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-[#5B56C8]/90 px-5 py-4 text-left text-white shadow-2xl backdrop-blur-sm transition active:scale-[0.99]"
			>
				<span className="material-symbols-outlined text-[34px] leading-none text-indigo-100">
					info
				</span>

				<div className="min-w-0 flex-1">
					<p className="truncate text-[15px] font-bold">
						긴급 발주가 발행되었습니다
					</p>
					<p className="mt-0.5 text-[12px] font-medium text-indigo-100/90">
						눌러서 정보를 확인하세요
					</p>
				</div>

				<span className="material-symbols-outlined text-[34px] leading-none text-indigo-100">
					chevron_right
				</span>
			</button>
		</div>
	);
};

export default App_UrgentScenario;