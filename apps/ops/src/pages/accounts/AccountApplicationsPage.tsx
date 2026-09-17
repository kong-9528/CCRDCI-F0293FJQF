import { useMemo, useState } from "react";
import { TableAction } from "@/components/TableAction";
import { ProductServiceTags } from "@/components/ProductServiceTags";
import { IconAudit, IconEdit, IconEye } from "@/components/icons/UiIcons";
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
  applyFrom: string;
  applyTo: string;
};

const EMPTY_FILTERS: Filters = {
  company: "",
  creditCode: "",
  account: "",
  product: "",
  applyFrom: "",
  applyTo: "",
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

function contractPeriodText(row: AccountApplication) {
  if (!row.contractStart && !row.contractEnd) return "—";
  return `${row.contractStart || "—"} ~ ${row.contractEnd || "—"}`;
}

function dayOf(ts: string) {
  return ts.slice(0, 10);
}

function matchesFilters(
  row: AccountApplication,
  f: Filters,
  filterByProduct: boolean,
  filterByApplyTime: boolean,
) {
  const companyQ = f.company.trim();
  if (companyQ && !row.companyName.includes(companyQ)) return false;

  const creditQ = f.creditCode.trim();
  if (creditQ && !row.creditCode.includes(creditQ)) return false;

  const accountQ = f.account.trim();
  if (accountQ && !row.account.includes(accountQ)) return false;

  if (filterByProduct && f.product && !customerHasProduct(applicationProductServices(row), f.product)) {
    return false;
  }

  if (filterByApplyTime) {
    const day = dayOf(row.submittedAt);
    if (f.applyFrom && day < f.applyFrom) return false;
    if (f.applyTo && day > f.applyTo) return false;
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

  const showTabs = mode === "mine" || mode === "all";
  const isApprovedTab = showTabs && resultTab === "approved";
  const isRejectedTab = showTabs && resultTab === "rejected";
  /** 待审核、不通过 tab 不展示产品筛选；仅我的/全部审核的通过 tab 保留 */
  const showProductFilter = isApprovedTab;
  const showApplyTimeFilter = mode === "pending" || isRejectedTab;

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
    let rows = scoped.filter((row) =>
      matchesFilters(row, applied, showProductFilter, showApplyTimeFilter),
    );
    if (mode === "mine" || mode === "all") {
      rows = rows.filter((r) => r.status === resultTab);
    }
    return rows.sort((a, b) => {
      const ta = mode === "pending" ? a.submittedAt : (a.reviewedAt ?? a.submittedAt);
      const tb = mode === "pending" ? b.submittedAt : (b.reviewedAt ?? b.submittedAt);
      return tb.localeCompare(ta);
    });
  }, [scoped, applied, mode, resultTab, showProductFilter, showApplyTimeFilter]);

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

  const colSpan = (() => {
    if (mode === "pending") return 7;
    if (isApprovedTab) return mode === "all" ? 9 : 8;
    // 不通过：机构/组织机构代码/联系人/账号/提交时间/审核时间/不通过原因/[审核人]/操作（无状态）
    if (isRejectedTab) return mode === "all" ? 9 : 8;
    return 9;
  })();

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
          <span className="a-field__label">机构名称</span>
          <input
            className="a-input"
            style={{ minWidth: 220 }}
            placeholder="请输入机构名称"
            value={draft.company}
            onChange={(e) => setFilter("company", e.target.value)}
          />
        </div>
        <div className="a-field">
          <span className="a-field__label">组织机构代码</span>
          <input
            className="a-input"
            placeholder="请输入组织机构代码"
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
        {showProductFilter ? (
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
        ) : null}
        {showApplyTimeFilter ? (
          <div className="a-field">
            <span className="a-field__label">{isRejectedTab ? "提交时间" : "申请时间"}</span>
            <div className="a-date-range">
              <input
                type="date"
                className="a-input"
                value={draft.applyFrom}
                onChange={(e) => setFilter("applyFrom", e.target.value)}
              />
              <span>至</span>
              <input
                type="date"
                className="a-input"
                value={draft.applyTo}
                onChange={(e) => setFilter("applyTo", e.target.value)}
              />
            </div>
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
              <th>机构名称</th>
              {mode !== "pending" ? <th className="a-table__col-credit">组织机构代码</th> : null}
              <th>联系人姓名</th>
              <th>申请账号</th>
              {isApprovedTab ? <th>开通技术服务</th> : null}
              {mode === "pending" || isApprovedTab ? (
                <th className="a-table__col-period">合同起止日期</th>
              ) : null}
              {mode === "pending" || isRejectedTab ? (
                <th>{isRejectedTab ? "提交时间" : "申请时间"}</th>
              ) : null}
              {isRejectedTab ? <th>审核时间</th> : null}
              {isRejectedTab ? <th>不通过原因</th> : null}
              {mode === "all" ? <th>审核人</th> : null}
              {!isRejectedTab ? <th className="a-table__col-status">状态</th> : null}
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
                  {mode !== "pending" ? (
                    <td className="a-table__col-credit">{row.creditCode}</td>
                  ) : null}
                  <td>{row.contactName}</td>
                  <td>
                    <code style={{ fontFamily: "var(--font-mono)" }}>{row.account}</code>
                  </td>
                  {isApprovedTab ? (
                    <td>
                      <ProductServiceTags services={applicationProductServices(row)} />
                    </td>
                  ) : null}
                  {mode === "pending" || isApprovedTab ? (
                    <td className="a-table__col-period">{contractPeriodText(row)}</td>
                  ) : null}
                  {mode === "pending" || isRejectedTab ? <td>{row.submittedAt}</td> : null}
                  {isRejectedTab ? <td>{row.reviewedAt ?? "—"}</td> : null}
                  {isRejectedTab ? (
                    <td title={row.rejectReason || undefined}>{row.rejectReason || "—"}</td>
                  ) : null}
                  {mode === "all" ? <td>{row.reviewer ?? "—"}</td> : null}
                  {!isRejectedTab ? (
                    <td className="a-table__col-status">{statusTag(row.status)}</td>
                  ) : null}
                  <td className="a-table__col-actions">
                    <div className="a-actions a-actions--nowrap">
                      {row.status === "pending" ? (
                        <TableAction icon={<IconAudit />} to={`/accounts/${row.id}/review`}>
                          审核
                        </TableAction>
                      ) : (
                        <>
                          <TableAction icon={<IconEye />} to={`/accounts/${row.id}`}>
                            详情
                          </TableAction>
                          {row.status === "approved" ? (
                            <TableAction icon={<IconEdit />} to={`/accounts/${row.id}/edit`}>
                              配置
                            </TableAction>
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
          {showProductFilter && applied.product
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
