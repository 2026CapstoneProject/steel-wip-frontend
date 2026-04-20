import api from './api';

// GET /api/project?search={keyword} — 프로젝트 검색
export const searchProjects = (search = '') => {
  return api.get('/project', { params: search ? { search } : {} });
};

// POST /api/project/new — 신규 프로젝트 생성
// body: { title, project_due }
export const createProject = (data) => {
  return api.post('/project/new', data);
};

// PATCH /api/project/{project_id} — 프로젝트 수정
// body: { title?, project_due? }
export const updateProject = (projectId, data) => {
  return api.patch(`/project/${projectId}`, data);
};

// POST /api/project/{project_id} — 프로젝트 선택 (시나리오 생성 전 확정)
export const selectProject = (projectId) => {
  return api.post(`/project/${projectId}`);
};
