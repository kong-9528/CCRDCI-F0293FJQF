import { useEffect, useRef, useState } from "react";
import { catalogIdForProduct, collectRequestParams } from "@ctp/api-catalog";
import {
  PRODUCT_CODES,
  PRODUCT_NAME,
  listApiDocCatalogs,
  type ApiDocFile,
  type ApiEndpoint,
  type ApiParam,
  type HttpMethod,
  type ProductCode,
} from "@/lib/apiServicesStore";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];
const PARAM_TYPES = ["String", "Number", "Boolean", "Object", "Array"] as const;
const MAX_BYTES = 50 * 1024 * 1024;
const ACCEPT_EXT = ["doc", "docx", "pdf", "md", "txt", "xls", "xlsx"] as const;
const ACCEPT_ATTR = ".doc,.docx,.pdf,.md,.txt,.xls,.xlsx";

export type ApiEndpointFormValues = {
  apiName: string;
  method: HttpMethod;
  path: string;
  description: string;
  /** @deprecated 兼容；以 productCodes 为准 */
  productCode: ProductCode;
  productCodes: ProductCode[];
  catalogIds: string[];
  requestParams: ApiParam[];
  responseParams: ApiParam[];
  exampleRequest: string;
  exampleResponse: string;
  docFile: ApiDocFile | null;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: ApiEndpoint | null;
  defaultProduct?: ProductCode;
  onClose: () => void;
  onSubmit: (values: ApiEndpointFormValues) => void;
};

function emptyParam(): ApiParam {
  return { name: "", type: "String", required: true, desc: "" };
}

function emptyValues(productCode: ProductCode = "dci"): ApiEndpointFormValues {
  return {
    apiName: "",
    method: "POST",
    path: "",
    description: "",
    productCode,
    productCodes: [productCode],
    catalogIds: [catalogIdForProduct(productCode)],
    requestParams: [emptyParam()],
    responseParams: [emptyParam()],
    exampleRequest: "",
    exampleResponse: "",
    docFile: null,
  };
}

function fromEndpoint(ep: ApiEndpoint): ApiEndpointFormValues {
  const requestParams = collectRequestParams(ep);
  const responseParams = ep.responseParams?.length ? ep.responseParams.map((p) => ({ ...p })) : [];
  const productCodes =
    ep.productCodes?.length > 0 ? [...ep.productCodes] : ep.productCode ? [ep.productCode] : [];
  const catalogIds =
    ep.catalogIds?.length > 0
      ? [...ep.catalogIds]
      : [catalogIdForProduct(ep.productCode ?? "dci")];
  return {
    apiName: ep.apiName,
    method: ep.method,
    path: ep.path,
    description: ep.description,
    productCode: productCodes[0] ?? ep.productCode ?? "dci",
    productCodes,
    catalogIds,
    requestParams: requestParams.length ? requestParams.map((p) => ({ ...p })) : [emptyParam()],
    responseParams: responseParams.length ? responseParams : [emptyParam()],
    exampleRequest: ep.exampleRequest ?? "",
    exampleResponse: ep.exampleResponse ?? "",
    docFile: ep.docFile ?? null,
  };
}

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function normalizeParamType(type: string) {
  const hit = PARAM_TYPES.find((t) => t.toLowerCase() === type.toLowerCase());
  return hit ?? (type.trim() || "String");
}

function sanitizeParams(rows: ApiParam[]): ApiParam[] {
  return rows
    .map((row) => ({
      name: row.name.trim(),
      type: normalizeParamType(row.type),
      required: Boolean(row.required),
      desc: row.desc.trim(),
    }))
    .filter((row) => row.name);
}

type ParamEditorProps = {
  title: string;
  rows: ApiParam[];
  onChange: (next: ApiParam[]) => void;
};

