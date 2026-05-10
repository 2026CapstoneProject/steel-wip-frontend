import React from "react";
import { useNavigate } from "react-router-dom";
import steelAllLogo from "../../../assets/Steel_all_CI_align_1st.png";

import App_UserDropdown from "./App_UserDropdown";

const App_Header = ({
	hasUnreadAlert = false,
	onNotificationClick = () => {},
	showBackButton = false,
}) => {
	const navigate = useNavigate();

	const handleBackClick = () => {
		navigate("/App/start");
	};

	const handleLogoClick = () => {
		navigate("/App/ready");
	};

	return (
		<header className="shrink-0 border-b border-slate-100 bg-white">
			<div className="mx-auto flex h-[72px] w-full max-w-md items-center justify-between px-6">
				<div className="flex items-center gap-4">
					{showBackButton && (
						<button
							type="button"
							onClick={handleBackClick}
							aria-label="go to start page"
							className="flex h-10 w-10 items-center justify-center text-slate-700 transition active:scale-95"
						>
							<span className="material-symbols-outlined text-[38px] leading-none">
								arrow_back_ios_new
							</span>
						</button>
					)}

					<button
						type="button"
						onClick={handleLogoClick}
						className="flex items-center"
						aria-label="go to ready page"
					>
						<img
							src={steelAllLogo}
							alt="Steel-all"
							className="h-7 w-auto object-contain"
						/>
					</button>
				</div>

				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={onNotificationClick}
						className="relative flex h-11 w-11 items-center justify-center"
						aria-label="notifications"
					>
						<span className="material-symbols-outlined text-[34px] leading-none text-slate-700">
							notifications
						</span>

						{hasUnreadAlert && (
							<span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#D32F2F] ring-2 ring-white" />
						)}
					</button>

					<App_UserDropdown />
				</div>
			</div>
		</header>
	);
};

export default App_Header;
