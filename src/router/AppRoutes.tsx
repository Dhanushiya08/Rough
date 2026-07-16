import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./RoutePaths";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import PromptManagement from "../pages/PromptManagement";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.PROMPT_MANAGEMENT} element={<PromptManagement />} />
          <Route path={ROUTES.PROMPT_DETAIL(":id")} element={<PromptManagement />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
