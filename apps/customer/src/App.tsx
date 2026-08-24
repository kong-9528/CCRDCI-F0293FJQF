import { Navigate, Route, Routes } from "react-router-dom";
import { CustomerLayout } from "@/layouts/CustomerLayout";
import { AccountCenterPage } from "@/pages/account/AccountCenterPage";
import { ApiDocProductPage } from "@/pages/api-docs/ApiDocProductPage";
import { ApiDocsOverviewPage } from "@/pages/api-docs/ApiDocsOverviewPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { DciVerifyPage } from "@/pages/verify/DciVerifyPage";

export function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/verify/dci" element={<DciVerifyPage />} />
        <Route
          path="/verify/info"
          element={<PlaceholderPage title="版权信息核验" note="阶段 2 接入完整核验能力。" />}
        />
        <Route
          path="/verify/certificate"
          element={<PlaceholderPage title="版权证书核验" note="阶段 2 接入证书上传与核验。" />}
        />
        <Route
          path="/review/safety"
          element={<PlaceholderPage title="内容安全审核" note="阶段 3 接入审核服务页。" />}
        />
        <Route
          path="/review/duplicate"
          element={<PlaceholderPage title="作品登记查重" note="阶段 3 接入查重服务页。" />}
        />
        <Route
          path="/review/infringement"
          element={<PlaceholderPage title="疑似侵权审核" note="阶段 3 接入侵权审核页。" />}
        />
        <Route path="/keys" element={<PlaceholderPage title="密钥管理" note="阶段 4 接入密钥展示与更新。" />} />
        <Route path="/account" element={<AccountCenterPage />} />
        <Route path="/api-docs" element={<ApiDocsOverviewPage />} />
        <Route path="/api-docs/:productId" element={<ApiDocProductPage />} />
        <Route path="/help" element={<PlaceholderPage title="帮助中心" note="阶段 6 接入帮助文档。" />} />
        {/* 旧路由重定向 */}
        <Route path="/audit" element={<Navigate to="/review/safety" replace />} />
        <Route path="/account/*" element={<Navigate to="/account" replace />} />
        <Route path="/analytics" element={<Navigate to="/" replace />} />
        <Route path="/reports/*" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
