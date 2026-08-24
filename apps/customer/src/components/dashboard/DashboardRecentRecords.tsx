import { Link } from "react-router-dom";
import { RECENT_VERIFY_ROWS } from "@/lib/dashboard";

export function DashboardRecentRecords() {
  return (
    <div className="a-card">
      <div className="a-card__head">
        最近核验记录
        <span className="a-field__hint" style={{ marginLeft: 8 }}>
          近 5 条
        </span>
        <div className="a-card__extra">
          <Link to="/verify/dci" className="a-btn a-btn--text a-btn--sm">
            查看全部 →
          </Link>
        </div>
      </div>
      <div className="a-card__body a-card__body--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>类型</th>
              <th>方式</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_VERIFY_ROWS.map((row) => (
              <tr key={row.id}>
                <td>{row.at}</td>
                <td>{row.typeLabel}</td>
                <td>{row.channel}</td>
                <td>
                  <span className={`a-tag ${row.status === "pass" ? "a-tag--ok" : "a-tag--er"}`}>
                    {row.status === "pass" ? "通过" : "未通过"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
