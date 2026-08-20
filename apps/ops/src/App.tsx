import { Navigate, Route, Routes } from "react-router-dom";
import { OpsLayout } from "@/layouts/OpsLayout";
import { CustomerListPage } from "@/pages/customers/CustomerListPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

export function App() {
  return (
    <Routes>
      <Route element={<OpsLayout />}>
        <Route index element={<Navigate to="/customers" replace />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route
          path="/customers/new"
          element={<PlaceholderPage title="新增客户账号" />}
        />
        <Route
          path="/customers/:id"
          element={<PlaceholderPage title="客户详情" />}
        />
        <Route
          path="/customers/:id/edit"
          element={<PlaceholderPage title="编辑客户" />}
        />
        <Route
          path="/dashboard"
          element={<PlaceholderPage title="仪表盘" />}
        />
        <Route
          path="/customer-services"
          element={<PlaceholderPage title="客户产品服务" />}
        />
        <Route
          path="/products/verify"
          element={<PlaceholderPage title="版权核验服务配置" />}
        />
        <Route
          path="/products/audit"
          element={<PlaceholderPage title="智能审核服务配置" />}
        />
        <Route
          path="/stats/customers"
          element={<PlaceholderPage title="客户使用统计" />}
        />
        <Route
          path="/stats/products"
          element={<PlaceholderPage title="产品使用统计" />}
        />
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Route>
    </Routes>
  );
}
