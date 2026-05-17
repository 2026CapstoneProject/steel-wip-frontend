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

// CAASDy 배치 액션 한글 레이블
export const batchActionLabel = {
  RELOCATE:  '영구 재배치',
  PICKING:   '피킹',
  INBOUND:   '입고',
  TEMP_MOVE: '임시 이동',
  RESTORE:   '원위치 복귀',
};

// 배치 액션 → 배지 색상 (Tailwind CSS 클래스)
export const batchActionBadgeColor = {
  RELOCATE:  'bg-orange-100 text-orange-700',
  PICKING:   'bg-blue-100 text-blue-700',
  INBOUND:   'bg-green-100 text-green-700',
  TEMP_MOVE: 'bg-yellow-100 text-yellow-700',
  RESTORE:   'bg-purple-100 text-purple-700',
};
