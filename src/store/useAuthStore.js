import { create } from 'zustand';

// 로그인 상태 전역 관리 (생산계획자 / 현장직 역할 분기에 사용)
const useAuthStore = create((set) => ({
  user: null,        // { id, username, role: 'OFFICE' | 'FIELD' }
  isLoggedIn: false,

  setUser: (user) => set({ user, isLoggedIn: true }),
  clearUser: () => set({ user: null, isLoggedIn: false }),
}));

export default useAuthStore;
