import { useAuth } from "@/lib/auth";
import { listRiskEvents, markRiskHandled } from "@/lib/ucUserStore";
import { useUcTick } from "@/lib/useUcTick";

const LEVEL_LABEL = { low: "低", medium: "中", high: "高" } as const;

export function RisksPage() {
  useUcTick();
  const { session } = useAuth();
  const rows = listRiskEvents();

  return (
    <div className="uo-page">
      <h1 className="uo-page__title">风险事件</h1>
      <p className="uo-page__desc">异常登录与风控告警（演示）。</p>
      <div className="a-card a-card--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>用户</th>
              <th>级别</th>
              <th>类型</th>
              <th>详情</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.at}</td>
                <td>
                  <code>{r.username}</code>
                </td>
                <td>{LEVEL_LABEL[r.level]}</td>
                <td>{r.type}</td>
                <td>{r.detail}</td>
                <td>{r.handled ? "已处理" : "待处理"}</td>
                <td>
                  {!r.handled ? (
                    <button
                      type="button"
                      className="a-link"
                      onClick={() => markRiskHandled(r.id, session?.username ?? "operator")}
                    >
                      标记已处理
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
