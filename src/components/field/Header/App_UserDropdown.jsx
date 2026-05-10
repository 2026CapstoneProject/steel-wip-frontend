// src/components/field/Header/App_UserDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/useAuthStore";

const App_UserDropdown = () => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();
	const { user, clearUser } = useAuthStore();

	// 외부 클릭 시 닫기
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		clearUser();
		navigate("/App/login");
	};

	return (
		<div className="relative" ref={dropdownRef}>
			{/* 트리거 버튼 */}
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-label="account menu"
				aria-expanded={isOpen}
				className="flex h-11 w-11 items-center justify-center"
			>
				<span className="material-symbols-outlined text-[38px] leading-none text-slate-700">
					account_circle
				</span>
			</button>

			{/* 드롭다운 패널 */}
			{isOpen && (
				<div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-slate-100 bg-white shadow-lg">
					{/* 사용자 정보 */}
					<div className="border-b border-slate-100 px-4 py-3">
						<p className="text-sm font-semibold text-slate-800">
							{user?.name ?? user?.username ?? "사용자"}
						</p>
						<p className="mt-0.5 text-xs text-slate-400">
							{user?.role ?? "현장 작업자"}
						</p>
					</div>

					{/* 로그아웃 */}
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
				</div>
			)}
		</div>
	);
};

export default App_UserDropdown;
