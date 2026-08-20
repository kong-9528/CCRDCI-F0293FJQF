import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ACCOUNT_STATUS_LABEL,
  CUSTOMER_TYPE_LABEL,
  PERIOD_STATUS_LABEL,
  SERVICE_STATUS_LABEL,
  canConsumeQuota,
  deriveServiceStatus,
  formatQuota,
  productName,
} from "@/lib/catalog";
import { listPeriodStatus, useCustomerStore } from "@/lib/customersStore";

type TabKey = "detail" | "usage" | "logs";

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function CustomerDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { getById, getLogs, getUsage } = useCustomerStore();
  const customer = getById(id);
  const [tab, setTab] = useState<TabKey>("detail");
  const [logPage, setLogPage] = useState(1);
  const logPageSize = 10;

  const logs = useMemo(
    () => (customer ? getLogs(customer.id) : []),
    [customer, getLogs],
  );
  const usage = useMemo(
    () => (customer ? getUsage(customer) : []),
    [customer, getUsage],
  );

  const logTotalPages = Math.max(1, Math.ceil(logs.length / logPageSize));
  const logRows = logs.slice((logPage - 1) * logPageSize, logPage * logPageSize);

  if (!customer) {
    return (
      <div className="a-card">
        <div className="a-card__head">客户详情</div>
        <div className="a-card__body">
          <div className="a-empty">未找到该客户账号</div>
        </div>
      </div>
    );
  }

  const period = listPeriodStatus(customer);

  const downloadFile = (name: string) => {
    const blob = new Blob(
      [`[演示附件] ${name}\n客户：${customer.companyName}\n账号：${customer.account}\n`],
      { type: "text/plain;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name.endsWith(".pdf") ? name.replace(/\.pdf$/i, ".txt") : name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          客户详情 · {customer.account}
          <div className="a-card__extra a-inline-actions">
            <button
              type="button"
              className="a-btn a-btn--sm"
              onClick={() => navigate(`/customers/${customer.id}/edit`)}
            >
              编辑
            </button>
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate("/customers")}>
              返回列表
            </button>
          </div>
        </div>

        <div className="a-tabs" role="tablist">
          {(
            [
              ["detail", "详情信息"],
              ["usage", "使用统计"],
              ["logs", "操作日志"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              className={`a-tabs__item${tab === key ? " is-active" : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "detail" ? (
          <div className="a-card__body a-stack">
            <section className="a-form-section">
              <h3 className="a-form-section__title">客户信息</h3>
              <div className="a-desc">
                <div className="a-desc__item">
                  <span className="a-desc__label">客户类型</span>
                  <span className="a-desc__value">
                    {CUSTOMER_TYPE_LABEL[customer.customerType]}
                  </span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">统一社会信用代码</span>
                  <span className="a-desc__value">{customer.creditCode}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">公司全称</span>
                  <span className="a-desc__value">{customer.companyName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">法人代表</span>
                  <span className="a-desc__value">{customer.legalPerson || "—"}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系人姓名</span>
                  <span className="a-desc__value">{customer.contactName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系人电话</span>
                  <span className="a-desc__value">{customer.contactPhone}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系人邮箱</span>
                  <span className="a-desc__value">{customer.contactEmail}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">有效联系地址</span>
                  <span className="a-desc__value">{customer.address || "—"}</span>
                </div>
              </div>
            </section>

            <section className="a-form-section">
              <h3 className="a-form-section__title">合作信息</h3>
              <div className="a-desc">
                <div className="a-desc__item">
                  <span className="a-desc__label">合作起止</span>
                  <span className="a-desc__value">
                    {customer.contractStart} ~ {customer.contractEnd}
                  </span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">合同服务期</span>
                  <span className="a-desc__value">{PERIOD_STATUS_LABEL[period]}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">合同总金额</span>
                  <span className="a-desc__value">
                    {customer.contractAmount == null
                      ? "—"
                      : `${customer.contractAmount.toLocaleString()} 元`}
                  </span>
                </div>
              </div>
              <div className="a-field__hint" style={{ marginTop: 8 }}>
                合同附件下载（演示；正式环境需单独权限控制）
              </div>
              {customer.contractFiles.length === 0 ? (
                <div className="a-empty" style={{ padding: 16 }}>
                  暂无合同附件
                </div>
              ) : (
                <ul className="a-file-list">
                  {customer.contractFiles.map((f) => (
                    <li key={f.id}>
                      <span>
                        {f.name}
                        <span className="a-field__hint">（{formatSize(f.size)}）</span>
                      </span>
                      <button
                        type="button"
                        className="a-btn a-btn--text a-btn--sm"
                        onClick={() => downloadFile(f.name)}
                      >
                        下载
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="a-form-section">
              <h3 className="a-form-section__title">账号信息</h3>
              <div className="a-desc">
                <div className="a-desc__item">
                  <span className="a-desc__label">账号</span>
                  <span className="a-desc__value">
                    <code>{customer.account}</code>
                  </span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">客户状态</span>
                  <span className="a-desc__value">
                    <span
                      className={`a-tag${customer.status === "enabled" ? " a-tag--ok" : " a-tag--er"}`}
                    >
                      {ACCOUNT_STATUS_LABEL[customer.status]}
                    </span>
                  </span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">账号有效期</span>
                  <span className="a-desc__value">
                    {customer.accountStart} ~ {customer.accountEnd}
                  </span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">创建时间</span>
                  <span className="a-desc__value">{customer.createdAt}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">更新时间</span>
                  <span className="a-desc__value">{customer.updatedAt}</span>
                </div>
              </div>
            </section>

            <section className="a-form-section">
              <h3 className="a-form-section__title">产品服务配置</h3>
              <div className="a-field__hint" style={{ marginBottom: 8 }}>
                产品额度仅在产品有效期内可消耗；过期后次数保留但不可再使用（WebUI / API）。
                合同服务期仅用于业务提醒与展示，不参与登录或调用控制。客户能否登录取决于客户状态（启用/停用）。
              </div>
              <div className="a-table-wrap">
                <table className="a-table">
                  <thead>
                    <tr>
                      <th>产品</th>
                      <th>额度</th>
                      <th>有效期</th>
                      <th>服务状态</th>
                      <th>当前可否调用</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.productServices.map((svc) => {
                      const status = deriveServiceStatus(svc);
                      return (
                        <tr key={svc.product}>
                          <td>{productName(svc.product)}</td>
                          <td>{formatQuota(svc)}</td>
                          <td>
                            {svc.startDate} ~ {svc.endDate}
                          </td>
                          <td>
                            <span
                              className={`a-tag ${
                                status === "active"
                                  ? "a-tag--ok"
                                  : status === "pending"
                                    ? "a-tag--wn"
                                    : "a-tag--er"
                              }`}
                            >
                              {SERVICE_STATUS_LABEL[status]}
                            </span>
                          </td>
                          <td>
                            {canConsumeQuota(svc) ? (
                              <span className="a-tag a-tag--ok">可调用</span>
                            ) : (
                              <span className="a-tag a-tag--er">不可调用</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {tab === "usage" ? (
          <div className="a-card__body a-card__body--flush">
            <table className="a-table">
              <thead>
                <tr>
                  <th>账号</th>
                  <th>产品</th>
                  <th>产品服务状态</th>
                  <th>历史累积调用次数</th>
                  <th>历史累积成功率</th>
                </tr>
              </thead>
              <tbody>
                {usage.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="a-empty">暂无产品使用数据</div>
                    </td>
                  </tr>
                ) : (
                  usage.map((row) => (
                    <tr key={row.product}>
                      <td>
                        <code>{row.account}</code>
                      </td>
                      <td>{productName(row.product)}</td>
                      <td>
                        <span
                          className={`a-tag ${
                            row.serviceStatus === "active"
                              ? "a-tag--ok"
                              : row.serviceStatus === "pending"
                                ? "a-tag--wn"
                                : "a-tag--er"
                          }`}
                        >
                          {SERVICE_STATUS_LABEL[row.serviceStatus]}
                        </span>
                      </td>
                      <td className="num">{row.totalCalls.toLocaleString()}</td>
                      <td className="num">{row.successRate.toFixed(1)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "logs" ? (
          <div className="a-card__body a-card__body--flush">
            <table className="a-table">
              <thead>
                <tr>
                  <th>操作时间</th>
                  <th>摘要</th>
                  <th>变更明细</th>
                  <th>操作人</th>
                </tr>
              </thead>
              <tbody>
                {logRows.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="a-empty">暂无操作日志</div>
                    </td>
                  </tr>
                ) : (
                  logRows.map((log) => (
                    <tr key={log.id}>
                      <td>{log.at}</td>
                      <td>{log.summary}</td>
                      <td>
                        <div className="a-log-changes">
                          {log.changes.map((c, i) => (
                            <div key={`${log.id}-${i}`}>
                              <b>{c.field}</b>：{c.before} → {c.after}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>{log.operator}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="a-pagination">
              <span>
                共 {logs.length} 条 · 第 {logPage}/{logTotalPages} 页
              </span>
              <button
                type="button"
                disabled={logPage <= 1}
                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </button>
              <button
                type="button"
                disabled={logPage >= logTotalPages}
                onClick={() => setLogPage((p) => Math.min(logTotalPages, p + 1))}
              >
                下一页
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
