import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const api = axios.create({
	baseURL:
		(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + "/api",
	headers: {
		"Content-Type": "application/json",
	},
});

// 요청 인터셉터: JWT 토큰 자동 삽입
api.interceptors.request.use(
	(config) => {
		const token = useAuthStore.getState().token; // ← TODO 제거, 실제 구현
		if (token) config.headers.Authorization = `Bearer ${token}`;
		return config;
	},
	(error) => Promise.reject(error),
);

// 응답 인터셉터: 공통 에러 처리 + 401 리다이렉트
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		// 401 → 로그인 페이지로 이동
		if (error.response?.status === 401) {
			useAuthStore.getState().clearUser();
			const path = window.location.pathname;
			if (path.startsWith("/App")) {
				window.location.href = "/App/login";
			} else {
				window.location.href = "/office/login";
			}
			return Promise.reject(error);
		}

		let message = "서버 오류가 발생했습니다.";

		if (error.response?.data instanceof Blob) {
			const text = await error.response.data.text();
			try {
				const json = JSON.parse(text);
				message = json.message || message;
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
