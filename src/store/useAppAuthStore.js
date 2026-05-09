import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAppAuthStore = create(
	persist(
		(set) => ({
			user: null,
			token: null,
			isLoggedIn: false,

			setUser: (user, token) => set({ user, token, isLoggedIn: true }),
			clearUser: () => set({ user: null, token: null, isLoggedIn: false }),
		}),
		{
			name: "auth-storage-field", // ← FIELD 전용 키
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				isLoggedIn: state.isLoggedIn,
			}),
		},
	),
);

export default useAppAuthStore;
