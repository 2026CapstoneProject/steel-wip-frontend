import useAuthStore from '../store/useAuthStore';

// 인증 상태 접근 훅
export const useAuth = () => {
  const { user, isLoggedIn, setUser, clearUser } = useAuthStore();
  return { user, isLoggedIn, setUser, clearUser };
};
