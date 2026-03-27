import api from './api';

// 잔재 재고 관련 API 호출 함수

export const wipService = {
  // 전체 잔재 목록 조회
  getAll: () => api.get('/wips'),

  // 특정 잔재 조회
  getById: (id) => api.get(`/wips/${id}`),

  // 잔재 등록
  create: (data) => api.post('/wips', data),

  // 잔재 정보 수정
  update: (id, data) => api.patch(`/wips/${id}`, data),

  // 잔재 삭제
  delete: (id) => api.delete(`/wips/${id}`),
};
