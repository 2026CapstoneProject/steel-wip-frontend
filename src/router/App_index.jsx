import React from "react";

// 현장직(FIELD) 페이지
import TaskListPage from "../pages/field/TaskListPage/TaskListPage";
import TaskDetailPage from "../pages/field/TaskDetailPage/TaskDetailPage";
import CompletePage from "../pages/field/CompletePage/CompletePage";

// ~~~
const appRoutes = [
  {
    path: "/field",
    children: [
      { path: "tasks", element: <TaskListPage /> },
      { path: "tasks/:taskId", element: <TaskDetailPage /> },
      { path: "complete", element: <CompletePage /> },
    ],
  },
];

export default appRoutes;
