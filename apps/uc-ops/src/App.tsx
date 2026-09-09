import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { SecurityLogsPage } from "@/pages/security/SecurityLogsPage";
import { OpLogsPage } from "@/pages/system/OpLogsPage";
import { UserDetailPage } from "@/pages/users/UserDetailPage";
import { UsersPage } from "@/pages/users/UsersPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        <Route path="/security/logs" element={<SecurityLogsPage />} />
        <Route path="/security/login-logs" element={<Navigate to="/security/logs" replace />} />
        <Route path="/security/risks" element={<Navigate to="/security/logs" replace />} />
        <Route path="/system/op-logs" element={<OpLogsPage />} />
      </Route>
    </Routes>
  );
}
