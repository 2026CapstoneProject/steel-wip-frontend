import api from "./api";

// ─── 현장직 작업 화면 ─────────────────────────────────────────────

// GET /api/field/ready — 생산 준비 화면 (배치/피킹 목록)
export const getFieldReady = () => {
	return api.get("/field/ready");
};

// GET /api/field/progress — 생산 중 화면 (절단 작업 목록)
export const getFieldProgress = () => {
	return api.get("/field/progress");
};

// GET /api/field/end?batchId={batchId} — 작업 완료 화면
export const getFieldEnd = (batchId) => {
	return api.get("/field/end", { params: { batchId } });
};

// GET /api/field/{batchItemId}/relocQr — 재배치 QR 인식 화면 조회
export const getRelocQr = (batchItemId) => {
	return api.get(`/field/${batchItemId}/relocQr`);
};

// GET /api/field/{batchItemId}/pickingQr — 피킹 QR 인식 화면 조회
export const getPickingQr = (batchItemId) => {
	return api.get(`/field/${batchItemId}/pickingQr`);
};

// GET /api/field/{batchItemId}/inboundQr — 적재(입고) QR 인식 화면 조회
export const getInboundQr = (batchItemId) => {
	return api.get(`/field/${batchItemId}/inboundQr`);
};

// POST /api/field/{batchItemId} — 작업 완료 처리 (저장)
// body: { wipQR?, locQR? }
export const saveBatchItem = (batchItemId, data = {}) => {
	return api.post(`/field/${batchItemId}`, data);
};

// POST /api/field/scenario/{scenarioId}/complete — 시나리오 완료 처리
// 완료된 시나리오의 scenario_order를 0으로 설정, 나머지 order 1씩 감소
export const completeScenario = (scenarioId) => {
	return api.post(`/field/scenario/${scenarioId}/complete`);
};

// GET /api/live_field/{lazer_name} — 실시간 현장 정보 (특정 레이저 기기)
export const getLiveField = (lazerName) => {
	return api.get(`/live_field/${lazerName}`);
};
