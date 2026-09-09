import { getDashboardStats } from "@/lib/ucUserStore";
import { useUcTick } from "@/lib/useUcTick";

export function DashboardPage() {
  useUcTick();
  const s = getDashboardStats();

  return (
    <div className="uo-page">
      <h1 className="uo-page__title">首页</h1>
      <p className="uo-page__desc">C 端注册用户总览（数据来自统一用户中心 UC）。</p>
      <div className="uo-stat-grid">
        <div className="uo-stat">
          <div className="uo-stat__label">注册用户</div>
          <div className="uo-stat__value">{s.total}</div>
        </div>
        <div className="uo-stat">
          <div className="uo-stat__label">注销</div>
          <div className="uo-stat__value">{s.cancelled}</div>
        </div>
        <div className="uo-stat">
          <div className="uo-stat__label">今日成功登录</div>
          <div className="uo-stat__value">{s.todayLogins}</div>
        </div>
      </div>
    </div>
  );
}
