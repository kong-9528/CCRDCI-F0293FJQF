import { listOpLogs } from "@/lib/ucUserStore";
import { useUcTick } from "@/lib/useUcTick";

export function OpLogsPage() {
  useUcTick();
  const rows = listOpLogs();

  return (
    <div className="uo-page">
      <h1 className="uo-page__title">操作日志</h1>
      <p className="uo-page__desc">运营人员在本系统的操作审计。</p>
      <div className="a-card a-card--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>操作人</th>
              <th>动作</th>
              <th>对象</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.at}</td>
                <td>
                  <code>{r.operator}</code>
                </td>
                <td>{r.action}</td>
                <td>{r.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
