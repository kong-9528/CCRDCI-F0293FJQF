import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout } from "@/layouts/AppLayout";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import { LauncherPage } from "@/pages/LauncherPage";
import { LoginPage } from "@/pages/LoginPage";
import { PermissionsPage } from "@/pages/admin/PermissionsPage";
import { RolesPage } from "@/pages/admin/RolesPage";
import { OrgPage } from "@/pages/admin/OrgPage";
import { ApisPage } from "@/pages/admin/ApisPage";
import { SubsystemsPage } from "@/pages/admin/SubsystemsPage";
import { UserEditPage } from "@/pages/admin/UserEditPage";
import { UsersPage } from "@/pages/admin/UsersPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<LauncherPage />} />
        <Route path="/account/password" element={<ChangePasswordPage />} />
        <Route path="/admin/org" element={<OrgPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/users/new" element={<UserEditPage />} />
        <Route path="/admin/users/:id" element={<UserEditPage />} />
        <Route path="/admin/roles" element={<RolesPage />} />
        <Route path="/admin/permissions" element={<PermissionsPage />} />
        <Route path="/admin/subsystems" element={<SubsystemsPage />} />
        <Route path="/admin/apis" element={<ApisPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
