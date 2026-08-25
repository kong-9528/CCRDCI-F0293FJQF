import { Navigate, Route, Routes } from "react-router-dom";
import { OpsLayout } from "@/layouts/OpsLayout";
import { ContentManagePage } from "@/pages/content/ContentManagePage";
import { ArticleEditPage } from "@/pages/content/ArticleEditPage";
import { FaqManagePage } from "@/pages/content/FaqManagePage";
import { PortalContentPage } from "@/pages/content/PortalContentPage";
import { PortalHomeEditPage } from "@/pages/content/PortalHomeEditPage";
import { PortalHomeManagePage } from "@/pages/content/PortalHomeManagePage";
import { CustomerCreatePage } from "@/pages/customers/CustomerCreatePage";
import { CustomerContractsPage } from "@/pages/customers/CustomerContractsPage";
import { CustomerDetailPage } from "@/pages/customers/CustomerDetailPage";
import { CustomerEditPage } from "@/pages/customers/CustomerEditPage";
import { CustomerListPage } from "@/pages/customers/CustomerListPage";
import { CustomerServicesPage } from "@/pages/customers/CustomerServicesPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProductManagePage } from "@/pages/products/ProductManagePage";
import { CustomerStatsPage } from "@/pages/stats/CustomerStatsPage";
import { ProductStatsPage } from "@/pages/stats/ProductStatsPage";
import { ApiServicesPage } from "@/pages/system/ApiServicesPage";
import { OpLogsPage } from "@/pages/system/OpLogsPage";
import { RolesPage } from "@/pages/system/RolesPage";
import { UsersPage } from "@/pages/system/UsersPage";

export function App() {
  return (
    <Routes>
      <Route element={<OpsLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/new" element={<CustomerCreatePage />} />
        <Route path="/customers/:id/edit" element={<CustomerEditPage />} />
        <Route path="/customers/:id/contracts" element={<CustomerContractsPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/customer-services" element={<CustomerServicesPage />} />
        <Route path="/products" element={<ProductManagePage />} />
        <Route path="/stats/customers" element={<CustomerStatsPage />} />
        <Route path="/stats/products" element={<ProductStatsPage />} />
        <Route path="/content/home" element={<PortalHomeManagePage />} />
        <Route path="/content/home/:id/edit" element={<PortalHomeEditPage />} />
        <Route path="/content/portal" element={<PortalContentPage />} />
        <Route path="/content/hc" element={<ContentManagePage />} />
        <Route path="/content/hc/articles/new" element={<ArticleEditPage />} />
        <Route path="/content/hc/articles/:id/edit" element={<ArticleEditPage />} />
        <Route path="/content/catalogs" element={<Navigate to="/content/hc" replace />} />
        <Route path="/content/articles" element={<Navigate to="/content/hc" replace />} />
        <Route path="/content/faqs" element={<FaqManagePage />} />
        <Route path="/system/roles" element={<RolesPage />} />
        <Route path="/system/users" element={<UsersPage />} />
        <Route path="/system/api-services" element={<ApiServicesPage />} />
        <Route path="/system/op-logs" element={<OpLogsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
