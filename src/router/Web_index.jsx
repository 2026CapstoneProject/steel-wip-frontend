import React from "react";

// 생산계획자(OFFICE) 페이지
import DashboardPage from "../pages/office/DashboardPage/DashboardPage";
import Web_WipListPage from "../pages/office/Web_WipListPage/Web_WipListPage";
import Web_LantekInputPage from "../pages/office/Web_LantekInputPage/Web_LantekInputPage";
import Web_ScenarioResultPage from "../pages/office/Web_ScenarioResultPage/Web_ScenarioResultPage";
import Web_ScenarioCreationHistoryPage from "../pages/office/Web_ScenarioCreationHistoryPage/Web_ScenarioCreationHistoryPage";
import Web_ScenarioReleaseHistoryPage from "../pages/office/Web_ScenarioReleaseHistoryPage/Web_ScenarioReleaseHistoryPage";
import Web_ScenarioDetailHisotryPage from "../pages/office/Web_ScenarioReleaseHistoryPage/Web_ScenarioDetailHistoryPage";
import Web_ScenarioCreationDetailHistoryPage from "../pages/office/Web_ScenarioCreationHistoryPage/Web_ScenarioCreationDetailHistoryPage";
import Web_FieldLiveStatusPage from "../pages/office/Web_FieldLiveStatusPage/Web_FieldLiveStatusPage";

const webRoutes = [
  {
    path: "/office",
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "wip", element: <Web_WipListPage /> },
      { path: "scenario/input", element: <Web_LantekInputPage /> },
      { path: "scenario/result", element: <Web_ScenarioResultPage /> },
      {
        path: "scenario/creationhistory",
        element: <Web_ScenarioCreationHistoryPage />,
      },
      {
        path: "scenario/creationhistory/detail",
        element: <Web_ScenarioCreationDetailHistoryPage />,
      },
      {
        path: "scenario/releasehistory",
        element: <Web_ScenarioReleaseHistoryPage />,
      },
      {
        path: "scenario/releasehistory/detail",
        element: <Web_ScenarioDetailHisotryPage />,
      },
      {
        path: "scenario/fieldstatus",
        element: <Web_FieldLiveStatusPage />,
      },
    ],
  },
];

export default webRoutes;
