import { createBrowserRouter } from 'react-router-dom';

// 생산계획자(OFFICE) 페이지
import DashboardPage from '../pages/office/DashboardPage/DashboardPage';
import WipListPage from '../pages/office/WipListPage/WipListPage';
import WorkOrderPage from '../pages/office/WorkOrderPage/WorkOrderPage';
import ScenarioPage from '../pages/office/ScenarioPage/ScenarioPage';

// 현장직(FIELD) 페이지
import TaskListPage from '../pages/field/TaskListPage/TaskListPage';
import TaskDetailPage from '../pages/field/TaskDetailPage/TaskDetailPage';
import CompletePage from '../pages/field/CompletePage/CompletePage';

const router = createBrowserRouter([
  // ── 생산계획자 화면 (웹) ──────────────────────────────
  {
    path: '/office',
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'wips', element: <WipListPage /> },
      { path: 'work-order', element: <WorkOrderPage /> },
      { path: 'scenario', element: <ScenarioPage /> },
    ],
  },

  // ── 현장직 화면 (모바일 웹) ───────────────────────────
  {
    path: '/field',
    children: [
      { path: 'tasks', element: <TaskListPage /> },
      { path: 'tasks/:taskId', element: <TaskDetailPage /> },
      { path: 'complete', element: <CompletePage /> },
    ],
  },

  // 기본 리다이렉트 (추후 역할 기반 분기)
  { path: '/', element: <DashboardPage /> },
]);

export default router;
