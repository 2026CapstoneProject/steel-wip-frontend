import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import useAppAuthStore from "../store/useAppAuthStore";

const api = axios.create({
	baseURL:
		(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + "/api",
	headers: { "Content-Type": "application/json" },
	withCredentials: true, // ← HttpOnly Cookie 전송을 위해 필수
});

api.interceptors.request.use(
	(config) => {
		const path = window.location.pathname;
		const token = path.startsWith("/App")
			? useAppAuthStore.getState().token
			: useAuthStore.getState().token;
		if (token) config.headers.Authorization = `Bearer ${token}`;
		return config;
	},
	(error) => Promise.reject(error),
);

// 재시도 중 무한루프 방지 플래그
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach((prom) => {
		if (error) prom.reject(error);
		else prom.resolve(token);
	});
	failedQueue = [];
};

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			// refresh 엔드포인트 자체가 401이면 → 완전 로그아웃
			if (originalRequest.url?.includes("/auth/refresh")) {
				const path = window.location.pathname;
				if (path.startsWith("/App")) {
					useAppAuthStore.getState().clearUser();
					window.location.href = "/App/login";
				} else {
					useAuthStore.getState().clearUser();
					window.location.href = "/office/login";
				}
				return Promise.reject(error);
			}

			if (isRefreshing) {
				// 이미 refresh 중이면 대기열에 추가
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				}).then((token) => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					return api(originalRequest);
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				// Refresh Token으로 새 Access Token 요청
				const res = await api.post("/auth/refresh");
				const newToken = res.data.accessToken;

				// 스토어 토큰 갱신 (user 정보는 유지)
				const path = window.location.pathname;
				if (path.startsWith("/App")) {
					const currentUser = useAppAuthStore.getState().user;
					useAppAuthStore.getState().setUser(currentUser, newToken);
				} else {
					const currentUser = useAuthStore.getState().user;
					useAuthStore.getState().setUser(currentUser, newToken);
				}
				processQueue(null, newToken);
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return api(originalRequest); // 원래 요청 재시도
			} catch (refreshError) {
				processQueue(refreshError, null);
				const path = window.location.pathname;
				if (path.startsWith("/App")) {
					useAppAuthStore.getState().clearUser(); // ← FIELD 스토어 클리어
					window.location.href = "/App/login";
				} else {
					useAuthStore.getState().clearUser(); // ← OFFICE 스토어 클리어
					window.location.href = "/office/login";
				}
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		// 401 외 나머지 에러 처리
		let message = "서버 오류가 발생했습니다.";
		if (error.response?.data instanceof Blob) {
			const text = await error.response.data.text();
			try {
				message = JSON.parse(text).message || message;
			} catch {
				message = text || message;
			}
		} else {
			message = error.response?.data?.message || message;
		}
		console.error("[API Error]", message);
		return Promise.reject(error);
	},
);

export default api;
