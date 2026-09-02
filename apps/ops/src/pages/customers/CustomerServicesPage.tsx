import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AddServiceDialog } from "@/components/AddServiceDialog";
import { EditServiceDialog } from "@/components/EditServiceDialog";
import {
  CONFIGURABLE_PRODUCTS,
  SERVICE_STATUS_LABEL,
  deriveServiceStatus,
  productName,
  type CustomerAccount,
  type ProductServiceConfig,
} from "@/lib/catalog";
import { useCustomerStore } from "@/lib/customersStore";

const PAGE_SIZES = [10, 20, 30, 50] as const;

type ServiceRow = {
  key: string;
  customer: CustomerAccount;
  service: ProductServiceConfig;
  status: keyof typeof SERVICE_STATUS_LABEL;
};

type Filters = {
  account: string;
  product: string;
  status: string;
};

const EMPTY: Filters = { account: "", product: "", status: "" };

function quotaCell(svc: ProductServiceConfig) {
  if (svc.quotaType === "unlimited") return "—";
  return `${(svc.quotaTotal ?? 0).toLocaleString()} 次`;
}

function statusTagClass(status: ServiceRow["status"]) {
  if (status === "active") return "a-tag--ok";
  if (status === "pending") return "a-tag--wn";
  if (status === "stopped") return "a-tag--muted";
  return "a-tag--er";
}

export function CustomerServicesPage() {
  const { customers, updateProductService, addProductService, setProductStopped } =
    useCustomerStore();
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [jump, setJump] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<ServiceRow | null>(null);
  const [confirmRow, setConfirmRow] = useState<ServiceRow | null>(null);

  const allRows = useMemo(() => {
    const rows: ServiceRow[] = [];
    for (const customer of customers) {
      for (const service of customer.productServices) {
        rows.push({
          key: `${customer.id}:${service.product}`,
          customer,
          service,
          status: deriveServiceStatus(service),
        });
      }
    }
    rows.sort((a, b) => {
      const byUpdated = b.customer.updatedAt.localeCompare(a.customer.updatedAt);
      if (byUpdated !== 0) return byUpdated;
      return a.customer.account.localeCompare(b.customer.account);
    });
    return rows;
  }, [customers]);

  const filtered = useMemo(() => {
    return allRows.filter((row) => {
      if (applied.account && row.customer.account !== applied.account.trim()) {
        return false;
      }
      if (applied.product && row.service.product !== applied.product) return false;
      if (applied.status && row.status !== applied.status) return false;
      return true;
    });
  }, [allRows, applied]);

  const summary = useMemo(() => {
    const activeRows = filtered.filter((r) => r.status === "active");
    const accountSet = new Set(activeRows.map((r) => r.customer.id));
    return {
      accounts: accountSet.size,
      services: activeRows.length,
    };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const search = () => {
    setApplied({ ...draft });
    setPage(1);
  };

  const reset = () => {
    setDraft(EMPTY);
    setApplied(EMPTY);
    setPage(1);
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
              onChange={(e) => setDraft((p) => ({ ...p, account: e.target.value }))}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">产品</span>
            <select
              className="a-select"
              value={draft.product}
              onChange={(e) => setDraft((p) => ({ ...p, product: e.target.value }))}
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
            <span className="a-field__label">服务状态</span>
            <select
              className="a-select"
              value={draft.status}
              onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">请选择服务状态</option>
              <option value="pending">未生效</option>
              <option value="active">使用中</option>
              <option value="expired">已到期</option>
              <option value="stopped">已停止</option>
            </select>
          </div>
          <button type="button" className="a-btn" onClick={reset}>
            重置
          </button>
          <button type="button" className="a-btn a-btn--primary" onClick={search}>
            查询
          </button>
          <button type="button" className="a-btn a-btn--primary" onClick={() => setAddOpen(true)}>
            新增服务
          </button>
        </div>

        <div className="a-summary">
          当前共 <b>{summary.accounts}</b> 个账户的 <b>{summary.services}</b>{" "}
          个产品在使用中
          {applied.account || applied.product || applied.status
            ? "（基于当前筛选结果中「使用中」的服务项统计）"
            : ""}
        </div>

        <div className="a-card__body a-card__body--flush">
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>账号</th>
                  <th>机构/企业名称</th>
                  <th>联系人姓名</th>
                  <th>产品</th>
                  <th>授权总量</th>
                  <th>服务状态</th>
                  <th>到期日期</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="a-empty">暂无产品服务记录</div>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr key={row.key}>
                      <td>
                        <code style={{ fontFamily: "var(--font-mono)" }}>
                          {row.customer.account}
                        </code>
                      </td>
                      <td>{row.customer.companyName}</td>
                      <td>{row.customer.contactName}</td>
                      <td>
                        <span
                          className={`a-tag${
                            row.status === "expired" ? " a-tag--muted" : " a-tag--cyan"
                          }`}
                        >
                          {productName(row.service.product)}
                        </span>
                      </td>
                      <td className="num">{quotaCell(row.service)}</td>
                      <td>
                        <span className={`a-tag ${statusTagClass(row.status)}`}>
                          {SERVICE_STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td>{row.service.endDate}</td>
                      <td>
                        <div className="a-actions">
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => setEditRow(row)}
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => setConfirmRow(row)}
                          >
                            {row.service.stopped ? "恢复" : "停止"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => goPage(safePage - 1)}
          >
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

      <AddServiceDialog
        open={addOpen}
        customers={customers}
        onCancel={() => setAddOpen(false)}
        onSave={(input) => {
          const err = addProductService(input.customerId, {
            product: input.product,
            quotaTotal: input.quotaTotal,
            startDate: input.startDate,
            endDate: input.endDate,
          });
          if (err) return err;
          setAddOpen(false);
          return null;
        }}
      />

      <EditServiceDialog
        open={Boolean(editRow)}
        customer={editRow?.customer ?? null}
        service={editRow?.service ?? null}
        onCancel={() => setEditRow(null)}
        onSave={(patch) => {
          if (!editRow) return "无效的服务项";
          const err = updateProductService(
            editRow.customer.id,
            editRow.service.product,
            patch,
          );
          if (err) return err;
          setEditRow(null);
          return null;
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmRow)}
        title={confirmRow?.service.stopped ? "确认恢复服务" : "确认停止服务"}
        description={
          confirmRow
            ? `确定要${confirmRow.service.stopped ? "恢复" : "停止"}账号「${confirmRow.customer.account}」的产品「${productName(confirmRow.service.product)}」吗？`
            : ""
        }
        confirmText={confirmRow?.service.stopped ? "恢复" : "停止"}
        danger={!confirmRow?.service.stopped}
        onCancel={() => setConfirmRow(null)}
        onConfirm={() => {
          if (!confirmRow) return;
          setProductStopped(
            confirmRow.customer.id,
            confirmRow.service.product,
            !confirmRow.service.stopped,
          );
          setConfirmRow(null);
        }}
      />
    </>
  );
}
