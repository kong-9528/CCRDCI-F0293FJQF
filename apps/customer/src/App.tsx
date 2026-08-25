import { Navigate, Route, Routes } from "react-router-dom";
import { CustomerLayout } from "@/layouts/CustomerLayout";
import { AccountCenterPage } from "@/pages/account/AccountCenterPage";
import { ApiDocProductPage } from "@/pages/api-docs/ApiDocProductPage";
import { ApiDocsOverviewPage } from "@/pages/api-docs/ApiDocsOverviewPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DeskPage } from "@/pages/DeskPage";
import { HelpCenterPage } from "@/pages/help/HelpCenterPage";
import { KeysPage } from "@/pages/keys/KeysPage";
import { DuplicateReviewPage } from "@/pages/review/DuplicateReviewPage";
import { InfringementReviewPage } from "@/pages/review/InfringementReviewPage";
import { SafetyReviewPage } from "@/pages/review/SafetyReviewPage";
import { DciVerifyPage } from "@/pages/verify/DciVerifyPage";
import { InfoVerifyPage } from "@/pages/verify/InfoVerifyPage";
import { CertVerifyPage } from "@/pages/verify/CertVerifyPage";

export function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<Navigate to="/desk" replace />} />
        <Route path="/desk" element={<DeskPage />} />
        {/* 原工作台保留，不在侧栏暴露 */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/verify/dci" element={<DciVerifyPage />} />
        <Route path="/verify/info" element={<InfoVerifyPage />} />
        <Route path="/verify/certificate" element={<CertVerifyPage />} />
        <Route path="/review/safety" element={<SafetyReviewPage />} />
        <Route path="/review/duplicate" element={<DuplicateReviewPage />} />
        <Route path="/review/infringement" element={<InfringementReviewPage />} />
        <Route path="/keys" element={<KeysPage />} />
        <Route path="/account" element={<AccountCenterPage />} />
        <Route path="/api-docs" element={<ApiDocsOverviewPage />} />
        <Route path="/api-docs/:productId" element={<ApiDocProductPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        {/* 旧路由重定向 */}
        <Route path="/audit" element={<Navigate to="/review/safety" replace />} />
        <Route path="/account/*" element={<Navigate to="/account" replace />} />
        <Route path="/analytics" element={<Navigate to="/desk" replace />} />
        <Route path="/reports/*" element={<Navigate to="/desk" replace />} />
        <Route path="*" element={<Navigate to="/desk" replace />} />
      </Route>
    </Routes>
  );
}
