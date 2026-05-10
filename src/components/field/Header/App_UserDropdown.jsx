import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import useAppAuthStore from "../../../store/useAppAuthStore";

const App_UserDropdown = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
	const btnRef = useRef(null);
	const panelRef = useRef(null); // ← 추가
	const navigate = useNavigate();
	const { user, clearUser } = useAppAuthStore();

	const handleToggle = () => {
		if (!isOpen && btnRef.current) {
			const rect = btnRef.current.getBoundingClientRect();
			setPanelPos({
				top: rect.bottom + 8,
				right: window.innerWidth - rect.right,
			});
		}
		setIsOpen((prev) => !prev);
	};

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e) => {
			// 트리거 버튼도, 패널도 아닌 곳을 클릭했을 때만 닫기
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

	const handleLogout = () => {
		setIsOpen(false);
		clearUser();
		navigate("/App/login");
	};

	return (
		<>
			<button
				ref={btnRef}
				type="button"
				onClick={handleToggle}
				aria-label="account menu"
				aria-expanded={isOpen}
				className="flex h-11 w-11 items-center justify-center"
			>
				<span className="material-symbols-outlined text-[38px] leading-none text-slate-700">
					account_circle
				</span>
			</button>

			{isOpen &&
				createPortal(
					<div
						ref={panelRef} // ← 추가
						className="fixed z-[9999] w-44 rounded-xl border border-slate-100 bg-white shadow-lg"
						style={{ top: panelPos.top, right: panelPos.right }}
					>
						<div className="border-b border-slate-100 px-4 py-3">
							<p className="text-sm font-semibold text-slate-800">
								{user?.name ?? user?.username ?? "사용자"}
							</p>
							<p className="mt-0.5 text-xs text-slate-400">
								{user?.role ?? "현장 작업자"}
							</p>
						</div>
						<button
							type="button"
							onClick={handleLogout}
							className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 transition hover:bg-red-50 active:bg-red-100 rounded-b-xl"
						>
							<span className="material-symbols-outlined text-[18px] leading-none">
								logout
							</span>
							로그아웃
						</button>
					</div>,
					document.body,
				)}
		</>
	);
};

export default App_UserDropdown;
