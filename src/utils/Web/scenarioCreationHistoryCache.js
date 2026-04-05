let scenarioCreationHistoryStore = [];

function sortByCreatedAtDesc(list) {
  return [...list].sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt)),
  );
}

export function getScenarioCreationHistoryList() {
  return sortByCreatedAtDesc(scenarioCreationHistoryStore);
}

export function addScenarioCreationHistoryItem(item) {
  const normalizedItem = {
    id: item.id ?? `scenario-${Date.now()}`,
    scenarioId: item.scenarioId ?? "-",
    projectName: item.projectName ?? "-",
    productionPlanName: item.productionPlanName ?? "-",
    projectDeadline: item.projectDeadline ?? "",
    shipmentDate: item.shipmentDate ?? "-",
    createdAt:
      item.createdAt ?? new Date().toISOString().slice(0, 19).replace("T", " "),
    scrapCount: item.scrapCount ?? 0,
    moveCount: item.moveCount ?? 0,
    totalMinutes: item.totalMinutes ?? 0,
    isReleased: item.isReleased ?? false,
  };

  scenarioCreationHistoryStore = sortByCreatedAtDesc([
    normalizedItem,
    ...scenarioCreationHistoryStore,
  ]);

  return normalizedItem;
}

export function markScenarioCreationHistoryAsReleased(targetId) {
  scenarioCreationHistoryStore = scenarioCreationHistoryStore.map((item) =>
    item.id === targetId
      ? {
          ...item,
          isReleased: true,
        }
      : item,
  );
}

export function clearScenarioCreationHistoryList() {
  scenarioCreationHistoryStore = [];
}
