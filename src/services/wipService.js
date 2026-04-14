import api from './api';

// GET /api/steelWip — 잔재 재고 목록 조회 (필터 파라미터 포함)
export const wipService = {
  getAll: (params = {}) => {
    // params 예: { qr, manufacturer, material, thickness, minWidth, maxWidth, minLength, maxLength }
    return api.get('/steelWip', { params });
  },
};
