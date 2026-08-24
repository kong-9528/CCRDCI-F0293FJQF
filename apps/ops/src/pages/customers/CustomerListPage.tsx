import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  ACCOUNT_STATUS_LABEL,
  PERIOD_STATUS_LABEL,
  PRODUCTS,
  derivePeriodStatus,
  productName,
  type AccountStatus,
  type ContractPeriodStatus,
  type CustomerAccount,
  type ProductCode,
} from "@/lib/catalog";
import { listPeriodStatus, useCustomerStore } from "@/lib/customersStore";
import { getCurrentUserPermissions } from "@/lib/usersStore";

const PAGE_SIZES = [10, 20, 30, 50] as const;

type Filters = {
  account: string;
  customer: string;
  contact: string;
  product: string;
  status: string;
  period: string;
  expireFrom: string;
  expireTo: string;
};

const EMPTY_FILTERS: Filters = {
  account: "",
  customer: "",
  contact: "",
  product: "",
  status: "",
  period: "",
  expireFrom: "",
  expireTo: "",
};

function matchesFilters(row: CustomerAccount, f: Filters) {
  if (f.account && row.account !== f.account.trim()) return false;

  const customerQ = f.customer.trim();
  if (customerQ) {
    const hit =
      row.companyName.includes(customerQ) || row.creditCode.includes(customerQ);
    if (!hit) return false;
  }

  if (f.contact.trim() && !row.contactName.includes(f.contact.trim())) return false;

  const products = row.productServices.map((s) => s.product);
  if (f.product && !products.includes(f.product as ProductCode)) return false;

  if (f.status && row.status !== f.status) return false;

  const period = listPeriodStatus(row);
  if (f.period && period !== f.period) return false;

  if (f.expireFrom && row.contractEnd < f.expireFrom) return false;
  if (f.expireTo && row.contractEnd > f.expireTo) return false;

  return true;
}

