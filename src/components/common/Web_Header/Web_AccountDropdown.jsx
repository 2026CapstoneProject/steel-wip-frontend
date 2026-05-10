import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/useAuthStore";
import authService from "../../../services/authService";

export default function Web_AccountDropdown({ onClose }) {
	const { user } = useAuthStore();
	const navigate = useNavigate();
	const dropdownRef = useRef(null);

	// 드롭다운 바깥 클릭 시 닫기
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	const handleLogout = async () => {
		try {
			await authService.logout();
		} catch (_) {
			// 토큰 만료 등 오류여도 프론트는 초기화
		} finally {
			useAuthStore.getState().clearUser();
			navigate("/office/login");
		}
	};

	return (
		<div
			ref={dropdownRef}
			className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200/30 bg-white/90 backdrop-blur-md shadow-lg z-50 overflow-hidden"
		>
			{/* 계정 정보 */}
			<div className="px-4 py-3 border-b border-slate-200/30">
				<p className="text-xs text-on-surface-variant mb-0.5">로그인 계정</p>
				<p className="text-sm font-semibold text-on-surface truncate">
					{user?.username ?? "-"}
				</p>
				<span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
					{user?.role === "OFFICE" ? "사무실" : (user?.role ?? "-")}
				</span>
			</div>

			{/* 로그아웃 버튼 */}
			<button
				onClick={handleLogout}
				className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
			>
				<span className="material-symbols-outlined text-[18px]">logout</span>
				로그아웃
			</button>
		</div>
	);
}
