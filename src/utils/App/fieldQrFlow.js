const FIELD_QR_FLOW_PREFIX = "fieldQrFlow:";

const isBrowser = () => typeof window !== "undefined";

const safeParse = (value, fallback = null) => {
	try {
		return value ? JSON.parse(value) : fallback;
	} catch {
		return fallback;
	}
};

const keyFor = (key) => `${FIELD_QR_FLOW_PREFIX}${key}`;

export const getFieldQrFlowState = (key) => {
	if (!isBrowser()) return null;
	return safeParse(window.sessionStorage.getItem(keyFor(key)), null);
};

export const setFieldQrFlowState = (key, data) => {
	if (!isBrowser()) return;
	if (!data) {
		window.sessionStorage.removeItem(keyFor(key));
		return;
	}
	window.sessionStorage.setItem(keyFor(key), JSON.stringify(data));
};

const formatNumberText = (value) => {
	const number = Number(value);
	if (!Number.isFinite(number)) return "";
	return Number.isInteger(number) ? String(number) : String(number);
};

export const buildFieldQrSpecText = ({ thickness, width, height, length }) => {
	const resolvedLength = length ?? height;
	if (
		thickness === null ||
		thickness === undefined ||
		width === null ||
		width === undefined ||
		resolvedLength === null ||
		resolvedLength === undefined
	) {
		return "";
	}
	return `${formatNumberText(thickness)} x ${formatNumberText(width)} x ${formatNumberText(resolvedLength)}`;
};

export const buildFieldQrWeightText = (weight) => {
	if (weight === null || weight === undefined || weight === "") return "";
	return `${formatNumberText(weight)} kg`;
};
