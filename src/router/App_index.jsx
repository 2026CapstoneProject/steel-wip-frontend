import React from "react";

// 현장직(FIELD) 페이지
import TaskListPage from "../pages/field/TaskListPage/TaskListPage";
import TaskDetailPage from "../pages/field/TaskDetailPage/TaskDetailPage";
import CompletePage from "../pages/field/CompletePage/CompletePage";

// ~~~
import App_StartPage from "../pages/field/StartPage/App_StartPage";
const appRoutes = [
  {
    path: "/App",
    children: [
      { path: "start", index: true, element: <App_StartPage /> },
      { path: "tasks", element: <TaskListPage /> },             
      { path: "tasks/:taskId", element: <TaskDetailPage /> },
      { path: "complete", element: <CompletePage /> },
    ],
  },
];

export default appRoutes;
