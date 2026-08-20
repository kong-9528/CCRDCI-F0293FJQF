import { Navigate, Route, Routes } from "react-router-dom";
import { OpsLayout } from "@/layouts/OpsLayout";
import { CustomerCreatePage } from "@/pages/customers/CustomerCreatePage";
import { CustomerDetailPage } from "@/pages/customers/CustomerDetailPage";
import { CustomerEditPage } from "@/pages/customers/CustomerEditPage";
import { CustomerListPage } from "@/pages/customers/CustomerListPage";
import { CustomerServicesPage } from "@/pages/customers/CustomerServicesPage";
import { ProductManagePage } from "@/pages/products/ProductManagePage";
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
        <Route path="/dashboard" element={<PlaceholderPage title="仪表盘" />} />
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
