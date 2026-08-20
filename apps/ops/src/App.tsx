import { Navigate, Route, Routes } from "react-router-dom";
import { OpsLayout } from "@/layouts/OpsLayout";
import { ContentManagePage } from "@/pages/content/ContentManagePage";
import { FaqManagePage } from "@/pages/content/FaqManagePage";
import { CustomerCreatePage } from "@/pages/customers/CustomerCreatePage";
import { CustomerDetailPage } from "@/pages/customers/CustomerDetailPage";
import { CustomerEditPage } from "@/pages/customers/CustomerEditPage";
import { CustomerListPage } from "@/pages/customers/CustomerListPage";
import { CustomerServicesPage } from "@/pages/customers/CustomerServicesPage";
import { ProductManagePage } from "@/pages/products/ProductManagePage";
import { CustomerStatsPage } from "@/pages/stats/CustomerStatsPage";
import { ProductStatsPage } from "@/pages/stats/ProductStatsPage";
import { ApiServicesPage } from "@/pages/system/ApiServicesPage";
import { OpLogsPage } from "@/pages/system/OpLogsPage";
import { RolesPage } from "@/pages/system/RolesPage";
import { UsersPage } from "@/pages/system/UsersPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

export function App() {
  return (
    <Routes>
      <Route element={<OpsLayout />}>
        <Route index element={<Navigate to="/customers" replace />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/new" element={<CustomerCreatePage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/customers/:id/edit" element={<CustomerEditPage />} />
        <Route path="/customer-services" element={<CustomerServicesPage />} />
        <Route path="/products" element={<ProductManagePage />} />
        <Route path="/stats/customers" element={<CustomerStatsPage />} />
        <Route path="/stats/products" element={<ProductStatsPage />} />
        <Route path="/content/hc" element={<ContentManagePage />} />
        <Route path="/content/catalogs" element={<Navigate to="/content/hc" replace />} />
        <Route path="/content/articles" element={<Navigate to="/content/hc" replace />} />
        <Route path="/content/faqs" element={<FaqManagePage />} />
        <Route path="/system/roles" element={<RolesPage />} />
        <Route path="/system/users" element={<UsersPage />} />
        <Route path="/system/api-services" element={<ApiServicesPage />} />
        <Route path="/system/op-logs" element={<OpLogsPage />} />
        <Route path="/dashboard" element={<PlaceholderPage title="仪表盘" />} />
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Route>
    </Routes>
  );
}
