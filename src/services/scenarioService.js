import api from './api';

// 시나리오(알고리즘 결과) 관련 API 호출 함수

export const scenarioService = {
  // 전체 시나리오 목록 조회
  getAll: () => api.get('/scenarios'),

  // 특정 시나리오 조회
  getById: (id) => api.get(`/scenarios/${id}`),

  // 시나리오 생성 (작업지시서 import 후 알고리즘 수행)
  create: (data) => api.post('/scenarios', data),

  // 시나리오 상태 수정 (IN_PROGRESS, COMPLETED 등)
  update: (id, data) => api.patch(`/scenarios/${id}`, data),
};
