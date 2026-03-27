// Enum 상태값 → 한글 레이블 변환 유틸

export const wipStatusLabel = {
  REGISTERED: '등록됨',
  IN_STOCK: '재고 중',
  CONSUMED: '소진됨',
};

export const scenarioStatusLabel = {
  DRAFT: '대기',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
};

export const stepStatusLabel = {
  PENDING: '대기',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
};

export const stepItemActionLabel = {
  RELOCATE_FOR_PRODUCTION: '생산 투입 이동',
  PICKING: '피킹',
  INBOUND: '입고',
  RELOCATE_FOR_TOMORROW: '내일 작업 이동',
};
