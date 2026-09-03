import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { OpsLayout } from "@/layouts/OpsLayout";
import { ContentManagePage } from "@/pages/content/ContentManagePage";
import { ArticleEditPage } from "@/pages/content/ArticleEditPage";
import { PortalContentPage } from "@/pages/content/PortalContentPage";
import { PortalHomeEditPage } from "@/pages/content/PortalHomeEditPage";
import { PortalHomeManagePage } from "@/pages/content/PortalHomeManagePage";
import { AccountApplicationEditPage } from "@/pages/accounts/AccountApplicationEditPage";
import { AccountApplicationPage } from "@/pages/accounts/AccountApplicationPage";
import { AccountApplicationsPage } from "@/pages/accounts/AccountApplicationsPage";
import { CustomerCreatePage } from "@/pages/customers/CustomerCreatePage";
import { CustomerContractsPage } from "@/pages/customers/CustomerContractsPage";
import { CustomerDetailPage } from "@/pages/customers/CustomerDetailPage";
import { CustomerEditPage } from "@/pages/customers/CustomerEditPage";
import { CustomerListPage } from "@/pages/customers/CustomerListPage";
import { CustomerServicesPage } from "@/pages/customers/CustomerServicesPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProductManagePage } from "@/pages/products/ProductManagePage";
import { CustomerStatsPage } from "@/pages/stats/CustomerStatsPage";
import { AccountProductStatsPage } from "@/pages/stats/AccountProductStatsPage";
import { ProductStatsPage } from "@/pages/stats/ProductStatsPage";
import { ApiEndpointEditPage } from "@/pages/system/ApiEndpointEditPage";
import { ApiServicesPage } from "@/pages/system/ApiServicesPage";
import { OpLogsPage } from "@/pages/system/OpLogsPage";
import { InviteCodesPage } from "@/pages/system/InviteCodesPage";
import { RolesPage } from "@/pages/system/RolesPage";
import { UsersPage } from "@/pages/system/UsersPage";

function RedirectGuideArticleEdit() {
  const { id } = useParams();
  return <Navigate to={`/content/center/articles/${id}/edit?channel=portal_guide`} replace />;
}

function RedirectConsoleHelpArticleEdit() {
  const { id } = useParams();
  return <Navigate to={`/content/center/articles/${id}/edit?channel=console_help`} replace />;
}

export function App() {
  return (
    <Routes>
      <Route element={<OpsLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/accounts" element={<Navigate to="/accounts/pending" replace />} />
        <Route path="/accounts/pending" element={<AccountApplicationsPage mode="pending" />} />
        <Route path="/accounts/mine" element={<AccountApplicationsPage mode="mine" />} />
        <Route path="/accounts/all" element={<AccountApplicationsPage mode="all" />} />
        <Route path="/accounts/:id/review" element={<AccountApplicationPage mode="review" />} />
        <Route path="/accounts/:id/edit" element={<AccountApplicationEditPage />} />
        <Route path="/accounts/:id" element={<AccountApplicationPage mode="view" />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/new" element={<CustomerCreatePage />} />
        <Route path="/customers/:id/edit" element={<CustomerEditPage />} />
        <Route path="/customers/:id/contracts" element={<CustomerContractsPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/customer-services" element={<CustomerServicesPage />} />
        <Route path="/products" element={<Navigate to="/products/verify" replace />} />
        <Route path="/products/verify" element={<ProductManagePage category="verify" />} />
        <Route path="/products/audit" element={<ProductManagePage category="audit" />} />
        <Route path="/stats/customers" element={<CustomerStatsPage />} />
        <Route path="/stats/products" element={<ProductStatsPage />} />
        <Route path="/stats/account-products" element={<AccountProductStatsPage />} />
        <Route path="/content/home" element={<PortalHomeManagePage />} />
        <Route path="/content/home/:id/edit" element={<PortalHomeEditPage />} />
        <Route path="/content/portal" element={<PortalContentPage />} />
        <Route path="/content/center" element={<ContentManagePage />} />
        <Route path="/content/center/articles/new" element={<ArticleEditPage />} />
        <Route path="/content/center/articles/:id/edit" element={<ArticleEditPage />} />
        <Route path="/content/guide" element={<Navigate to="/content/center?channel=portal_guide" replace />} />
        <Route
          path="/content/guide/articles/new"
          element={<Navigate to="/content/center/articles/new?channel=portal_guide" replace />}
        />
        <Route path="/content/guide/articles/:id/edit" element={<RedirectGuideArticleEdit />} />
        <Route
          path="/content/console-help"
          element={<Navigate to="/content/center?channel=console_help" replace />}
        />
        <Route
          path="/content/console-help/articles/new"
          element={<Navigate to="/content/center/articles/new?channel=console_help" replace />}
        />
        <Route
          path="/content/console-help/articles/:id/edit"
          element={<RedirectConsoleHelpArticleEdit />}
        />
        <Route path="/content/hc" element={<Navigate to="/content/center?channel=portal_guide" replace />} />
        <Route
          path="/content/hc/articles/new"
          element={<Navigate to="/content/center/articles/new?channel=portal_guide" replace />}
        />
        <Route path="/content/hc/articles/:id/edit" element={<RedirectGuideArticleEdit />} />
        <Route path="/content/catalogs" element={<Navigate to="/content/center?channel=portal_guide" replace />} />
        <Route path="/content/articles" element={<Navigate to="/content/center?channel=portal_guide" replace />} />
        <Route path="/content/faqs" element={<Navigate to="/content/center?channel=portal_faq" replace />} />
        <Route path="/system/roles" element={<RolesPage />} />
        <Route path="/system/users" element={<UsersPage />} />
        <Route path="/system/invite-codes" element={<InviteCodesPage />} />
        <Route path="/system/api-services" element={<ApiServicesPage />} />
        <Route path="/system/api-services/new" element={<ApiEndpointEditPage />} />
        <Route path="/system/api-services/:id/edit" element={<ApiEndpointEditPage />} />
        <Route path="/system/op-logs" element={<OpLogsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
