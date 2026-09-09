import {
  SECURITY_ACTION_LABEL,
  listSecurityLogs,
  type SecurityAction,
} from "@/lib/ucUserStore";
import { useUcTick } from "@/lib/useUcTick";

export function SecurityLogsPage() {
  useUcTick();
  const rows = listSecurityLogs();

  return (
    <div className="uo-page">
      <h1 className="uo-page__title">用户安全日志</h1>
      <p className="uo-page__desc">
        C 端用户安全相关行为：登录、修改密码、更换绑定手机号、重置密码等。
      </p>
      <div className="a-card a-card--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>用户名</th>
              <th>行为</th>
              <th>结果</th>
              <th>详情</th>
              <th>IP</th>
              <th>客户端</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.at}</td>
                <td>
                  <code>{r.username}</code>
                </td>
                <td>{SECURITY_ACTION_LABEL[r.action as SecurityAction]}</td>
                <td>
                  <span className={`a-tag${r.result === "success" ? " a-tag--ok" : " a-tag--er"}`}>
                    {r.result === "success" ? "成功" : "失败"}
                  </span>
                </td>
                <td>{r.detail ?? "—"}</td>
                <td>{r.ip}</td>
                <td>{r.client}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
