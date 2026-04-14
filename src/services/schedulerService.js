import api from './api';

// POST /api/scheduler/main — 메인 솔버(알고리즘) 실행
// body: { scenario_id }
export const runScheduler = (scenarioId) => {
  return api.post('/scheduler/main', { scenario_id: scenarioId });
};
