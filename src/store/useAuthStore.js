import { create } from "zustand";

import { persist } from "zustand/middleware";

// 로그인 상태 전역 관리 (생산계획자 / 현장직 역할 분기에 사용)
const useAuthStore = create(
	persist(
		(set) => ({
			user: null,
			token: null,
			isLoggedIn: false,

			setUser: (user, token) => set({ user, token, isLoggedIn: true }),
			clearUser: () => set({ user: null, token: null, isLoggedIn: false }),
		}),
		{
			name: "auth-storage", // localStorage 키 이름
			partialize: (state) => ({
				// 저장할 필드만 선택 (보안상 필요한 것만)
				user: state.user,
				token: state.token,
				isLoggedIn: state.isLoggedIn,
			}),
		},
	),
);

export default useAuthStore;
