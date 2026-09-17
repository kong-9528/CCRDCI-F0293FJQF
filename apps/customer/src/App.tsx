import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { CustomerLayout } from "@/layouts/CustomerLayout";
import { ApiManageLayout } from "@/layouts/ApiManageLayout";
import { AccountCenterPage } from "@/pages/account/AccountCenterPage";
import { AccountEditPage } from "@/pages/account/AccountEditPage";
import { ChangePasswordPage } from "@/pages/account/ChangePasswordPage";
import { ApiStatsPage } from "@/pages/api-stats/ApiStatsPage";
import { ApiDocProductPage } from "@/pages/api-docs/ApiDocProductPage";
import { ApiDocsOverviewPage } from "@/pages/api-docs/ApiDocsOverviewPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DeskPage } from "@/pages/DeskPage";
import { DocsPage } from "@/pages/docs/DocsPage";
import { KeysPage } from "@/pages/keys/KeysPage";
import { DuplicateReviewPage } from "@/pages/review/DuplicateReviewPage";
import { InfringementReviewPage } from "@/pages/review/InfringementReviewPage";
import { SafetyReviewPage } from "@/pages/review/SafetyReviewPage";
import { DciVerifyPage } from "@/pages/verify/DciVerifyPage";
import { InfoVerifyPage } from "@/pages/verify/InfoVerifyPage";
import { CertVerifyPage } from "@/pages/verify/CertVerifyPage";

function DefaultRedirect() {
  return <Navigate to="/desk" replace />;
}

function ApiDocsLegacyRedirect() {
  const { productId = "" } = useParams();
  return <Navigate to={`/api/docs/${productId}`} replace />;
}

export function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<DefaultRedirect />} />
        <Route path="/apply" element={<Navigate to="/desk" replace />} />
        <Route path="/apply/*" element={<Navigate to="/desk" replace />} />
        <Route path="/desk" element={<DeskPage />} />
        {/* 原工作台保留，不在侧栏暴露 */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/verify/dci" element={<DciVerifyPage />} />
        <Route path="/verify/info" element={<InfoVerifyPage />} />
        <Route path="/verify/certificate" element={<CertVerifyPage />} />
        <Route path="/review/safety" element={<SafetyReviewPage />} />
        <Route path="/review/duplicate" element={<DuplicateReviewPage />} />
        <Route path="/review/infringement" element={<InfringementReviewPage />} />
        <Route path="/account/password" element={<ChangePasswordPage />} />
        <Route path="/account/edit" element={<AccountEditPage />} />
        <Route path="/account" element={<AccountCenterPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/help" element={<Navigate to="/docs" replace />} />

        <Route path="/api" element={<ApiManageLayout />}>
          <Route index element={<Navigate to="keys" replace />} />
          <Route path="keys" element={<KeysPage />} />
          <Route path="stats" element={<ApiStatsPage />} />
          {/* 产品维度文档仍可通过核验页入口访问 */}
          <Route path="docs" element={<ApiDocsOverviewPage />} />
          <Route path="docs/:productId" element={<ApiDocProductPage />} />
        </Route>

        {/* 旧路由重定向 */}
        <Route path="/keys" element={<Navigate to="/api/keys" replace />} />
        <Route path="/api-docs" element={<Navigate to="/docs" replace />} />
        <Route path="/api-docs/:productId" element={<ApiDocsLegacyRedirect />} />
        <Route path="/audit" element={<Navigate to="/review/safety" replace />} />
        <Route path="/account/*" element={<Navigate to="/account" replace />} />
        <Route path="/analytics" element={<Navigate to="/desk" replace />} />
        <Route path="/reports/*" element={<Navigate to="/desk" replace />} />
        <Route path="*" element={<DefaultRedirect />} />
      </Route>
    </Routes>
  );
}
