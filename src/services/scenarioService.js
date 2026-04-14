import api from './api';

// ─── 시나리오 생성 이력 (scenario_cart) ────────────────────────────
// GET /api/scenario_cart — 미발행 시나리오 목록 조회
export const getScenarioCart = (params = {}) => {
  // params 예: { projectName, scenarioName, projDueMin, projDueMax, scenDueMin, scenDueMax, genDateMin, genDateMax }
  return api.get('/scenario_cart', { params });
};

// ─── 현장 전송 이력 (scenario_send) ────────────────────────────────
// GET /api/scenario_send/ — 발행된 시나리오 이력 조회
export const getScenarioSendHistory = (params = {}) => {
  // params 예: { projectName, projDueMin, projDueMax, scenDueMin, scenDueMax, sendDateMin, sendDateMax }
  return api.get('/scenario_send/', { params });
};

// POST /api/scenario_send/{scenario_id} — 시나리오 발행(현장 전송)
export const sendScenario = (scenarioId) => {
  return api.post(`/scenario_send/${scenarioId}`);
};

// ─── 시나리오 생성 / 상세 / 삭제 (scenario) ────────────────────────
// POST /api/scenario/create — 시나리오 생성
// body: { project_id, scenario_due }
export const createScenario = (data) => {
  return api.post('/scenario/create', data);
};

// GET /api/scenario/{scenario_id} — 시나리오 상세 조회
export const getScenarioDetail = (scenarioId) => {
  return api.get(`/scenario/${scenarioId}`);
};

// DELETE /api/scenario/{scenario_id} — 시나리오 삭제
export const deleteScenario = (scenarioId) => {
  return api.delete(`/scenario/${scenarioId}`);
};
