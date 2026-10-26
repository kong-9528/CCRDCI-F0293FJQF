import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout } from "@/layouts/AppLayout";
import { AuditTasksPage } from "@/pages/audit/AuditTasksPage";
import { HomePage } from "@/pages/HomePage";
import { IpWhitelistPage } from "@/pages/lists/IpWhitelistPage";
import { SensitiveWordsPage } from "@/pages/lists/SensitiveWordsPage";
import { UserBlacklistPage } from "@/pages/lists/UserBlacklistPage";
import { LoginPage } from "@/pages/LoginPage";

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
        <Route index element={<HomePage />} />
        <Route path="/audit/tasks" element={<AuditTasksPage />} />
        <Route path="/lists/user-blacklist" element={<UserBlacklistPage />} />
        <Route path="/lists/ip-whitelist" element={<IpWhitelistPage />} />
        <Route path="/lists/sensitive-words" element={<SensitiveWordsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
