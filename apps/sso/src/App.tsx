import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout } from "@/layouts/AppLayout";
import { LauncherPage } from "@/pages/LauncherPage";
import { LoginPage } from "@/pages/LoginPage";
import { PermissionsPage } from "@/pages/admin/PermissionsPage";
import { RolesPage } from "@/pages/admin/RolesPage";
import { OrgPage } from "@/pages/admin/OrgPage";
import { ApisPage } from "@/pages/admin/ApisPage";
import { SubsystemsPage } from "@/pages/admin/SubsystemsPage";
import { PortalUserDetailPage } from "@/pages/admin/PortalUserDetailPage";
import { PortalUsersPage } from "@/pages/admin/PortalUsersPage";
import { SystemLogsPage } from "@/pages/admin/SystemLogsPage";
import { UsersPage } from "@/pages/admin/UsersPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<LauncherPage />} />
        <Route path="/account/password" element={<Navigate to="/home" replace />} />
        <Route path="/admin/org" element={<OrgPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/users/new" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/users/:id" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/portal-users" element={<PortalUsersPage />} />
        <Route path="/admin/portal-users/:id" element={<PortalUserDetailPage />} />
        <Route path="/admin/roles" element={<RolesPage />} />
        <Route path="/admin/permissions" element={<PermissionsPage />} />
        <Route path="/admin/subsystems" element={<SubsystemsPage />} />
        <Route path="/admin/apis" element={<ApisPage />} />
        <Route path="/admin/logs" element={<SystemLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
