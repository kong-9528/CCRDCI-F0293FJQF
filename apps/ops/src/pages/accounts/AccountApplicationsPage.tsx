import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ProductServiceTags } from "@/components/ProductServiceTags";
import {
  APPLICATION_STATUS_LABEL,
  useAccountsStore,
  type AccountApplication,
  type ApplicationStatus,
} from "@/lib/accountsStore";
import {
  CONFIGURABLE_PRODUCTS,
  customerHasProduct,
  normalizeProductCode,
  productName,
  type ProductCode,
  type ProductServiceConfig,
} from "@/lib/catalog";
import { getCustomerById } from "@/lib/customersStore";

const PAGE_SIZES = [10, 20, 30, 50] as const;

type Filters = {
  company: string;
  creditCode: string;
  account: string;
  product: string;
  status: string;
};

const EMPTY_FILTERS: Filters = {
  company: "",
  creditCode: "",
  account: "",
  product: "",
  status: "",
};

function applicationProductServices(app: AccountApplication): ProductServiceConfig[] {
  if (app.status === "approved" && app.customerId) {
    const customer = getCustomerById(app.customerId);
    if (customer) return customer.productServices;
  }
  return app.requestedProducts.map((code) => ({
    product: normalizeProductCode(code),
    quotaType: "total" as const,
    quotaTotal: null,
    usedCount: 0,
    startDate: app.contractStart,
    endDate: app.contractEnd,
    stopped: false,
  }));
}

function statusTag(status: ApplicationStatus) {
  if (status === "approved") return <span className="a-tag a-tag--ok">{APPLICATION_STATUS_LABEL[status]}</span>;
  if (status === "rejected") return <span className="a-tag a-tag--er">{APPLICATION_STATUS_LABEL[status]}</span>;
  return <span className="a-tag a-tag--wn">{APPLICATION_STATUS_LABEL[status]}</span>;
}

function matchesFilters(row: AccountApplication, f: Filters) {
  const companyQ = f.company.trim();
  if (companyQ && !row.companyName.includes(companyQ)) return false;

  const creditQ = f.creditCode.trim();
  if (creditQ && !row.creditCode.includes(creditQ)) return false;

  const accountQ = f.account.trim();
  if (accountQ && !row.account.includes(accountQ)) return false;

  if (f.product && !customerHasProduct(applicationProductServices(row), f.product)) {
    return false;
  }

  if (f.status && row.status !== f.status) return false;
  return true;
}

export function AccountApplicationsPage() {
  const { applications } = useAccountsStore();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [jump, setJump] = useState("");

  const filtered = useMemo(
    () =>
      [...applications]
        .filter((row) => matchesFilters(row, applied))
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [applications, applied],
  );

  const pendingCount = applications.filter((a) => a.status === "pending").length;
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

  const goPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
  };

  return (
    <div className="a-card">
      <div className="a-toolbar">
        <div className="a-field">
          <span className="a-field__label">机构/企业名称</span>
          <input
            className="a-input"
            style={{ minWidth: 220 }}
            placeholder="请输入机构/企业名称"
            value={draft.company}
            onChange={(e) => setFilter("company", e.target.value)}
          />
        </div>
        <div className="a-field">
          <span className="a-field__label">信用代码</span>
          <input
            className="a-input"
            placeholder="请输入统一社会信用代码"
            value={draft.creditCode}
            onChange={(e) => setFilter("creditCode", e.target.value)}
          />
        </div>
        <div className="a-field">
          <span className="a-field__label">申请账号</span>
          <input
            className="a-input"
            placeholder="请输入申请账号"
            value={draft.account}
            onChange={(e) => setFilter("account", e.target.value)}
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
            {CONFIGURABLE_PRODUCTS.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="a-field">
          <span className="a-field__label">状态</span>
          <select
            className="a-select"
            value={draft.status}
            onChange={(e) => setFilter("status", e.target.value)}
          >
            <option value="">请选择状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
        <button type="button" className="a-btn" onClick={reset}>
          重置
        </button>
        <button type="button" className="a-btn a-btn--primary" onClick={search}>
          查询
        </button>
      </div>

      <div className="a-card__body a-card__body--flush">
        <table className="a-table a-table--accounts">
          <thead>
            <tr>
              <th>机构/企业名称</th>
              <th>统一社会信用代码</th>
              <th>联系人姓名</th>
              <th>申请账号</th>
              <th>开通产品</th>
              <th>提交时间</th>
              <th>状态</th>
              <th className="a-table__col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="a-empty">暂无符合条件的申请记录</div>
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.companyName}</td>
                  <td>{row.creditCode}</td>
                  <td>{row.contactName}</td>
                  <td>
                    <code style={{ fontFamily: "var(--font-mono)" }}>{row.account}</code>
                  </td>
                  <td>
                    <ProductServiceTags services={applicationProductServices(row)} />
                  </td>
                  <td>{row.submittedAt}</td>
                  <td>{statusTag(row.status)}</td>
                  <td>
                    <div className="a-actions a-actions--nowrap">
                      {row.status === "pending" ? (
                        <Link
                          to={`/accounts/${row.id}/review`}
                          className="a-btn a-btn--text a-btn--sm"
                        >
                          审核
                        </Link>
                      ) : (
                        <>
                          <Link to={`/accounts/${row.id}`} className="a-btn a-btn--text a-btn--sm">
                            查看
                          </Link>
                          {row.status === "approved" ? (
                            <Link
                              to={`/accounts/${row.id}/edit`}
                              className="a-btn a-btn--text a-btn--sm"
                            >
                              编辑
                            </Link>
                          ) : null}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="a-list-footer">
        <div className="a-summary">
          当前筛选结果共 <b>{filtered.length}</b> 条申请
          {pendingCount > 0 ? (
            <>
              ，其中待审核 <b>{pendingCount}</b> 条
            </>
          ) : null}
          {applied.product
            ? `，已筛选产品「${productName(applied.product as ProductCode)}」`
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
  );
}
