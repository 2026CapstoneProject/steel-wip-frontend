import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Outlet, useNavigate } from "react-router-dom";
import App_NextScenario from "./App_NextScenario";
import { completeScenario } from "../../../services/fieldService";

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
	const navigate = useNavigate();
	const [currentScenarioId, setCurrentScenarioId] = useState(
		() => sessionStorage.getItem("ns_scenarioId") ?? null,
	);
	const [progressPercent, setProgressPercent] = useState(() =>
		Number(sessionStorage.getItem("ns_progressPercent") ?? 0),
	);
	const [showToast, setShowToast] = useState(false); // toast는 새로고침 시 재노출 안 함
	const [showSelectModal, setShowSelectModal] = useState(false);
	const [hasUnreadAlert, setHasUnreadAlert] = useState(
		() => sessionStorage.getItem("ns_hasUnreadAlert") === "true",
	);
	const [hasNotification, setHasNotification] = useState(
		() => sessionStorage.getItem("ns_hasNotification") === "true",
	);
	const [hasTriggeredAlert, setHasTriggeredAlert] = useState(
		() => sessionStorage.getItem("ns_hasTriggeredAlert") === "true",
	);
	const [nextScenarioDecision, setNextScenarioDecision] = useState(
		() => sessionStorage.getItem("ns_decision") ?? null,
	);

	const saveSession = useCallback((patch) => {
		Object.entries(patch).forEach(([key, value]) => {
			if (value === null || value === undefined) {
				sessionStorage.removeItem(key);
			} else {
				sessionStorage.setItem(key, String(value));
			}
		});
	}, []);

	const resetNextScenarioState = useCallback(() => {
		setShowToast(false);
		setShowSelectModal(false);
		setHasUnreadAlert(false);
		setHasNotification(false);
		setHasTriggeredAlert(false);
		setNextScenarioDecision(null);
		sessionStorage.removeItem("ns_scenarioId");
		sessionStorage.removeItem("ns_progressPercent");
		sessionStorage.removeItem("ns_hasUnreadAlert");
		sessionStorage.removeItem("ns_hasNotification");
		sessionStorage.removeItem("ns_hasTriggeredAlert");
		sessionStorage.removeItem("ns_decision");
	}, []);

	const notifyNextScenarioProgress = useCallback(
		({ scenarioId, progressRate }) => {
			const safeScenarioId = scenarioId
				? String(scenarioId)
				: "current-scenario";
			const normalizedProgress = normalizeProgressPercent(progressRate);

			const isNewScenario = currentScenarioId !== safeScenarioId;

			if (isNewScenario) {
				resetNextScenarioState();
				setCurrentScenarioId(safeScenarioId);
			}

			if (isNewScenario) {
				resetNextScenarioState();
				setCurrentScenarioId(safeScenarioId);
				saveSession({ ns_scenarioId: safeScenarioId });
			}

			setProgressPercent(normalizedProgress);
			saveSession({ ns_progressPercent: normalizedProgress });

			if (normalizedProgress < 95) {
				setShowToast(false);
				setShowSelectModal(false);
				setHasUnreadAlert(false);
				setHasNotification(false);
				setHasTriggeredAlert(false);
				// 95% 미만이면 session도 초기화
				saveSession({
					ns_hasUnreadAlert: false,
					ns_hasNotification: false,
					ns_hasTriggeredAlert: false,
					ns_decision: null,
				});
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
			saveSession({ ns_hasTriggeredAlert: true });
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
			saveSession({ ns_hasUnreadAlert: true, ns_hasNotification: true });
		}, NEXT_SCENARIO_ALERT_DELAY);
		return () => window.clearTimeout(timer);
	}, [showToast, progressPercent, saveSession]);

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

	const handleNextScenarioDecision = async (decision) => {
		setNextScenarioDecision(decision);
		setShowSelectModal(false);
		setShowToast(false);
		setHasUnreadAlert(false);
		setHasNotification(false);
		saveSession({
			ns_decision: decision,
			ns_hasUnreadAlert: false,
			ns_hasNotification: false,
		});

		if (decision === "yes") {
			try {
				await completeScenario(currentScenarioId);
				resetNextScenarioState(); // session도 같이 초기화됨
				navigate("/App/ready");
			} catch (err) {
				console.error("시나리오 완료 처리 실패:", err);
			}
		}
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
