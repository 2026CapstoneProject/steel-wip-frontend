import api from "./api";

// GET /api/steelWip — 잔재 재고 목록 조회 (필터 파라미터 포함)
export const wipService = {
	getAll: (params = {}) => {
		// params 예: { qr, manufacturer, material, thickness, minWidth, maxWidth, minLength, maxLength }
		return api.get("/steelWip", { params });
	},
	// POST /api/steelWip/file — 파일 업로드 후 preview 반환
	previewFile: (file) => {
		const formData = new FormData();
		formData.append("file", file);
		return api.post("/steelWip/file/preview", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},

	// POST /api/steelWip/file/confirm — 선택된 항목 DB 반영
	confirmImport: (updates, creates) => {
		return api.post("/steelWip/file/confirm", { updates, creates });
	},

	// DELETE /api/steelWip/file?wip_ids=1&wip_ids=2&...
	deleteWips: (wipIds) => {
		return api.delete("/steelWip/file", {
			params: { wip_ids: wipIds },
			paramsSerializer: (params) => {
				return params.wip_ids.map((id) => `wip_ids=${id}`).join("&");
			},
		});
	},
	exportFile: (format = "xlsx") => {
		return api.get("/steelWip/file/export", {
			params: { format },
			responseType: "blob",
		});
	},
};
