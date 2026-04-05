const RELEASE_HISTORY_STORAGE_KEY = "web_scenario_release_history";
const RELEASE_HISTORY_FILTER_STORAGE_KEY =
  "web_scenario_release_history_filters";

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

export function getScenarioReleaseHistoryList() {
  if (typeof window === "undefined") return [];
  return safeParse(
    window.localStorage.getItem(RELEASE_HISTORY_STORAGE_KEY),
    [],
  );
}

export function setScenarioReleaseHistoryList(list) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    RELEASE_HISTORY_STORAGE_KEY,
    JSON.stringify(list),
  );
}

export function addScenarioReleaseHistoryItem(item) {
  const currentList = getScenarioReleaseHistoryList();

  const nextList = [
    item,
    ...currentList.filter(
      (historyItem) =>
        !(
          historyItem.projectName === item.projectName &&
          historyItem.projectDeadline === item.projectDeadline
        ),
    ),
  ];

  setScenarioReleaseHistoryList(nextList);
}

export function clearScenarioReleaseHistoryList() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RELEASE_HISTORY_STORAGE_KEY);
}

export function getScenarioReleaseHistoryFilters() {
  if (typeof window === "undefined") return {};
  return safeParse(
    window.localStorage.getItem(RELEASE_HISTORY_FILTER_STORAGE_KEY),
    {},
  );
}

export function setScenarioReleaseHistoryFilters(filters) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    RELEASE_HISTORY_FILTER_STORAGE_KEY,
    JSON.stringify(filters),
  );
}

export function clearScenarioReleaseHistoryFilters() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RELEASE_HISTORY_FILTER_STORAGE_KEY);
}
