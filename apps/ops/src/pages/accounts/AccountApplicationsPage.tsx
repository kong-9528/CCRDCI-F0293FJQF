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
import { getCurrentUser } from "@/lib/usersStore";

const PAGE_SIZES = [10, 20, 30, 50] as const;

export type AccountListMode = "pending" | "mine" | "all";

type Filters = {
  company: string;
  creditCode: string;
  account: string;
  product: string;
  reviewer: string;
};

const EMPTY_FILTERS: Filters = {
  company: "",
  creditCode: "",
  account: "",
  product: "",
  reviewer: "",
};

type ResultTab = "approved" | "rejected";

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

function matchesFilters(row: AccountApplication, f: Filters, mode: AccountListMode) {
  const companyQ = f.company.trim();
  if (companyQ && !row.companyName.includes(companyQ)) return false;

  const creditQ = f.creditCode.trim();
  if (creditQ && !row.creditCode.includes(creditQ)) return false;

  const accountQ = f.account.trim();
  if (accountQ && !row.account.includes(accountQ)) return false;

  if (f.product && !customerHasProduct(applicationProductServices(row), f.product)) {
    return false;
  }

  if (mode === "all") {
    const reviewerQ = f.reviewer.trim();
    if (reviewerQ && !(row.reviewer ?? "").includes(reviewerQ)) return false;
  }

  return true;
}

type Props = {
  mode: AccountListMode;
};

export function AccountApplicationsPage({ mode }: Props) {
  const { applications } = useAccountsStore();
  const me = getCurrentUser();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [resultTab, setResultTab] = useState<ResultTab>("approved");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [jump, setJump] = useState("");

  const scoped = useMemo(() => {
    let rows = [...applications];
    if (mode === "pending") {
      rows = rows.filter((r) => r.status === "pending");
    } else if (mode === "mine") {
      const name = me?.displayName ?? "";
      rows = rows.filter(
        (r) => (r.status === "approved" || r.status === "rejected") && r.reviewer === name,
      );
    } else {
      rows = rows.filter((r) => r.status === "approved" || r.status === "rejected");
    }
    return rows;
  }, [applications, mode, me?.displayName]);

  const filtered = useMemo(() => {
    let rows = scoped.filter((row) => matchesFilters(row, applied, mode));
    if (mode === "mine" || mode === "all") {
      rows = rows.filter((r) => r.status === resultTab);
    }
    return rows.sort((a, b) => {
      const ta = mode === "pending" ? a.submittedAt : (a.reviewedAt ?? a.submittedAt);
      const tb = mode === "pending" ? b.submittedAt : (b.reviewedAt ?? b.submittedAt);
      return tb.localeCompare(ta);
    });
  }, [scoped, applied, mode, resultTab]);

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

  const switchTab = (tab: ResultTab) => {
    setResultTab(tab);
    setPage(1);
  };

  const showTabs = mode === "mine" || mode === "all";
  const colSpan = mode === "pending" ? 9 : mode === "all" ? 10 : 9;

  return (
    <div className="a-card">
      {showTabs ? (
        <div className="a-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={`a-tabs__item${resultTab === "approved" ? " is-active" : ""}`}
            onClick={() => switchTab("approved")}
          >
            通过
          </button>
          <button
            type="button"
            role="tab"
            className={`a-tabs__item${resultTab === "rejected" ? " is-active" : ""}`}
            onClick={() => switchTab("rejected")}
          >
            不通过
          </button>
        </div>
      ) : null}

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
        {mode === "all" ? (
          <div className="a-field">
            <span className="a-field__label">审核人</span>
            <input
              className="a-input"
              placeholder="请输入审核人"
              value={draft.reviewer}
              onChange={(e) => setFilter("reviewer", e.target.value)}
            />
          </div>
        ) : null}
        <button type="button" className="a-btn a-btn--primary" onClick={search}>
          查询
        </button>
        <button type="button" className="a-btn" onClick={reset}>
          重置
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
              <th>绑定手机号</th>
              <th>开通产品</th>
              <th>{mode === "pending" ? "提交时间" : "审核时间"}</th>
              {mode === "all" ? <th>审核人</th> : null}
              <th>状态</th>
              <th className="a-table__col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>
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
                  <td>{row.boundPhone || "—"}</td>
                  <td>
                    <ProductServiceTags services={applicationProductServices(row)} />
                  </td>
                  <td>{mode === "pending" ? row.submittedAt : (row.reviewedAt ?? "—")}</td>
                  {mode === "all" ? <td>{row.reviewer ?? "—"}</td> : null}
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
          当前筛选结果共 <b>{filtered.length}</b> 条
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
