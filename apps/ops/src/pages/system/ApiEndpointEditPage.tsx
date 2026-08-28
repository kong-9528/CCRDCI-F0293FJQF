import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { normalizeProductCode, type ProductCode as CatalogProductCode } from "@/lib/catalog";
import {
  PRODUCT_CODES,
  PRODUCT_NAME,
  useApiServicesStore,
  type ApiEndpoint,
  type ApiErrorCode,
  type ApiParam,
  type ApiServiceTab,
  type HttpMethod,
  type ProductCode,
} from "@/lib/apiServicesStore";

type FormState = {
  apiCode: string;
  apiName: string;
  path: string;
  method: HttpMethod;
  version: string;
  description: string;
  productCode: ProductCode;
  owner: string;
  pathParams: ApiParam[];
  queryParams: ApiParam[];
  headerParams: ApiParam[];
  bodyParams: ApiParam[];
  responseParams: ApiParam[];
  errorCodes: ApiErrorCode[];
  exampleRequest: string;
  exampleResponse: string;
};

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];

function emptyParam(): ApiParam {
  return { name: "", type: "string", required: false, desc: "" };
}

function emptyError(): ApiErrorCode {
  return { code: "", desc: "" };
}

function emptyForm(productCode: ProductCode = "dci"): FormState {
  return {
    apiCode: "",
    apiName: "",
    path: "",
    method: "POST",
    version: "v1",
    description: "",
    productCode,
    owner: "",
    pathParams: [],
    queryParams: [],
    headerParams: [],
    bodyParams: [],
    responseParams: [
      { name: "code", type: "number", required: true, desc: "业务状态码，0 表示成功" },
      { name: "message", type: "string", required: true, desc: "提示信息" },
      { name: "data", type: "object", required: false, desc: "业务数据" },
      { name: "requestId", type: "string", required: true, desc: "请求追踪 ID" },
    ],
    errorCodes: [
      { code: "0", desc: "成功" },
      { code: "40001", desc: "参数错误" },
      { code: "40101", desc: "鉴权失败" },
    ],
    exampleRequest: "",
    exampleResponse: "",
  };
}

function fromEndpoint(ep: ApiEndpoint): FormState {
  return {
    apiCode: ep.apiCode,
    apiName: ep.apiName,
    path: ep.path,
    method: ep.method,
    version: ep.version,
    description: ep.description,
    productCode: ep.productCode,
    owner: ep.owner,
    pathParams: ep.pathParams.map((p) => ({ ...p })),
    queryParams: ep.queryParams.map((p) => ({ ...p })),
    headerParams: ep.headerParams.map((p) => ({ ...p })),
    bodyParams: ep.bodyParams.map((p) => ({ ...p })),
    responseParams: ep.responseParams.map((p) => ({ ...p })),
    errorCodes: ep.errorCodes.map((e) => ({ ...e })),
    exampleRequest: ep.exampleRequest,
    exampleResponse: ep.exampleResponse,
  };
}

function tabForProduct(code: ProductCode): ApiServiceTab {
  return normalizeProductCode(code as CatalogProductCode) === "workReview" ? "audit" : "verify";
}

function isProductCode(value: string | null | undefined): value is ProductCode {
  return Boolean(value && (PRODUCT_CODES as readonly string[]).includes(value));
}

