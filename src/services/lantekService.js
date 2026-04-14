import api from './api';

// POST /api/lantek/import — LANTEK 파일 import (multipart form)
// file: File, scenario_id: int (form field)
export const importLantekData = (scenarioId, file) => {
  const formData = new FormData();
  formData.append('scenario_id', scenarioId);
  formData.append('file', file);
  return api.post('/lantek/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// GET /api/lantek/get/{scenario_id} — LANTEK 결과 데이터 조회
export const getLantekData = (scenarioId) => {
  return api.get(`/lantek/get/${scenarioId}`);
};

// DELETE /api/lantek/delete — LANTEK 데이터 초기화
// body: { scenario_id }
export const deleteLantekData = (scenarioId) => {
  return api.delete('/lantek/delete', { data: { scenario_id: scenarioId } });
};
