import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiDocUploadModal } from "@/components/ApiDocUploadModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import {
  IconEdit,
  IconEnable,
  IconOffline,
  IconPdf,
  IconPlus,
  IconTrash,
  IconUpload,
} from "@/components/icons/UiIcons";
import {
  API_STATUS_LABEL,
  PRODUCT_CODES,
  PRODUCT_NAME,
  useApiServicesStore,
  type ApiEndpoint,
  type ApiOnlineStatus,
  type ProductCode,
} from "@/lib/apiServicesStore";

const PAGE_SIZES = [10, 20, 30, 50] as const;

type Filters = {
  name: string;
  path: string;
  product: string;
  status: "" | ApiOnlineStatus;
};

const EMPTY_FILTERS: Filters = {
  name: "",
  path: "",
  product: "",
  status: "",
};

function matchesFilters(row: ApiEndpoint, f: Filters) {
  const nameQ = f.name.trim().toLowerCase();
  if (nameQ && !row.apiName.toLowerCase().includes(nameQ) && !row.apiCode.toLowerCase().includes(nameQ)) {
    return false;
  }
  const pathQ = f.path.trim().toLowerCase();
  if (pathQ && !row.path.toLowerCase().includes(pathQ)) return false;
  if (f.product && row.productCode !== f.product) return false;
  if (f.status && row.status !== f.status) return false;
  return true;
}

