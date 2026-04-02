import React from "react";
import { createBrowserRouter } from "react-router-dom";

// 생산계획자(OFFICE) 페이지
import DashboardPage from "../pages/office/DashboardPage/DashboardPage";
import Web_WipListPage from "../pages/office/Web_WipListPage/Web_WipListPage";
import Web_LantekInputPage from "../pages/office/Web_LantekInputPage/Web_LantekInputPage";
import WorkOrderPage from "../pages/office/WorkOrderPage/WorkOrderPage";
import ScenarioPage from "../pages/office/ScenarioPage/ScenarioPage";

// 현장직(FIELD) 페이지
import TaskListPage from "../pages/field/TaskListPage/TaskListPage";
import TaskDetailPage from "../pages/field/TaskDetailPage/TaskDetailPage";
import CompletePage from "../pages/field/CompletePage/CompletePage";

const router = createBrowserRouter([
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
  {
    path: "/field",
    children: [
      { path: "tasks", element: <TaskListPage /> },
      { path: "tasks/:taskId", element: <TaskDetailPage /> },
      { path: "complete", element: <CompletePage /> },
    ],
  },
  { path: "/", element: <DashboardPage /> },
]);

export default router;
