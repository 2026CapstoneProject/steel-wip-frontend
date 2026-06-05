function formatDateValue(value) {
	if (!value) return "-";
	return String(value).slice(0, 10);
}

export function buildScenarioDetailSummary({
	scenarioData,
	projectInfo,
	fallbackStatus = "",
}) {
	const scenarioId = scenarioData?.scenarioId ?? projectInfo?.scenarioId ?? "-";

	return {
		scenarioId:
			typeof scenarioId === "number"
				? `#${String(scenarioId).padStart(5, "0")}`
				: scenarioId,
		projectName: scenarioData?.projectTitle || projectInfo?.projectName || "-",
		productionPlanName:
			scenarioData?.scenarioTitle || projectInfo?.productionPlanName || "-",
		shipmentDate: formatDateValue(
			scenarioData?.scenarioDue || projectInfo?.shipmentDate,
		),
		projectDeadline: formatDateValue(
			scenarioData?.projectDue || projectInfo?.projectDeadline,
		),
		releaseDate: formatDateValue(
			scenarioData?.orderedAt || projectInfo?.releaseDate,
		),
		materialCount:
			scenarioData?.numInputWip ?? projectInfo?.materialCount ?? "-",
		equipmentName:
			scenarioData?.lazerName || projectInfo?.equipmentName || "-",
		status:
			scenarioData?.status || projectInfo?.dbStatus || fallbackStatus || "",
		emergencyOrNot:
			scenarioData?.emergencyOrNot ?? projectInfo?.emergencyOrNot ?? false,
	};
}