export function ApiServicesPage() {
  const store = useApiServicesStore();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [jump, setJump] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<ApiEndpoint | null>(null);
  const [confirmShelf, setConfirmShelf] = useState<ApiEndpoint | null>(null);
  const [uploadTarget, setUploadTarget] = useState<ApiEndpoint | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const allRows = store.list();

  const filtered = useMemo(() => {
    return allRows
      .filter((row) => matchesFilters(row, applied))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [allRows, applied]);

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

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const applyShelf = (row: ApiEndpoint) => {
    const next = row.status === "online" ? "offline" : "online";
    store.setStatus(row.id, next);
    showToast(next === "online" ? "已上架" : "已下架");
  };

  return (
    <div className="a-card">
      {toast ? <div className="a-toast">{toast}</div> : null}

      <div className="a-toolbar">
        <div className="a-field">
          <span className="a-field__label">接口名称</span>
          <input
            className="a-input"
            placeholder="请输入接口名称"
            value={draft.name}
            onChange={(e) => setFilter("name", e.target.value)}
          />
        </div>
        <div className="a-field">
          <span className="a-field__label">接口地址</span>
          <input
            className="a-input"
            style={{ minWidth: 220 }}
            placeholder="请输入接口地址"
            value={draft.path}
            onChange={(e) => setFilter("path", e.target.value)}
          />
        </div>
        <div className="a-field">
          <span className="a-field__label">所属产品</span>
          <select
            className="a-select"
            value={draft.product}
            onChange={(e) => setFilter("product", e.target.value)}
          >
            <option value="">全部产品</option>
            {PRODUCT_CODES.map((code) => (
              <option key={code} value={code}>
                {PRODUCT_NAME[code]}
              </option>
            ))}
          </select>
        </div>
        <div className="a-field">
          <span className="a-field__label">接口状态</span>
          <select
            className="a-select"
            value={draft.status}
            onChange={(e) => setFilter("status", e.target.value as Filters["status"])}
          >
            <option value="">全部</option>
            <option value="online">{API_STATUS_LABEL.online}</option>
            <option value="offline">{API_STATUS_LABEL.offline}</option>
          </select>
        </div>
        <button type="button" className="a-btn a-btn--primary" onClick={search}>
          搜索
        </button>
        <button type="button" className="a-btn" onClick={reset}>
          重置
        </button>
      </div>

      <div className="a-toolbar a-toolbar--secondary">
        <Link className="a-btn a-btn--primary a-btn--sm" to="/system/api-services/new">
          <IconPlus size={14} />
          新增
        </Link>
      </div>

      <div className="a-card__body a-card__body--flush">
        <table className="a-table a-table--accounts">
          <thead>
            <tr>
              <th className="num" style={{ width: 56 }}>
                序号
              </th>
              <th>所属产品</th>
              <th>接口名称</th>
              <th>请求地址</th>
              <th>请求方式</th>
              <th className="a-table__col-status">状态</th>
              <th>接口文档</th>
              <th>创建时间</th>
              <th className="a-table__col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="a-empty">暂无符合条件的接口</div>
                </td>
              </tr>
            ) : (
              pageRows.map((row, index) => {
                const online = row.status === "online";
                return (
                  <tr key={row.id}>
                    <td className="num">{(safePage - 1) * pageSize + index + 1}</td>
                    <td>{PRODUCT_NAME[row.productCode as ProductCode]}</td>
                    <td>
                      <div className="a-api-name">
                        <span>{row.apiName}</span>
                        <code className="a-api-name__code">{row.apiCode}</code>
                      </div>
                    </td>
                    <td>
                      <code className="a-code a-code--link">{row.path}</code>
                    </td>
                    <td>
                      <span className={`a-method a-method--${row.method.toLowerCase()}`}>
                        {row.method}
                      </span>
                    </td>
                    <td className="a-table__col-status">
                      <span className={`a-tag${online ? " a-tag--ok" : " a-tag--muted"}`}>
                        {API_STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td>
                      {row.docFile ? (
                        <a
                          className="a-doc-link"
                          href={row.docFile.url || "#"}
                          download={row.docFile.name}
                          onClick={(e) => {
                            if (!row.docFile?.url) e.preventDefault();
                          }}
                          title={row.docFile.name}
                        >
                          <IconPdf />
                          <span>{row.docFile.name}</span>
                        </a>
                      ) : (
                        <span className="a-muted">未上传</span>
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{row.createdAt}</td>
                    <td>
                      <div className="a-actions a-actions--nowrap">
                        <TableAction
                          icon={<IconEdit />}
                          to={`/system/api-services/${row.id}/edit`}
                        >
                          编辑
                        </TableAction>
                        <TableAction
                          icon={online ? <IconOffline /> : <IconEnable />}
                          danger={online}
                          onClick={() => setConfirmShelf(row)}
                        >
                          {online ? "下架" : "上架"}
                        </TableAction>
                        <TableAction icon={<IconUpload />} onClick={() => setUploadTarget(row)}>
                          {row.docFile ? "更新文档" : "上传文档"}
                        </TableAction>
                        <TableAction
                          icon={<IconTrash />}
                          danger
                          onClick={() => setConfirmDelete(row)}
                        >
                          删除
                        </TableAction>
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
          当前筛选结果共 <b>{filtered.length}</b> 条
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

      <ApiDocUploadModal
        open={Boolean(uploadTarget)}
        initialFile={uploadTarget?.docFile ?? null}
        onClose={() => setUploadTarget(null)}
        onConfirm={(file) => {
          if (!uploadTarget) return;
          const wasUpdate = Boolean(uploadTarget.docFile);
          store.update(uploadTarget.id, { docFile: file });
          setUploadTarget(null);
          showToast(wasUpdate ? "接口文档已更新" : "接口文档已上传");
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmShelf)}
        title={
          confirmShelf
            ? confirmShelf.status === "online"
              ? `确认要下架「${confirmShelf.apiName}」吗`
              : `确认要上架「${confirmShelf.apiName}」吗`
            : ""
        }
        description={
          confirmShelf
            ? confirmShelf.status === "online"
              ? "下架后该接口将无法被调用，可能影响相关业务正常运行"
              : "此操作较为重要：上架后该接口将对外提供调用，请确保接口已通过测试与审核。"
            : ""
        }
        confirmText={confirmShelf?.status === "online" ? "下架" : "上架"}
        danger={confirmShelf?.status === "online"}
        onCancel={() => setConfirmShelf(null)}
        onConfirm={() => {
          if (confirmShelf) applyShelf(confirmShelf);
          setConfirmShelf(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="删除接口"
        description={
          confirmDelete
            ? `确认删除接口「${confirmDelete.apiName}」吗？删除后不可恢复。`
            : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            store.remove(confirmDelete.id);
            showToast("接口已删除");
          }
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}
