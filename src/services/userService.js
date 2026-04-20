import api from './api';

// GET /api/users — 전체 사용자 조회
// GET /api/users/{id} — 특정 사용자 조회
// POST /api/users — 사용자 생성
// PATCH /api/users/{id} — 사용자 수정
// DELETE /api/users/{id} — 사용자 삭제
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
