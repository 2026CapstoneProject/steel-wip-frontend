import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import webRoutes from "./Web_index";
import appRoutes from "./App_index";

const router = createBrowserRouter([
  ...webRoutes,
  ...appRoutes,
  { path: "/", element: <Navigate to="/office/dashboard" replace /> },
]);

export default router;
