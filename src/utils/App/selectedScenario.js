const STORAGE_KEY = "fieldSelectedScenarioId";

export const getSelectedFieldScenarioId = () => {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const setSelectedFieldScenarioId = (scenarioId) => {
  if (typeof window === "undefined") return;
  if (!scenarioId) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(STORAGE_KEY, String(scenarioId));
};
