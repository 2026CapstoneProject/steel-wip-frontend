import { create } from 'zustand';

// 잔재 재고 목록 전역 상태 관리
const useWipStore = create((set) => ({
  wips: [],
  isLoading: false,
  error: null,

  setWips: (wips) => set({ wips }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export default useWipStore;
