import React from "react";

import App_StartPage from "../pages/field/StartPage/App_StartPage";
import App_ReadyPage from "../pages/field/ReadyPage/App_ReadyPage";
// import App_RelocatePage from "../pages/field/RelocatePage/App_RelocatePage";
// import App_RelocateQrWipPage from "../pages/field/RelocateQrWipPage/App_RelocateQrWipPage";
// import App_RelocateQrZonePage from "../pages/field/RelocateQrZonePage/App_RelocateQrZonePage";
// import App_PickingWipPage from "../pages/field/PickingWipPage/App_PickingWipPage";
// import App_PickingWipQrPage from "../pages/field/PickingWipQrPage/App_PickingWipQrPage";
// import App_PickingRawPage from "../pages/field/PickingRawPage/App_PickingRawPage";
// import App_PickingRawQrPage from "../pages/field/PickingRawQrPage/App_PickingRawQrPage";
// import App_ProcessingPage from "../pages/field/ProcessingPage/App_ProcessingPage";
// import App_ProcessingQrPage from "../pages/field/ProcessingQrPage/App_ProcessingQrPage";
// import App_EndPage from "../pages/field/EndPage/App_EndPage";
// import App_NextPage from "../pages/field/NextPage/App_NextPage";
// import App_NextSelectPage from "../pages/field/NextSelectPage/App_NextSelectPage";

const appRoutes = [
  {
    path: "/App",
    children: [
      { path: "start", element: <App_StartPage /> },
      { path: "ready", element: <App_ReadyPage /> },

      // { path: "ready/relocate", element: <App_RelocatePage /> },
      // { path: "ready/relocate/qr/wip", element: <App_RelocateQrWipPage /> },
      // { path: "ready/relocate/qr/zone", element: <App_RelocateQrZonePage /> },

      // { path: "ready/picking/wip", element: <App_PickingWipPage /> },
      // { path: "ready/picking/wip/qr", element: <App_PickingWipQrPage /> },

      // { path: "ready/picking/raw", element: <App_PickingRawPage /> },
      // { path: "ready/picking/raw/qr", element: <App_PickingRawQrPage /> },

      // { path: "processing", element: <App_ProcessingPage /> },
      // { path: "processing/qr", element: <App_ProcessingQrPage /> },

      // { path: "next", element: <App_NextPage /> },
      // { path: "next/select", element: <App_NextSelectPage /> },

      // { path: "end", element: <App_EndPage /> },
    ],
  },
];

export default appRoutes;
