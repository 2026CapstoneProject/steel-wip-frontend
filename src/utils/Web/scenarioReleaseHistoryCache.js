const RELEASE_HISTORY_STORAGE_KEY = "web_scenario_release_history";
const RELEASE_HISTORY_FILTER_STORAGE_KEY =
  "web_scenario_release_history_filters";

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function readStorageList() {
  if (!isBrowser()) return [];
  return safeParse(
    window.localStorage.getItem(RELEASE_HISTORY_STORAGE_KEY),
    [],
  );
}

function writeStorageList(list) {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    RELEASE_HISTORY_STORAGE_KEY,
    JSON.stringify(list),
  );
}

function normalizeReleaseHistoryItem(item) {
  const now = new Date().toISOString();

  return {
    id: item.id ?? `release-${Date.now()}`,
    projectName: item.projectName ?? "-",
    projectDeadline: item.projectDeadline ?? "",
    status: item.status ?? "in-progress",
    statusLabel: item.statusLabel ?? "In Progress",
    statusDescription: item.statusDescription ?? "진행 중",
    icon: item.icon ?? "apartment",
    iconWrapperClass: item.iconWrapperClass ?? "bg-blue-100 text-blue-700",
    rows: Array.isArray(item.rows) ? item.rows : [],
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? now,

    // 백엔드 전환 대비용 메타 필드
    source: item.source ?? "local",
    synced: item.synced ?? false,
    serverId: item.serverId ?? null,
  };
}

/**
 * 로컬 캐시에 저장된 현장 전송 이력 목록 조회
 * - 현재 프론트 임시 저장용
 * - 추후 서버 조회와 병행/대체 가능
 */
export function getScenarioReleaseHistoryList() {
  return readStorageList();
}

/**
 * 전체 목록 교체
 * - 서버 응답으로 통째로 갈아끼울 때도 사용 가능
 */
export function setScenarioReleaseHistoryList(list) {
  const normalizedList = Array.isArray(list)
    ? list.map((item) => normalizeReleaseHistoryItem(item))
    : [];

  writeStorageList(normalizedList);
}

/**
 * 단건 추가
 * - 현재: 결과 페이지에서 발행 시 사용
 * - 추후: 서버 저장 실패 시 임시 보관에도 사용 가능
 */
export function addScenarioReleaseHistoryItem(item) {
  const currentList = getScenarioReleaseHistoryList();
  const normalizedItem = normalizeReleaseHistoryItem(item);

  const nextList = [
    normalizedItem,
    ...currentList.filter(
      (historyItem) =>
        !(
          historyItem.projectName === normalizedItem.projectName &&
          historyItem.productionPlanName ===
            normalizedItem.productionPlanName &&
          historyItem.createdAt === normalizedItem.createdAt
        ),
    ),
  ];

  writeStorageList(nextList);
  return normalizedItem;
}

/**
 * 특정 항목 업데이트
 * - 추후 서버 저장 후 synced=true, serverId 반영할 때 사용 가능
 */
export function updateScenarioReleaseHistoryItem(targetId, updates) {
  const currentList = getScenarioReleaseHistoryList();

  const nextList = currentList.map((item) => {
    if (item.id !== targetId) return item;

    return {
      ...item,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  });

  writeStorageList(nextList);
  return nextList;
}

/**
 * 특정 항목 삭제
 * - 테스트용 / 추후 삭제 기능용
 */
export function removeScenarioReleaseHistoryItem(targetId) {
  const currentList = getScenarioReleaseHistoryList();
  const nextList = currentList.filter((item) => item.id !== targetId);
  writeStorageList(nextList);
  return nextList;
}

/**
 * 전체 초기화
 * - 개발 테스트용
 */
export function clearScenarioReleaseHistoryList() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(RELEASE_HISTORY_STORAGE_KEY);
}

/**
 * 서버 데이터와 로컬 데이터를 병합
 * 우선순위:
 * 1. serverId가 같으면 서버 데이터 우선
 * 2. 로컬에만 있는 unsynced 데이터는 유지
 *
 * 사용 예:
 * - 백엔드 연동 후 GET 응답 받은 뒤
 * - setMergedScenarioReleaseHistoryList(serverList)
 */
export function mergeScenarioReleaseHistoryList(serverList = []) {
  const localList = getScenarioReleaseHistoryList();

  const normalizedServerList = serverList.map((item) =>
    normalizeReleaseHistoryItem({
      ...item,
      source: "server",
      synced: true,
    }),
  );

  const mergedMap = new Map();

  normalizedServerList.forEach((item) => {
    const key = item.serverId ?? item.id;
    mergedMap.set(key, item);
  });

  localList.forEach((item) => {
    const key = item.serverId ?? item.id;

    // 서버에 없는 로컬 임시 데이터는 유지
    if (!mergedMap.has(key)) {
      mergedMap.set(key, item);
    }
  });

  const mergedList = Array.from(mergedMap.values()).sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt)),
  );

  writeStorageList(mergedList);
  return mergedList;
}

/**
 * 서버 저장 성공 후 로컬 임시 데이터 동기화 처리
 * 예:
 * markScenarioReleaseHistoryAsSynced(localId, serverItem.id)
 */
export function markScenarioReleaseHistoryAsSynced(localId, serverId) {
  return updateScenarioReleaseHistoryItem(localId, {
    synced: true,
    source: "server",
    serverId,
  });
}

/**
 * 필터 조회
 */
export function getScenarioReleaseHistoryFilters() {
  if (!isBrowser()) return {};

  return safeParse(
    window.localStorage.getItem(RELEASE_HISTORY_FILTER_STORAGE_KEY),
    {},
  );
}

/**
 * 필터 저장
 */
export function setScenarioReleaseHistoryFilters(filters) {
  if (!isBrowser()) return;

  window.localStorage.setItem(
    RELEASE_HISTORY_FILTER_STORAGE_KEY,
    JSON.stringify(filters ?? {}),
  );
}

/**
 * 필터 초기화
 */
export function clearScenarioReleaseHistoryFilters() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(RELEASE_HISTORY_FILTER_STORAGE_KEY);
}
