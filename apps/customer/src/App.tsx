import { Navigate, Route, Routes } from "react-router-dom";
import { CustomerLayout } from "@/layouts/CustomerLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { DciVerifyPage } from "@/pages/verify/DciVerifyPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

export function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/verify/dci" element={<DciVerifyPage />} />
        <Route
          path="/verify/info"
          element={<PlaceholderPage title="版权信息核验" />}
        />
        <Route
          path="/verify/certificate"
          element={<PlaceholderPage title="版权证书核验" />}
        />
        <Route path="/audit" element={<PlaceholderPage title="智能审核服务" />} />
        <Route path="/api-docs" element={<PlaceholderPage title="API 文档" />} />
        <Route path="/keys" element={<PlaceholderPage title="密钥管理" />} />
        <Route path="/analytics" element={<PlaceholderPage title="数据分析" />} />
        <Route
          path="/reports/supervise"
          element={<PlaceholderPage title="上级监管报表" />}
        />
        <Route
          path="/reports/subscribe"
          element={<PlaceholderPage title="订阅报表下载" />}
        />
        <Route path="/account/org" element={<PlaceholderPage title="机构信息" />} />
        <Route
          path="/account/services"
          element={<PlaceholderPage title="服务列表" />}
        />
        <Route
          path="/account/contracts"
          element={<PlaceholderPage title="合同信息" />}
        />
        <Route path="/help" element={<PlaceholderPage title="帮助中心" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
