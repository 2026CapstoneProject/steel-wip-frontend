import axios from 'axios';

// axios 기본 인스턴스 - 모든 API 호출에서 공통으로 사용
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 등 공통 헤더 자동 삽입
api.interceptors.request.use(
  (config) => {
    // TODO: 인증 토큰 추가
    // const token = useAuthStore.getState().token;
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 공통 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || '서버 오류가 발생했습니다.';
    console.error('[API Error]', message);
    return Promise.reject(error);
  }
);

export default api;
