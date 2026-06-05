export function formatFieldLocationLabel(value) {
	const raw = String(value ?? "").trim();

	if (!raw) return "-";
	if (raw === "BUF-1") return "임시이동";
	if (/^S4-\d+$/.test(raw)) return "설비";

	return raw;
}
