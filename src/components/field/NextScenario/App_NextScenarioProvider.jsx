import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Outlet } from "react-router-dom";
import App_NextScenario from "./App_NextScenario";

const NEXT_SCENARIO_ALERT_DELAY = 5500;

const NextScenarioContext = createContext({
	hasUnreadAlert: false,
	notificationItems: [],
	onNotificationOpen: () => {},
	onNotificationItemClick: () => {},
	notifyNextScenarioProgress: () => {},
});

export const useNextScenario = () => useContext(NextScenarioContext);

const normalizeProgressPercent = (value) => {
	const numberValue = Number(value ?? 0);

	if (!Number.isFinite(numberValue)) return 0;

	const percent = numberValue <= 1 ? numberValue * 100 : numberValue;

	return Math.max(0, Math.min(100, Math.round(percent)));
};

const App_NextScenarioProvider = () => {
	const [currentScenarioId, setCurrentScenarioId] = useState(null);
	const [progressPercent, setProgressPercent] = useState(0);

	const [showToast, setShowToast] = useState(false);
	const [showSelectModal, setShowSelectModal] = useState(false);
	const [hasUnreadAlert, setHasUnreadAlert] = useState(false);
	const [hasNotification, setHasNotification] = useState(false);
	const [hasTriggeredAlert, setHasTriggeredAlert] = useState(false);
	const [nextScenarioDecision, setNextScenarioDecision] = useState(null);

	const resetNextScenarioState = useCallback(() => {
		setShowToast(false);
		setShowSelectModal(false);
		setHasUnreadAlert(false);
		setHasNotification(false);
		setHasTriggeredAlert(false);
		setNextScenarioDecision(null);
	}, []);

	const notifyNextScenarioProgress = useCallback(
		({ scenarioId, progressRate }) => {
			const safeScenarioId = scenarioId ? String(scenarioId) : "current-scenario";
			const normalizedProgress = normalizeProgressPercent(progressRate);

			const isNewScenario = currentScenarioId !== safeScenarioId;

			if (isNewScenario) {
				resetNextScenarioState();
				setCurrentScenarioId(safeScenarioId);
			}

			setProgressPercent(normalizedProgress);

			if (normalizedProgress < 95) {
				setShowToast(false);
				setShowSelectModal(false);
				setHasUnreadAlert(false);
				setHasNotification(false);
				setHasTriggeredAlert(false);
				return;
			}

			const alreadyDecided = isNewScenario ? null : nextScenarioDecision;
			const alreadyTriggered = isNewScenario ? false : hasTriggeredAlert;

			if (alreadyDecided !== null) return;
			if (alreadyTriggered) return;

			setShowToast(true);
			setShowSelectModal(false);
			setHasUnreadAlert(false);
			setHasNotification(false);
			setHasTriggeredAlert(true);
		},
		[
			currentScenarioId,
			nextScenarioDecision,
			hasTriggeredAlert,
			resetNextScenarioState,
		],
	);

	useEffect(() => {
		if (!showToast || progressPercent < 95) return;

		const timer = window.setTimeout(() => {
			setShowToast(false);
			setHasUnreadAlert(true);
			setHasNotification(true);
		}, NEXT_SCENARIO_ALERT_DELAY);

		return () => window.clearTimeout(timer);
	}, [showToast, progressPercent]);

	const openNextScenarioSelectModal = () => {
		if (progressPercent < 95) return;

		setShowToast(false);
		setHasUnreadAlert(false);
		setHasNotification(false);
		setShowSelectModal(true);
	};

	const handleNotificationOpen = () => {
		if (!hasNotification) return;

		setHasUnreadAlert(false);
	};

	const handleNotificationItemClick = (notification) => {
		if (notification?.id !== "next-scenario") return;

		openNextScenarioSelectModal();
	};

	const handleNextScenarioDecision = (decision) => {
		setNextScenarioDecision(decision);
		setShowSelectModal(false);
		setShowToast(false);
		setHasUnreadAlert(false);
		setHasNotification(false);
	};

	const notificationItems =
		hasNotification && nextScenarioDecision === null
			? [
					{
						id: "next-scenario",
						title: "다음 시나리오 추천",
						description:
							"작업 완료율이 95% 이상입니다. 다음 시나리오 진행 여부를 확인하세요.",
						icon: "task_alt",
					},
				]
			: [];

	const contextValue = useMemo(
		() => ({
			hasUnreadAlert,
			notificationItems,
			onNotificationOpen: handleNotificationOpen,
			onNotificationItemClick: handleNotificationItemClick,
			notifyNextScenarioProgress,
		}),
		[hasUnreadAlert, notificationItems, notifyNextScenarioProgress],
	);

	return (
		<NextScenarioContext.Provider value={contextValue}>
			<Outlet />

			<App_NextScenario
				showToast={showToast && progressPercent >= 95}
				showSelectModal={showSelectModal}
				onToastClick={openNextScenarioSelectModal}
				onNoClick={() => handleNextScenarioDecision("no")}
				onYesClick={() => handleNextScenarioDecision("yes")}
			/>
		</NextScenarioContext.Provider>
	);
};

export default App_NextScenarioProvider;