import api from "./api";

const authService = {
	login: (username, password) =>
		api.post("/auth/login", { username, password }),

	logout: () => api.post("/auth/logout"),
};

export default authService;