export function CustomerListPage() {
  const navigate = useNavigate();
  const { customers, setStatus } = useCustomerStore();
  const userPerms = getCurrentUserPermissions();
  const canContracts =
    userPerms.includes("customers.list.contracts") || userPerms.includes("customers");
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [jump, setJump] = useState("");
  const [confirm, setConfirm] = useState<CustomerAccount | null>(null);

  const filtered = useMemo(
    () => customers.filter((r) => matchesFilters(r, applied)),
    [customers, applied],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const search = () => {
    setApplied(draft);
    setPage(1);
  };

  const reset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  };

  const toggleStatus = () => {
    if (!confirm) return;
    const next: AccountStatus = confirm.status === "enabled" ? "disabled" : "enabled";
    setStatus(confirm.id, next);
    setConfirm(null);
  };

  const goPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
  };

  return (
    <>
      <div className="a-card">
        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">账号</span>
            <input
              className="a-input"
              placeholder="请输入账号"
              value={draft.account}
              onChange={(e) => setFilter("account", e.target.value)}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">客户</span>
            <input
              className="a-input"
              style={{ minWidth: 220 }}
              placeholder="请输入公司全称或企业统一社会信用代码"
              value={draft.customer}
              onChange={(e) => setFilter("customer", e.target.value)}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">联系人</span>
            <input
              className="a-input"
              placeholder="请输入联系人姓名"
              value={draft.contact}
              onChange={(e) => setFilter("contact", e.target.value)}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">产品</span>
            <select
              className="a-select"
              value={draft.product}
              onChange={(e) => setFilter("product", e.target.value)}
            >
              <option value="">请选择产品</option>
              {PRODUCTS.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">账号状态</span>
            <select
              className="a-select"
              value={draft.status}
              onChange={(e) => setFilter("status", e.target.value)}
            >
              <option value="">请选择账号状态</option>
              <option value="enabled">已启用</option>
              <option value="disabled">已停用</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">合同服务期</span>
            <select
              className="a-select"
              value={draft.period}
              onChange={(e) => setFilter("period", e.target.value)}
            >
              <option value="">请选择服务期状态</option>
              {(Object.keys(PERIOD_STATUS_LABEL) as ContractPeriodStatus[]).map((key) => (
                <option key={key} value={key}>
                  {PERIOD_STATUS_LABEL[key]}
                </option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">合同到期时间</span>
            <div className="a-date-range">
              <input
                type="date"
                className="a-input"
                value={draft.expireFrom}
                onChange={(e) => setFilter("expireFrom", e.target.value)}
              />
              <span>至</span>
              <input
                type="date"
                className="a-input"
                value={draft.expireTo}
                onChange={(e) => setFilter("expireTo", e.target.value)}
              />
            </div>
          </div>
          <button type="button" className="a-btn" onClick={reset}>
            重置
          </button>
          <button type="button" className="a-btn a-btn--primary" onClick={search}>
            查询
          </button>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => navigate("/customers/new")}
          >
            新增客户账号
          </button>
        </div>

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>账号</th>
                <th>公司名称</th>
                <th>联系人姓名</th>
                <th>开通产品</th>
                <th>账号状态</th>
                <th>合同服务期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="a-empty">暂无符合条件的客户账号</div>
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => {
                  const period = listPeriodStatus(row);
                  return (
                    <tr key={row.id}>
                      <td>
                        <code style={{ fontFamily: "var(--font-mono)" }}>{row.account}</code>
                      </td>
                      <td>{row.companyName}</td>
                      <td>{row.contactName}</td>
                      <td>
                        <div className="a-tag--list">
                          {row.productServices.map((svc) => {
                            const expired =
                              derivePeriodStatus(svc.startDate, svc.endDate) === "expired";
                            return (
                              <span
                                key={svc.product}
                                className={`a-tag${expired ? " a-tag--muted" : " a-tag--cyan"}`}
                                title={
                                  expired
                                    ? `产品有效期已到期（${svc.startDate} ~ ${svc.endDate}）`
                                    : `产品有效期 ${svc.startDate} ~ ${svc.endDate}`
                                }
                              >
                                {productName(svc.product)}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`a-tag${row.status === "enabled" ? " a-tag--ok" : " a-tag--er"}`}
                        >
                          <span
                            className={`a-dot ${row.status === "enabled" ? "a-dot--ok" : "a-dot--er"}`}
                          />
                          {ACCOUNT_STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td>
                        <div>{PERIOD_STATUS_LABEL[period as ContractPeriodStatus]}</div>
                        <div style={{ color: "var(--n-400)", fontSize: 13 }}>
                          {row.contractStart} ~ {row.contractEnd}
                        </div>
                      </td>
                      <td>
                        <div className="a-actions">
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => navigate(`/customers/${row.id}`)}
                          >
                            详情
                          </button>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => navigate(`/customers/${row.id}/edit`)}
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => setConfirm(row)}
                          >
                            {row.status === "enabled" ? "停用" : "启用"}
                          </button>
                          {canContracts ? (
                            <button
                              type="button"
                              className="a-btn a-btn--text a-btn--sm"
                              onClick={() => navigate(`/customers/${row.id}/contracts`)}
                            >
                              合同
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="a-list-footer">
          <div className="a-summary">
            当前筛选结果共 <b>{filtered.length}</b> 个账号
            {applied.product
              ? `，其中配置过「${productName(applied.product as ProductCode)}」的账号已纳入`
              : ""}
          </div>

          <div className="a-pagination">
            <span>
              共 {filtered.length} 条 · 第 {safePage}/{totalPages} 页
            </span>
            <select
              className="a-select"
              style={{ minWidth: 88 }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]);
                setPage(1);
              }}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} 条/页
                </option>
              ))}
            </select>
            <button type="button" disabled={safePage <= 1} onClick={() => goPage(1)}>
              首页
            </button>
            <button type="button" disabled={safePage <= 1} onClick={() => goPage(safePage - 1)}>
              上一页
            </button>
            <button type="button" className="is-active" onClick={() => undefined}>
              {safePage}
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => goPage(safePage + 1)}
            >
              下一页
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => goPage(totalPages)}
            >
              尾页
            </button>
            <label className="a-pagination__jump">
              跳至
              <input
                className="a-input a-input--sm"
                value={jump}
                onChange={(e) => setJump(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && jump) {
                    goPage(Number(jump));
                    setJump("");
                  }
                }}
              />
              页
              <button
                type="button"
                className="a-btn a-btn--sm"
                onClick={() => {
                  if (jump) {
                    goPage(Number(jump));
                    setJump("");
                  }
                }}
              >
                GO
              </button>
            </label>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.status === "enabled" ? "确认停用账号" : "确认启用账号"}
        description={
          confirm
            ? `确定要${confirm.status === "enabled" ? "停用" : "启用"}账号「${confirm.account}」（${confirm.companyName}）吗？`
            : ""
        }
        confirmText={confirm?.status === "enabled" ? "停用" : "启用"}
        danger={confirm?.status === "enabled"}
        onCancel={() => setConfirm(null)}
        onConfirm={toggleStatus}
      />
    </>
  );
}