/** 参数表：不用 a-table，避免运营台表格主题把内容“冲没” */
function ParamEditor({ title, rows, onChange }: ParamEditorProps) {
  const [expanded, setExpanded] = useState(true);

  const updateRow = (index: number, patch: Partial<ApiParam>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <div className={`epf-block${expanded ? " is-open" : ""}`}>
      <div className="epf-block__bar">
        <button
          type="button"
          className="epf-block__toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span className="epf-block__caret" aria-hidden>
            {expanded ? "▾" : "▸"}
          </span>
          <span className="epf-block__title">{title}</span>
        </button>
        <button
          type="button"
          className="epf-add"
          onClick={() => {
            setExpanded(true);
            onChange([...rows, emptyParam()]);
          }}
        >
          + 添加
        </button>
      </div>

      {expanded ? (
        <div className="epf-params">
          <div className="epf-params__head" aria-hidden>
            <span>参数名</span>
            <span>类型</span>
            <span>必填</span>
            <span>说明</span>
            <span>操作</span>
          </div>
          {rows.length === 0 ? (
            <div className="epf-params__empty">暂无参数，请点击「+ 添加」</div>
          ) : (
            rows.map((row, index) => {
              const typeValue = normalizeParamType(row.type);
              const known = (PARAM_TYPES as readonly string[]).includes(typeValue);
              return (
                <div className="epf-params__row" key={`${title}-${index}`}>
                  <input
                    className="epf-input"
                    value={row.name}
                    onChange={(e) => updateRow(index, { name: e.target.value })}
                    placeholder="参数名"
                  />
                  <select
                    className="epf-input"
                    value={typeValue}
                    onChange={(e) => updateRow(index, { type: e.target.value })}
                  >
                    {PARAM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    {!known ? <option value={typeValue}>{typeValue}</option> : null}
                  </select>
                  <select
                    className="epf-input"
                    value={row.required ? "yes" : "no"}
                    onChange={(e) => updateRow(index, { required: e.target.value === "yes" })}
                  >
                    <option value="yes">是</option>
                    <option value="no">否</option>
                  </select>
                  <input
                    className="epf-input"
                    value={row.desc}
                    onChange={(e) => updateRow(index, { desc: e.target.value })}
                    placeholder="说明"
                  />
                  <button
                    type="button"
                    className="epf-del"
                    onClick={() => onChange(rows.filter((_, i) => i !== index))}
                  >
                    删除
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

export function ApiEndpointFormModal({
  open,
  mode,
  initial = null,
  defaultProduct = "dci",
  onClose,
  onSubmit,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ApiEndpointFormValues>(() => emptyValues(defaultProduct));
  const [error, setError] = useState<string | null>(null);
  const [exampleOpen, setExampleOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setExampleOpen(true);
    setForm(initial ? fromEndpoint(initial) : emptyValues(defaultProduct));
  }, [open, initial, defaultProduct]);

  if (!open) return null;

  const setField = <K extends keyof ApiEndpointFormValues>(key: K, value: ApiEndpointFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!(ACCEPT_EXT as readonly string[]).includes(extOf(file.name))) {
      setError("不支持的文件格式，请上传 doc / docx / pdf / md / txt / xls / xlsx");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("文件大小不能超过 50MB");
      return;
    }
    setError(null);
    setField("docFile", {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    });
  };

  const submit = () => {
    setError(null);
    if (!form.apiName.trim()) {
      setError("请填写接口名称");
      return;
    }
    if (!form.path.trim()) {
      setError("请填写请求地址");
      return;
    }
    if (!form.path.startsWith("/")) {
      setError("请求地址须以 / 开头");
      return;
    }
    if (!form.catalogIds.length) {
      setError("请至少选择一个文档目录");
      return;
    }
    const productCodes = form.productCodes;
    onSubmit({
      ...form,
      apiName: form.apiName.trim(),
      path: form.path.trim(),
      description: form.description.trim(),
      productCodes,
      productCode: productCodes[0] ?? "dci",
      catalogIds: form.catalogIds,
      requestParams: sanitizeParams(form.requestParams),
      responseParams: sanitizeParams(form.responseParams),
      exampleRequest: form.exampleRequest.trim(),
      exampleResponse: form.exampleResponse.trim(),
    });
  };

  const catalogs = listApiDocCatalogs();

  return (
    <div className="a-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="a-modal a-modal--xl epf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-endpoint-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="a-modal__head">
          <h3 id="api-endpoint-form-title" className="a-modal__title">
            {mode === "create" ? "新增接口" : "编辑接口"}
          </h3>
          <button type="button" className="a-modal__close" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="a-modal__body epf-modal__body">
          <div className="epf-basic">
            <label className="epf-field">
              <span className="epf-label">
                <span className="epf-req">*</span>接口名称
              </span>
              <input
                className="epf-input"
                value={form.apiName}
                onChange={(e) => setField("apiName", e.target.value)}
                placeholder="请输入接口名称"
              />
            </label>

            <label className="epf-field">
              <span className="epf-label">
                <span className="epf-req">*</span>请求方式
              </span>
              <select
                className="epf-input"
                value={form.method}
                onChange={(e) => setField("method", e.target.value as HttpMethod)}
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="epf-field epf-field--full">
              <span className="epf-label">
                <span className="epf-req">*</span>请求地址
              </span>
              <input
                className="epf-input"
                value={form.path}
                onChange={(e) => setField("path", e.target.value)}
                placeholder="如: /api/dci/claim/submit"
                spellCheck={false}
              />
            </label>

            <label className="epf-field epf-field--full">
              <span className="epf-label">接口描述</span>
              <textarea
                className="epf-input epf-textarea"
                rows={3}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="请输入接口描述"
              />
            </label>

            <div className="epf-field epf-field--full">
              <div className="epf-assoc__head">
                <span className="epf-label">
                  <span className="epf-req">*</span>关联目录
                </span>
                <span className="epf-assoc__count">
                  已选 {form.catalogIds.length}/{catalogs.length}
                </span>
              </div>
              <div className="epf-chips" role="group" aria-label="关联目录">
                {catalogs.map((cat) => {
                  const checked = form.catalogIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`epf-chip${checked ? " is-active" : ""}`}
                      aria-pressed={checked}
                      onClick={() => setField("catalogIds", toggleInList(form.catalogIds, cat.id))}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
              <span className="a-field__hint">至少选择 1 个；决定客户台「文档」左侧归属</span>
            </div>

            <div className="epf-field epf-field--full">
              <div className="epf-assoc__head">
                <span className="epf-label">关联产品</span>
                <span className="epf-assoc__count">
                  {form.productCodes.length
                    ? `已选 ${form.productCodes.length}/${PRODUCT_CODES.length}`
                    : "未关联（可选）"}
                </span>
              </div>
              <div className="epf-chips" role="group" aria-label="关联产品">
                {PRODUCT_CODES.map((code) => {
                  const checked = form.productCodes.includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`epf-chip${checked ? " is-active" : ""}`}
                      aria-pressed={checked}
                      onClick={() =>
                        setField("productCodes", toggleInList(form.productCodes, code))
                      }
                    >
                      {PRODUCT_NAME[code]}
                    </button>
                  );
                })}
              </div>
              <span className="a-field__hint">可多选，也可留空；用于按客户开通范围展示/隐藏</span>
            </div>
          </div>

          <ParamEditor
            title="请求参数"
            rows={form.requestParams}
            onChange={(next) => setField("requestParams", next)}
          />
          <ParamEditor
            title="返回参数"
            rows={form.responseParams}
            onChange={(next) => setField("responseParams", next)}
          />

          <div className={`epf-block${exampleOpen ? " is-open" : ""}`}>
            <div className="epf-block__bar">
              <button
                type="button"
                className="epf-block__toggle"
                onClick={() => setExampleOpen((v) => !v)}
                aria-expanded={exampleOpen}
              >
                <span className="epf-block__caret" aria-hidden>
                  {exampleOpen ? "▾" : "▸"}
                </span>
                <span className="epf-block__title">调用/响应示例</span>
              </button>
            </div>
            {exampleOpen ? (
              <div className="epf-examples">
                <label className="epf-field epf-field--full">
                  <span className="epf-label">调用示例</span>
                  <textarea
                    className="epf-input epf-textarea epf-textarea--code"
                    rows={5}
                    value={form.exampleRequest}
                    onChange={(e) => setField("exampleRequest", e.target.value)}
                    placeholder="粘贴调用示例代码"
                    spellCheck={false}
                  />
                </label>
                <label className="epf-field epf-field--full">
                  <span className="epf-label">响应示例</span>
                  <textarea
                    className="epf-input epf-textarea epf-textarea--code"
                    rows={5}
                    value={form.exampleResponse}
                    onChange={(e) => setField("exampleResponse", e.target.value)}
                    placeholder="粘贴响应示例 JSON"
                    spellCheck={false}
                  />
                </label>
              </div>
            ) : null}
          </div>

          <div className="epf-doc">
            <span className="epf-label">接口文档</span>
            <div className="epf-doc__row">
              <input
                className="epf-input"
                readOnly
                value={form.docFile?.name ?? ""}
                placeholder="请上传接口文档（可选）"
              />
              <input
                ref={fileRef}
                type="file"
                hidden
                accept={ACCEPT_ATTR}
                onChange={(e) => {
                  pickFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button type="button" className="epf-upload" onClick={() => fileRef.current?.click()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M21.4 11.6l-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l9.2-9.2a3.5 3.5 0 0 1 5 5l-9.2 9.1a1.5 1.5 0 1 1-2.1-2.1l8.1-8.1"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                上传
              </button>
              {form.docFile ? (
                <button type="button" className="epf-del" onClick={() => setField("docFile", null)}>
                  移除
                </button>
              ) : null}
            </div>
          </div>

          {error ? <div className="epf-error">{error}</div> : null}
        </div>

        <div className="a-modal__actions">
          <button type="button" className="a-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="a-btn a-btn--primary" onClick={submit}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
