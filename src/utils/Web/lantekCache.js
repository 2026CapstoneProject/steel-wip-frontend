const SCENARIO_LANTEK_CACHE_KEY = "officeScenarioLantekCache";

export function getScenarioLantekCache() {
  try {
    const raw = sessionStorage.getItem(SCENARIO_LANTEK_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("시나리오 캐시 조회 실패:", error);
    return null;
  }
}

export function setScenarioLantekCache(data) {
  try {
    sessionStorage.setItem(
      SCENARIO_LANTEK_CACHE_KEY,
      JSON.stringify(data ?? {}),
    );
  } catch (error) {
    console.error("시나리오 캐시 저장 실패:", error);
  }
}

export function clearScenarioLantekCache() {
  try {
    sessionStorage.removeItem(SCENARIO_LANTEK_CACHE_KEY);
  } catch (error) {
    console.error("시나리오 캐시 삭제 실패:", error);
  }
}

export { SCENARIO_LANTEK_CACHE_KEY };
