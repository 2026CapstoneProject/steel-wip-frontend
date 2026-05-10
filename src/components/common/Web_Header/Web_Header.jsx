import { useState } from "react";
import Web_AccountDropdown from "./Web_AccountDropdown";

export default function Web_Header({ title }) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 h-16 glass-effect flex justify-between items-center px-8 border-b border-slate-200/20">
			<div className="flex items-center gap-4">
				<h2 className="text-xl font-bold font-headline text-on-surface">
					{title}
				</h2>
			</div>

			<div className="flex items-center gap-6 flex-1 justify-end max-w-3xl">
				<div className="flex items-center gap-3">
					<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
						<span className="material-symbols-outlined">notifications</span>
					</button>
					<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
						<span className="material-symbols-outlined">settings</span>
					</button>
					{/* account_circle 버튼 (드롭다운 토글) */}
					<div className="relative">
						<button
							onClick={() => setIsDropdownOpen((prev) => !prev)}
							className="p-2 text-on-surface-variant hover:text-primary transition-colors"
							aria-label="계정 메뉴"
						>
							<span className="material-symbols-outlined">account_circle</span>
						</button>

						{isDropdownOpen && (
							<Web_AccountDropdown onClose={() => setIsDropdownOpen(false)} />
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
