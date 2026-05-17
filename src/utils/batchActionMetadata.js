/**
 * 배치 작업 타입별 아이콘, 한글명, 색상 매핑
 * 모든 페이지(office, field app)에서 일관되게 사용
 */

export const BATCH_ACTION_METADATA = {
  RELOCATE: {
    label_ko: "재배치",
    icon: "🔄",
    color: "#9CA3AF", // 회색
    material_icon: "sync_alt",
  },
  PICKING: {
    label_ko: "피킹",
    icon: "🎯",
    color: "#EF4444", // 빨강
    material_icon: "location_on",
  },
  DIRECT_START: {
    label_ko: "원자재 투입",
    icon: "⬜",
    color: "#A855F7", // 보라
    material_icon: "input",
  },
  INBOUND: {
    label_ko: "적재",
    icon: "📦",
    color: "#06B6D4", // 청색
    material_icon: "publish",
  },
  TEMP_MOVE: {
    label_ko: "임시이동",
    icon: "↪️",
    color: "#F97316", // 주황
    material_icon: "arrow_forward",
  },
  RESTORE: {
    label_ko: "원상복구",
    icon: "↩️",
    color: "#06B6D4", // 청색
    material_icon: "arrow_back",
  },
};

/**
 * 작업 타입으로 메타데이터 조회
 * @param {string} actionType - BatchActionType (e.g., "PICKING", "TEMP_MOVE")
 * @returns {object} { label_ko, icon, color, material_icon }
 */
export const getActionMetadata = (actionType) => {
  return BATCH_ACTION_METADATA[actionType] || {
    label_ko: actionType,
    icon: "•",
    color: "#000000",
    material_icon: "help",
  };
};

/**
 * 작업 타입의 한글명 조회
 * @param {string} actionType
 * @returns {string} 한글명 (e.g., "피킹")
 */
export const getActionLabel = (actionType) => {
  return getActionMetadata(actionType).label_ko;
};

/**
 * 작업 타입의 Material Icon 조회
 * @param {string} actionType
 * @returns {string} Material Icon 이름 (e.g., "location_on")
 */
export const getActionMaterialIcon = (actionType) => {
  return getActionMetadata(actionType).material_icon;
};

/**
 * 작업 타입의 색상 조회
 * @param {string} actionType
 * @returns {string} HEX 색상 (e.g., "#EF4444")
 */
export const getActionColor = (actionType) => {
  return getActionMetadata(actionType).color;
};
