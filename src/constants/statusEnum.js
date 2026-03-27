// 백엔드 Enum과 동기화 - BE 모델 변경 시 함께 수정 필요

export const WipStatus = {
  REGISTERED: 'REGISTERED',
  IN_STOCK: 'IN_STOCK',
  CONSUMED: 'CONSUMED',
};

export const ScenarioStatus = {
  DRAFT: 'DRAFT',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

export const StepStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

export const StepItemActionType = {
  RELOCATE_FOR_PRODUCTION: 'RELOCATE_FOR_PRODUCTION',
  PICKING: 'PICKING',
  INBOUND: 'INBOUND',
  RELOCATE_FOR_TOMORROW: 'RELOCATE_FOR_TOMORROW',
};

export const UserRole = {
  OFFICE: 'OFFICE',
  FIELD: 'FIELD',
};
