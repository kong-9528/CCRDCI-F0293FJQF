import { DashboardOverviewBar } from "@/components/dashboard/DashboardOverviewBar";
import { DashboardQuickLinks } from "@/components/dashboard/DashboardQuickLinks";
import { DashboardQuotaGrid } from "@/components/dashboard/DashboardQuotaGrid";
import { DashboardRecentRecords } from "@/components/dashboard/DashboardRecentRecords";
import { DashboardTrendChart } from "@/components/dashboard/DashboardTrendChart";
import { DashboardWarningPanel } from "@/components/dashboard/DashboardWarningPanel";

export function DashboardPage() {
  return (
    <div className="a-stack c-dashboard">
      <DashboardOverviewBar />
      <DashboardQuotaGrid />
      <DashboardWarningPanel />
      <DashboardTrendChart />
      <div className="c-dash-split">
        <DashboardRecentRecords />
        <DashboardQuickLinks />
      </div>
    </div>
  );
}
