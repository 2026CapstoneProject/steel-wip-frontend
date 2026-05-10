import React from "react";
import PrivateRoute from "../components/PrivateRoute";

import App_LoginPage from "../pages/field/LoginPage/App_LoginPage";
import App_StartPage from "../pages/field/StartPage/App_StartPage";
import App_ReadyPage from "../pages/field/ReadyPage/App_ReadyPage";
import App_RelocatePage from "../pages/field/RelocatePage/App_RelocatePage";
import App_RelocateQrWipPage from "../pages/field/RelocateQrWipPage/App_RelocateQrWipPage";
import App_RelocateQrZonePage from "../pages/field/RelocateQrZonePage/App_RelocateQrZonePage";
import App_PickingWipPage from "../pages/field/PickingWipPage/App_PickingWipPage";
import App_PickingWipQrPage from "../pages/field/PickingWipQrPage/App_PickingWipQrPage";
import App_PickingRawPage from "../pages/field/PickingRawPage/App_PickingRawPage";
import App_ProcessingPage from "../pages/field/ProcessingPage/App_ProcessingPage";
import App_ProcessingQrPage from "../pages/field/ProcessingQrPage/App_ProcessingQrPage";
import App_ProcessingQrWipPage from "../pages/field/ProcessingQrWipPage/App_ProcessingQrWipPage";
import App_ProcessingQrWipZonePage from "../pages/field/ProcessingQrWipZonePage/App_ProcessingQrWipZonePage";
import App_EndPage from "../pages/field/EndPage/App_EndPage";
import App_EndNextPage from "../pages/field/EndNextPage/App_EndNextPage";
import App_EndNextSelectPage from "../pages/field/EndNextSelectPage/App_EndNextSelectPage";

import useAppAuthStore from "../store/useAppAuthStore";

const P = (element) => (
	<PrivateRoute
		element={element}
		loginPath="/App/login"
		useStore={useAppAuthStore}
	/>
);
const appRoutes = [
	{
		path: "/App",
		children: [
			{ path: "login", element: <App_LoginPage /> },
			{ path: "start", element: P(<App_StartPage />) },
			{ path: "ready", element: P(<App_ReadyPage />) },

			{ path: "ready/relocate", element: P(<App_RelocatePage />) },
			{ path: "ready/relocate/qr/wip", element: P(<App_RelocateQrWipPage />) },
			{
				path: "ready/relocate/qr/zone",
				element: P(<App_RelocateQrZonePage />),
			},

			{ path: "ready/picking/wip", element: P(<App_PickingWipPage />) },
			{ path: "ready/picking/wip/qr", element: P(<App_PickingWipQrPage />) },

			{ path: "ready/picking/raw", element: P(<App_PickingRawPage />) },

			{ path: "processing", element: P(<App_ProcessingPage />) },
			{ path: "processing/qr", element: P(<App_ProcessingQrPage />) },
			{ path: "processing/qr/wip", element: P(<App_ProcessingQrWipPage />) },
			{
				path: "processing/qr/wip/zone",
				element: P(<App_ProcessingQrWipZonePage />),
			},

			{ path: "end", element: P(<App_EndPage />) },

			{ path: "end/next", element: P(<App_EndNextPage />) },
			{ path: "end/next/select", element: P(<App_EndNextSelectPage />) },
		],
	},
];

export default appRoutes;
