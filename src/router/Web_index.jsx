import React from "react";
import PrivateRoute from "../components/PrivateRoute";

// 생산계획자(OFFICE) 페이지
import Web_LoginPage from "../pages/office/LoginPage/Web_LoginPage";
import DashboardPage from "../pages/office/DashboardPage/DashboardPage";
import Web_WipListPage from "../pages/office/Web_WipListPage/Web_WipListPage";
import Web_LantekInputPage from "../pages/office/Web_LantekInputPage/Web_LantekInputPage";
import Web_ScenarioResultPage from "../pages/office/Web_ScenarioResultPage/Web_ScenarioResultPage";
import Web_ScenarioCreationHistoryPage from "../pages/office/Web_ScenarioCreationHistoryPage/Web_ScenarioCreationHistoryPage";
import Web_ScenarioReleaseHistoryPage from "../pages/office/Web_ScenarioReleaseHistoryPage/Web_ScenarioReleaseHistoryPage";
import Web_ScenarioDetailHisotryPage from "../pages/office/Web_ScenarioReleaseHistoryPage/Web_ScenarioDetailHistoryPage";
import Web_ScenarioCreationDetailHistoryPage from "../pages/office/Web_ScenarioCreationHistoryPage/Web_ScenarioCreationDetailHistoryPage";
import Web_FieldLiveStatusPage from "../pages/office/Web_FieldLiveStatusPage/Web_FieldLiveStatusPage";

import useAuthStore from "../store/useAuthStore";

const P = (element) => (
	<PrivateRoute
		element={element}
		loginPath="/office/login"
		useStore={useAuthStore}
	/>
);

const webRoutes = [
	{
		path: "/office",
		children: [
			{ path: "login", element: <Web_LoginPage /> },
			{ path: "dashboard", element: P(<DashboardPage />) },
			{ path: "wip", element: P(<Web_WipListPage />) },
			{ path: "scenario/input", element: P(<Web_LantekInputPage />) },
			{ path: "scenario/result", element: P(<Web_ScenarioResultPage />) },
			{
				path: "scenario/creationhistory",
				element: P(<Web_ScenarioCreationHistoryPage />),
			},
			{
				path: "scenario/creationhistory/detail",
				element: P(<Web_ScenarioCreationDetailHistoryPage />),
			},
			{
				path: "scenario/releasehistory",
				element: P(<Web_ScenarioReleaseHistoryPage />),
			},
			{
				path: "scenario/releasehistory/detail",
				element: P(<Web_ScenarioDetailHisotryPage />),
			},
			{
				path: "scenario/fieldstatus",
				element: P(<Web_FieldLiveStatusPage />),
			},
		],
	},
];

export default webRoutes;
