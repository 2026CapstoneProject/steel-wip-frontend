import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const App_NotificationDropdown = ({
	hasUnreadAlert = false,
	notifications = [],
	onNotificationOpen = () => {},
	onNotificationItemClick = () => {},
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
	const btnRef = useRef(null);
	const panelRef = useRef(null);

	const notificationItems = Array.isArray(notifications) ? notifications : [];

	const handleToggle = () => {
		const nextOpen = !isOpen;

		if (nextOpen && btnRef.current) {
			const rect = btnRef.current.getBoundingClientRect();

			setPanelPos({
				top: rect.bottom + 8,
				right: Math.max(16, window.innerWidth - rect.right),
			});

			onNotificationOpen();
		}

		setIsOpen(nextOpen);
	};

	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e) => {
			if (
				btnRef.current &&
				!btnRef.current.contains(e.target) &&
				panelRef.current &&
				!panelRef.current.contains(e.target)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	const handleNotificationClick = (notification) => {
		setIsOpen(false);
		onNotificationItemClick(notification);
	};

	return (
		<>
			<button
				ref={btnRef}
				type="button"
				onClick={handleToggle}
				className="relative flex h-11 w-11 items-center justify-center"
				aria-label="notifications"
				aria-expanded={isOpen}
			>
				<span className="material-symbols-outlined text-[34px] leading-none text-slate-700">
					notifications
				</span>

				{hasUnreadAlert && (
					<span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#D32F2F] ring-2 ring-white" />
				)}
			</button>

			{isOpen &&
				createPortal(
					<div
						ref={panelRef}
						className="fixed z-[9999] w-[280px] max-w-[calc(100vw-32px)] rounded-xl border border-slate-100 bg-white shadow-lg"
						style={{ top: panelPos.top, right: panelPos.right }}
					>
						<div className="border-b border-slate-100 px-4 py-3">
							<p className="text-sm font-bold text-slate-800">알림</p>
							
						</div>

						{notificationItems.length > 0 ? (
							<div className="py-1">
								{notificationItems.map((notification) => (
									<button
										key={notification.id}
										type="button"
										onClick={() => handleNotificationClick(notification)}
										className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100"
									>
										<span className="material-symbols-outlined mt-0.5 text-[22px] leading-none text-[#3F51B5]">
											{notification.icon ?? "notifications_active"}
										</span>

										<div className="min-w-0 flex-1">
											<p className="text-[13px] font-bold text-slate-900">
												{notification.title}
											</p>
											<p className="mt-1 text-[11px] leading-[1.4] text-slate-500">
												{notification.description}
											</p>
										</div>

										<span className="material-symbols-outlined mt-1 text-[18px] leading-none text-slate-300">
											chevron_right
										</span>
									</button>
								))}
							</div>
						) : (
							<div className="px-4 py-5 text-center">
								<p className="text-xs font-medium text-slate-400">
									확인할 알림이 없습니다.
								</p>
							</div>
						)}
					</div>,
					document.body,
				)}
		</>
	);
};

export default App_NotificationDropdown;