function ParamEditor({
  title,
  rows,
  onChange,
}: {
  title: string;
  rows: ApiParam[];
  onChange: (next: ApiParam[]) => void;
}) {
  const updateRow = (index: number, patch: Partial<ApiParam>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="a-api-params">
      <div className="a-api-params__head">
        <div className="a-api-params__title">{title}</div>
        <button
          type="button"
          className="a-btn a-btn--sm"
          onClick={() => onChange([...rows, emptyParam()])}
        >
          添加参数
        </button>
      </div>
      <div className="a-table-wrap">
        <table className="a-table a-table--compact">
          <thead>
            <tr>
              <th>参数名</th>
              <th>类型</th>
              <th>必填</th>
              <th>说明</th>
              <th>默认值</th>
              <th>校验</th>
              <th>示例</th>
              <th style={{ width: 72 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="a-empty">暂无参数，可点击「添加参数」</div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`param-${title}-${index}`}>
                  <td>
                    <input
                      className="a-input a-input--sm"
                      value={row.name}
                      onChange={(e) => updateRow(index, { name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="a-input a-input--sm"
                      value={row.type}
                      onChange={(e) => updateRow(index, { type: e.target.value })}
                    />
                  </td>
                  <td>
                    <label className="a-check">
                      <input
                        type="checkbox"
                        checked={row.required}
                        onChange={(e) => updateRow(index, { required: e.target.checked })}
                      />
                      必填
                    </label>
                  </td>
                  <td>
                    <input
                      className="a-input a-input--sm"
                      value={row.desc}
                      onChange={(e) => updateRow(index, { desc: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="a-input a-input--sm"
                      value={row.defaultValue ?? ""}
                      onChange={(e) => updateRow(index, { defaultValue: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="a-input a-input--sm"
                      value={row.validation ?? ""}
                      onChange={(e) => updateRow(index, { validation: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="a-input a-input--sm"
                      value={row.example ?? ""}
                      onChange={(e) => updateRow(index, { example: e.target.value })}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="a-btn a-btn--text a-btn--sm"
                      onClick={() => removeRow(index)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ErrorCodeEditor({
  rows,
  onChange,
}: {
  rows: ApiErrorCode[];
  onChange: (next: ApiErrorCode[]) => void;
}) {
  const updateRow = (index: number, patch: Partial<ApiErrorCode>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <div className="a-api-params">
      <div className="a-api-params__head">
        <div className="a-api-params__title">错误码</div>
        <button
          type="button"
          className="a-btn a-btn--sm"
          onClick={() => onChange([...rows, emptyError()])}
        >
          添加错误码
        </button>
      </div>
      <div className="a-table-wrap">
        <table className="a-table a-table--compact">
          <thead>
            <tr>
              <th style={{ width: 160 }}>错误码</th>
              <th>说明</th>
              <th style={{ width: 72 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className="a-empty">暂无错误码</div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`err-${index}`}>
                  <td>
                    <input
                      className="a-input a-input--sm"
                      value={row.code}
                      onChange={(e) => updateRow(index, { code: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="a-input a-input--sm"
                      value={row.desc}
                      onChange={(e) => updateRow(index, { desc: e.target.value })}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="a-btn a-btn--text a-btn--sm"
                      onClick={() => onChange(rows.filter((_, i) => i !== index))}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ApiEndpointEditPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const store = useApiServicesStore();
  const isCreate = !id;

  const endpoint = useMemo(() => {
    if (!id) return null;
    return store.getById(id) ?? null;
  }, [id, store]);

  const initialProduct = searchParams.get("product");
  const [form, setForm] = useState<FormState>(() =>
    emptyForm(isProductCode(initialProduct) ? initialProduct : "dci"),
  );
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(isCreate);

  useEffect(() => {
    if (isCreate) {
      const code = searchParams.get("product");
      setForm(emptyForm(isProductCode(code) ? code : "dci"));
      setReady(true);
      return;
    }
    if (endpoint) {
      setForm(fromEndpoint(endpoint));
      setReady(true);
    }
  }, [isCreate, endpoint, searchParams]);

  const listHref = (tab: ApiServiceTab) => `/system/api-services?tab=${tab}`;

  if (!ready) {
    return (
      <div className="a-card">
        <div className="a-card__head">编辑接口</div>
        <div className="a-card__body">
          <div className="a-empty">加载中…</div>
        </div>
      </div>
    );
  }

  if (!isCreate && !endpoint) {
    return (
      <div className="a-card">
        <div className="a-card__head">编辑接口</div>
        <div className="a-card__body">
          <div className="a-empty">接口不存在</div>
          <div className="a-form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="a-btn" onClick={() => navigate("/system/api-services")}>
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = () => {
    setError(null);
    if (!form.apiCode.trim()) {
      setError("请填写接口标识 apiCode");
      return;
    }
    if (!form.apiName.trim()) {
      setError("请填写接口名称");
      return;
    }
    if (!form.path.trim()) {
      setError("请填写请求路径");
      return;
    }
    if (!form.path.startsWith("/")) {
      setError("请求路径须以 / 开头");
      return;
    }
    if (!form.productCode) {
      setError("请选择归属产品");
      return;
    }
    if (isCreate && store.isCodeTaken(form.apiCode)) {
      setError(`apiCode「${form.apiCode.trim()}」已存在`);
      return;
    }

    try {
      if (isCreate) {
        store.create({
          apiCode: form.apiCode,
          apiName: form.apiName,
          path: form.path,
          method: form.method,
          version: form.version,
          description: form.description,
          productCode: form.productCode,
          owner: form.owner,
          pathParams: form.pathParams,
          queryParams: form.queryParams,
          headerParams: form.headerParams,
          bodyParams: form.bodyParams,
          responseParams: form.responseParams,
          errorCodes: form.errorCodes,
          exampleRequest: form.exampleRequest,
          exampleResponse: form.exampleResponse,
          status: "offline",
        });
      } else if (endpoint) {
        store.update(endpoint.id, {
          apiName: form.apiName,
          path: form.path,
          method: form.method,
          version: form.version,
          description: form.description,
          productCode: form.productCode,
          owner: form.owner,
          pathParams: form.pathParams,
          queryParams: form.queryParams,
          headerParams: form.headerParams,
          bodyParams: form.bodyParams,
          responseParams: form.responseParams,
          errorCodes: form.errorCodes,
          exampleRequest: form.exampleRequest,
          exampleResponse: form.exampleResponse,
        });
      }
      navigate(listHref(tabForProduct(form.productCode)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const backTab = tabForProduct(form.productCode);

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          {isCreate ? "新增接口" : "编辑接口"}
          <div className="a-card__extra">
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate(listHref(backTab))}>
              返回
            </button>
          </div>
        </div>
        <div className="a-card__body a-stack">
          <section className="a-form-section">
            <h3 className="a-form-section__title">基础信息</h3>
            <div className="a-form a-form--grid">
              <label className="a-field">
                <span className="a-field__label">接口标识 apiCode</span>
                <input
                  className="a-input"
                  value={form.apiCode}
                  disabled={!isCreate}
                  onChange={(e) => setField("apiCode", e.target.value)}
                  placeholder="唯一标识，如 dci_single"
                />
              </label>
              <label className="a-field">
                <span className="a-field__label">接口名称</span>
                <input
                  className="a-input"
                  value={form.apiName}
                  onChange={(e) => setField("apiName", e.target.value)}
                />
              </label>
              <label className="a-field">
                <span className="a-field__label">请求路径</span>
                <input
                  className="a-input"
                  value={form.path}
                  onChange={(e) => setField("path", e.target.value)}
                  placeholder="/v1/..."
                />
              </label>
              <label className="a-field">
                <span className="a-field__label">请求方法</span>
                <select
                  className="a-input"
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
              <label className="a-field">
                <span className="a-field__label">版本</span>
                <input
                  className="a-input"
                  value={form.version}
                  onChange={(e) => setField("version", e.target.value)}
                />
              </label>
              <label className="a-field">
                <span className="a-field__label">归属产品</span>
                <select
                  className="a-input"
                  value={form.productCode}
                  onChange={(e) => setField("productCode", e.target.value as ProductCode)}
                >
                  {PRODUCT_CODES.map((code) => (
                    <option key={code} value={code}>
                      {PRODUCT_NAME[code]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="a-field">
                <span className="a-field__label">负责人</span>
                <input
                  className="a-input"
                  value={form.owner}
                  onChange={(e) => setField("owner", e.target.value)}
                />
              </label>
              <label className="a-field a-field--full">
                <span className="a-field__label">接口说明</span>
                <textarea
                  className="a-input a-textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">请求参数</h3>
            <ParamEditor
              title="Path 参数"
              rows={form.pathParams}
              onChange={(next) => setField("pathParams", next)}
            />
            <ParamEditor
              title="Query 参数"
              rows={form.queryParams}
              onChange={(next) => setField("queryParams", next)}
            />
            <ParamEditor
              title="Header 参数"
              rows={form.headerParams}
              onChange={(next) => setField("headerParams", next)}
            />
            <ParamEditor
              title="Body 参数"
              rows={form.bodyParams}
              onChange={(next) => setField("bodyParams", next)}
            />
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">响应定义</h3>
            <ParamEditor
              title="响应字段"
              rows={form.responseParams}
              onChange={(next) => setField("responseParams", next)}
            />
            <ErrorCodeEditor rows={form.errorCodes} onChange={(next) => setField("errorCodes", next)} />
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">示例</h3>
            <div className="a-form a-form--stack">
              <label className="a-field">
                <span className="a-field__label">示例请求（JSON）</span>
                <textarea
                  className="a-input a-textarea a-textarea--code"
                  rows={8}
                  value={form.exampleRequest}
                  onChange={(e) => setField("exampleRequest", e.target.value)}
                  spellCheck={false}
                />
              </label>
              <label className="a-field">
                <span className="a-field__label">示例响应（JSON）</span>
                <textarea
                  className="a-input a-textarea a-textarea--code"
                  rows={8}
                  value={form.exampleResponse}
                  onChange={(e) => setField("exampleResponse", e.target.value)}
                  spellCheck={false}
                />
              </label>
            </div>
          </section>

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="a-form-actions">
            <button type="button" className="a-btn a-btn--primary" onClick={submit}>
              保存
            </button>
            <Link className="a-btn" to={listHref(backTab)}>
              取消
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
