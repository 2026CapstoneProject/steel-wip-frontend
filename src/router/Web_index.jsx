import React from "react";

// 생산계획자(OFFICE) 페이지
import DashboardPage from "../pages/office/DashboardPage/DashboardPage";
import Web_WipListPage from "../pages/office/Web_WipListPage/Web_WipListPage";
import Web_LantekInputPage from "../pages/office/Web_LantekInputPage/Web_LantekInputPage";
import WorkOrderPage from "../pages/office/WorkOrderPage/WorkOrderPage";
import ScenarioPage from "../pages/office/ScenarioPage/ScenarioPage";

const webRoutes = [
  {
    path: "/office",
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "wip", element: <Web_WipListPage /> },
      { path: "scenario/input", element: <Web_LantekInputPage /> },
      { path: "work-order", element: <WorkOrderPage /> },
      { path: "scenario", element: <ScenarioPage /> },
    ],
  },
];

export default webRoutes;
