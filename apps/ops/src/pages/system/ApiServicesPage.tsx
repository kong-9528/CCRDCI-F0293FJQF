import { useMemo, useState } from "react";
import {
  ApiEndpointFormModal,
  type ApiEndpointFormValues,
} from "@/components/ApiEndpointFormModal";
import { CatalogListModal } from "@/components/CatalogListModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import { IconEdit, IconEnable, IconOffline, IconPdf, IconPlus } from "@/components/icons/UiIcons";
import { paramsToText } from "@ctp/api-catalog";
import {
  API_STATUS_LABEL,
  PRODUCT_CODES,
  PRODUCT_NAME,
  listApiDocCatalogs,
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
  catalog: string;
  status: "" | ApiOnlineStatus;
};

const EMPTY_FILTERS: Filters = {
  name: "",
  path: "",
  product: "",
  catalog: "",
  status: "",
};

function endpointProducts(row: ApiEndpoint): ProductCode[] {
  if (row.productCodes?.length) return row.productCodes;
  return row.productCode ? [row.productCode] : [];
}

function matchesFilters(row: ApiEndpoint, f: Filters) {
  const nameQ = f.name.trim().toLowerCase();
  if (nameQ && !row.apiName.toLowerCase().includes(nameQ) && !row.apiCode.toLowerCase().includes(nameQ)) {
    return false;
  }
  const pathQ = f.path.trim().toLowerCase();
  if (pathQ && !row.path.toLowerCase().includes(pathQ)) return false;
  if (f.product) {
    const products = endpointProducts(row);
    if (!products.includes(f.product as ProductCode)) return false;
  }
  if (f.catalog && !(row.catalogIds ?? []).includes(f.catalog)) return false;
  if (f.status && row.status !== f.status) return false;
  return true;
}

function autoApiCode(path: string, productCode: ProductCode | "api") {
  const slug = path
    .trim()
    .replace(/^\/+/, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
  return slug || `${productCode}_api_${Date.now().toString(36)}`;
}

function isProductCode(value: string): value is ProductCode {
  return (PRODUCT_CODES as readonly string[]).includes(value);
}

function productLabel(row: ApiEndpoint) {
  const codes = endpointProducts(row);
  if (!codes.length) return "未关联";
  return codes.map((c) => PRODUCT_NAME[c]).join("、");
}

function catalogLabel(row: ApiEndpoint) {
  const catalogs = listApiDocCatalogs();
  const names = (row.catalogIds ?? [])
    .map((id) => catalogs.find((c) => c.id === id)?.name)
    .filter(Boolean);
  return names.length ? names.join("、") : "—";
}

export function ApiServicesPage() {
  const store = useApiServicesStore();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [jump, setJump] = useState("");
  const [confirmShelf, setConfirmShelf] = useState<ApiEndpoint | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ApiEndpoint | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const allRows = store.list();
  const catalogs = store.listCatalogs();

  const filtered = useMemo(() => {
    return allRows
      .filter((row) => matchesFilters(row, applied))
      .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  }, [allRows, applied]);

  const defaultProduct: ProductCode =
    applied.product && isProductCode(applied.product) ? applied.product : "dci";

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

  const openCreate = () => {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: ApiEndpoint) => {
    if (row.status === "online") {
      showToast("仅下架状态的接口可编辑");
      return;
    }
    setFormMode("edit");
    setEditing(row);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleFormSubmit = (values: ApiEndpointFormValues) => {
    try {
      const productCodes = values.productCodes ?? [];
      const productCode = productCodes[0] ?? "dci";
      if (formMode === "create") {
        let apiCode = autoApiCode(values.path, productCodes[0] ?? "api");
        let n = 1;
        while (store.isCodeTaken(apiCode)) {
          apiCode = `${autoApiCode(values.path, productCodes[0] ?? "api")}_${n++}`;
        }
        store.create({
          apiCode,
          apiName: values.apiName,
          path: values.path,
          method: values.method,
          version: "v1",
          description: values.description,
          productCode,
          productCodes,
          catalogIds: values.catalogIds,
          owner: "平台运营",
          docFile: values.docFile,
          requestParamsText: paramsToText(values.requestParams),
          responseFieldsText: paramsToText(values.responseParams),
          pathParams: [],
          queryParams: [],
          headerParams: [],
          bodyParams: values.requestParams,
          responseParams: values.responseParams,
          errorCodes: [],
          exampleRequest: values.exampleRequest,
          exampleResponse: values.exampleResponse,
          status: "offline",
        });
        showToast("接口已新增");
      } else if (editing) {
        if (editing.status === "online") {
          showToast("仅下架状态的接口可编辑");
          return;
        }
        store.update(editing.id, {
          apiName: values.apiName,
          path: values.path,
          method: values.method,
          description: values.description,
          productCode,
          productCodes,
          catalogIds: values.catalogIds,
          docFile: values.docFile,
          requestParamsText: paramsToText(values.requestParams),
          responseFieldsText: paramsToText(values.responseParams),
          pathParams: [],
          queryParams: [],
          headerParams: [],
          bodyParams: values.requestParams,
          responseParams: values.responseParams,
          exampleRequest: values.exampleRequest,
          exampleResponse: values.exampleResponse,
        });
        showToast("接口已更新");
      }
      closeForm();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "保存失败");
    }
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
          <span className="a-field__label">关联产品</span>
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
          <span className="a-field__label">关联目录</span>
          <select
            className="a-select"
            value={draft.catalog}
            onChange={(e) => setFilter("catalog", e.target.value)}
          >
            <option value="">全部目录</option>
            {catalogs.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
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
        <button type="button" className="a-btn a-btn--primary a-btn--sm" onClick={openCreate}>
          <IconPlus size={14} />
          新增接口
        </button>
        <button type="button" className="a-btn a-btn--sm" onClick={() => setCatalogOpen(true)}>
          目录列表
        </button>
      </div>

      <div className="a-card__body a-card__body--flush">
        <table className="a-table a-table--accounts">
          <thead>
            <tr>
              <th className="num" style={{ width: 56 }}>
                序号
              </th>
              <th>关联产品</th>
              <th>关联目录</th>
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
                <td colSpan={10}>
                  <div className="a-empty">暂无符合条件的接口</div>
                </td>
              </tr>
            ) : (
              pageRows.map((row, index) => {
                const online = row.status === "online";
                return (
                  <tr key={row.id}>
                    <td className="num">{(safePage - 1) * pageSize + index + 1}</td>
                    <td>{productLabel(row)}</td>
                    <td>{catalogLabel(row)}</td>
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
                        {!online ? (
                          <TableAction icon={<IconEdit />} onClick={() => openEdit(row)}>
                            编辑
                          </TableAction>
                        ) : null}
                        <TableAction
                          icon={online ? <IconOffline /> : <IconEnable />}
                          danger={online}
                          onClick={() => setConfirmShelf(row)}
                        >
                          {online ? "下架" : "上架"}
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

      <ApiEndpointFormModal
        open={formOpen}
        mode={formMode}
        initial={editing}
        defaultProduct={defaultProduct}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />

      <CatalogListModal open={catalogOpen} onClose={() => setCatalogOpen(false)} />

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
    </div>
  );
}

