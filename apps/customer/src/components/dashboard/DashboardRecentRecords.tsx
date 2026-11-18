import { Link } from "react-router-dom";
import {
  getRecentActivityRows,
  recentActivityAllLink,
  recentActivityTitle,
} from "@/lib/dashboard";

export function DashboardRecentRecords() {
  const rows = getRecentActivityRows();
  const title = recentActivityTitle();
  const allLink = recentActivityAllLink();
  const isReview = title.includes("审核");

  return (
    <div className="a-card">
      <div className="a-card__head">
        {title}
        <span className="a-field__hint" style={{ marginLeft: 8 }}>
          近 {rows.length} 条
        </span>
        <div className="a-card__extra">
          <Link to={allLink} className="a-btn a-btn--text a-btn--sm">
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
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.at}</td>
                <td>{row.typeLabel}</td>
                <td>{row.channel}</td>
                <td>
                  <span className={`a-tag ${row.status === "pass" ? "a-tag--ok" : "a-tag--er"}`}>
                    {isReview
                      ? row.status === "pass"
                        ? "成功"
                        : "失败"
                      : row.status === "pass"
                        ? "核验通过"
                        : "核验不通过"}
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
