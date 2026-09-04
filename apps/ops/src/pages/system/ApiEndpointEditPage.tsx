import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ApiDocUploadModal } from "@/components/ApiDocUploadModal";
import { IconPdf } from "@/components/icons/UiIcons";
import {
  PRODUCT_CODES,
  PRODUCT_NAME,
  useApiServicesStore,
  type ApiDocFile,
  type ApiEndpoint,
  type ApiParam,
  type HttpMethod,
  type ProductCode,
} from "@/lib/apiServicesStore";

type FormState = {
  apiName: string;
  path: string;
  method: HttpMethod;
  version: string;
  description: string;
  productCode: ProductCode;
  docFile: ApiDocFile | null;
  requestParamsText: string;
  responseFieldsText: string;
  exampleRequest: string;
  exampleResponse: string;
};

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];

function formatParamLines(title: string, rows: ApiParam[]) {
  if (!rows.length) return "";
  const lines = rows.map((p) => {
    const req = p.required ? "必填" : "可选";
    const bits = [`${p.name}`, `(${p.type}, ${req})`];
    if (p.desc) bits.push(`: ${p.desc}`);
    return `- ${bits.join(" ")}`;
  });
  return `【${title}】\n${lines.join("\n")}`;
}

function buildRequestParamsText(ep: ApiEndpoint) {
  if (ep.requestParamsText?.trim()) return ep.requestParamsText;
  return [
    formatParamLines("Path", ep.pathParams),
    formatParamLines("Query", ep.queryParams),
    formatParamLines("Header", ep.headerParams),
    formatParamLines("Body", ep.bodyParams),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildResponseFieldsText(ep: ApiEndpoint) {
  if (ep.responseFieldsText?.trim()) return ep.responseFieldsText;
  return formatParamLines("响应字段", ep.responseParams).replace(/^【响应字段】\n/, "") || "";
}

function emptyForm(productCode: ProductCode = "dci"): FormState {
  return {
    apiName: "",
    path: "",
    method: "POST",
    version: "v1",
    description: "",
    productCode,
    docFile: null,
    requestParamsText: "",
    responseFieldsText: "",
    exampleRequest: "",
    exampleResponse: "",
  };
}

function fromEndpoint(ep: ApiEndpoint): FormState {
  return {
    apiName: ep.apiName,
    path: ep.path,
    method: ep.method,
    version: ep.version,
    description: ep.description,
    productCode: ep.productCode,
    docFile: ep.docFile ?? null,
    requestParamsText: buildRequestParamsText(ep),
    responseFieldsText: buildResponseFieldsText(ep),
    exampleRequest: ep.exampleRequest,
    exampleResponse: ep.exampleResponse,
  };
}

function isProductCode(value: string | null | undefined): value is ProductCode {
  return Boolean(value && (PRODUCT_CODES as readonly string[]).includes(value));
}

/** 隐藏字段：由路径自动生成接口标识 */
function autoApiCode(path: string, productCode: ProductCode) {
  const slug = path
    .trim()
    .replace(/^\/+/, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
  return slug || `${productCode}_api_${Date.now().toString(36)}`;
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
  const [docModalOpen, setDocModalOpen] = useState(false);

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

  const listHref = "/system/api-services";

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
            <button type="button" className="a-btn" onClick={() => navigate(listHref)}>
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

    try {
      if (isCreate) {
        let apiCode = autoApiCode(form.path, form.productCode);
        let n = 1;
        while (store.isCodeTaken(apiCode)) {
          apiCode = `${autoApiCode(form.path, form.productCode)}_${n++}`;
        }
        store.create({
          apiCode,
          apiName: form.apiName,
          path: form.path,
          method: form.method,
          version: form.version,
          description: form.description,
          productCode: form.productCode,
          owner: "平台运营",
          docFile: form.docFile,
          requestParamsText: form.requestParamsText,
          responseFieldsText: form.responseFieldsText,
          pathParams: [],
          queryParams: [],
          headerParams: [],
          bodyParams: [],
          responseParams: [],
          errorCodes: [],
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
          docFile: form.docFile,
          requestParamsText: form.requestParamsText,
          responseFieldsText: form.responseFieldsText,
          exampleRequest: form.exampleRequest,
          exampleResponse: form.exampleResponse,
        });
      }
      navigate(listHref);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  return (
    <div className="a-api-edit">
      <div className="a-card">
        <div className="a-card__head">
          {isCreate ? "新增接口" : "编辑接口"}
          <div className="a-card__extra">
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate(listHref)}>
              返回列表
            </button>
          </div>
        </div>

        <div className="a-card__body a-api-edit__body">
          <section className="a-api-edit__section">
            <header className="a-api-edit__section-head">
              <h3 className="a-api-edit__section-title">基础信息</h3>
              <p className="a-api-edit__section-desc">配置接口名称、路径与归属产品</p>
            </header>

            <div className="a-api-edit__grid">
              <label className="a-api-edit__field">
                <span className="a-api-edit__label">
                  接口名称 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.apiName}
                  onChange={(e) => setField("apiName", e.target.value)}
                  placeholder="请输入接口名称"
                />
              </label>

              <label className="a-api-edit__field">
                <span className="a-api-edit__label">
                  归属产品 <span className="a-req">*</span>
                </span>
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

              <label className="a-api-edit__field a-api-edit__field--span2">
                <span className="a-api-edit__label">
                  请求路径 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input a-api-edit__mono"
                  value={form.path}
                  onChange={(e) => setField("path", e.target.value)}
                  placeholder="/v1/verify/..."
                  spellCheck={false}
                />
              </label>

              <label className="a-api-edit__field">
                <span className="a-api-edit__label">请求方法</span>
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

              <label className="a-api-edit__field">
                <span className="a-api-edit__label">版本</span>
                <input
                  className="a-input"
                  value={form.version}
                  onChange={(e) => setField("version", e.target.value)}
                  placeholder="v1"
                />
              </label>

              <label className="a-api-edit__field a-api-edit__field--span2">
                <span className="a-api-edit__label">接口说明</span>
                <textarea
                  className="a-input a-textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="简要说明接口用途与适用场景"
                />
              </label>

              <div className="a-api-edit__field a-api-edit__field--span2">
                <span className="a-api-edit__label">接口文档</span>
                <div className="a-api-edit__upload">
                  <div className="a-api-edit__upload-main">
                    <button
                      type="button"
                      className="a-btn a-btn--sm a-btn--primary"
                      onClick={() => setDocModalOpen(true)}
                    >
                      {form.docFile ? "更新文档" : "上传文档"}
                    </button>
                    <span className="a-api-edit__upload-hint">
                      支持 doc / docx / pdf / md / txt / xls / xlsx，单个文件不超过 50MB
                    </span>
                  </div>
                  {form.docFile ? (
                    <div className="a-api-edit__upload-file">
                      <IconPdf />
                      <span className="a-api-edit__upload-name" title={form.docFile.name}>
                        {form.docFile.name}
                      </span>
                      <button
                        type="button"
                        className="a-btn a-btn--text a-btn--sm"
                        onClick={() => setField("docFile", null)}
                      >
                        移除
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="a-api-edit__section">
            <header className="a-api-edit__section-head">
              <h3 className="a-api-edit__section-title">请求参数</h3>
              <p className="a-api-edit__section-desc">用多行文本描述 Path / Query / Header / Body 参数</p>
            </header>
            <label className="a-api-edit__field">
              <span className="a-api-edit__label">参数说明</span>
              <textarea
                className="a-input a-textarea a-api-edit__textarea"
                rows={12}
                value={form.requestParamsText}
                onChange={(e) => setField("requestParamsText", e.target.value)}
                placeholder={
                  "【Body】\n- dciCode (string, 必填): 待核验 DCI 编码\n- channel (string, 可选): 调用渠道"
                }
                spellCheck={false}
              />
            </label>
          </section>

          <section className="a-api-edit__section">
            <header className="a-api-edit__section-head">
              <h3 className="a-api-edit__section-title">响应字段</h3>
              <p className="a-api-edit__section-desc">用多行文本描述返回字段含义</p>
            </header>
            <label className="a-api-edit__field">
              <span className="a-api-edit__label">字段说明</span>
              <textarea
                className="a-input a-textarea a-api-edit__textarea"
                rows={10}
                value={form.responseFieldsText}
                onChange={(e) => setField("responseFieldsText", e.target.value)}
                placeholder={
                  "- code (number, 必填): 业务状态码，0 表示成功\n- message (string, 必填): 提示信息\n- data (object, 可选): 业务数据"
                }
                spellCheck={false}
              />
            </label>
          </section>

          <section className="a-api-edit__section">
            <header className="a-api-edit__section-head">
              <h3 className="a-api-edit__section-title">示例</h3>
              <p className="a-api-edit__section-desc">可选，填写 JSON 示例便于对接方参考</p>
            </header>
            <div className="a-api-edit__examples">
              <label className="a-api-edit__field">
                <span className="a-api-edit__label">示例请求</span>
                <textarea
                  className="a-input a-textarea a-textarea--code a-api-edit__textarea"
                  rows={10}
                  value={form.exampleRequest}
                  onChange={(e) => setField("exampleRequest", e.target.value)}
                  spellCheck={false}
                  placeholder="{}"
                />
              </label>
              <label className="a-api-edit__field">
                <span className="a-api-edit__label">示例响应</span>
                <textarea
                  className="a-input a-textarea a-textarea--code a-api-edit__textarea"
                  rows={10}
                  value={form.exampleResponse}
                  onChange={(e) => setField("exampleResponse", e.target.value)}
                  spellCheck={false}
                  placeholder="{}"
                />
              </label>
            </div>
          </section>

          {error ? <div className="a-form-error">{error}</div> : null}
        </div>

        <div className="a-api-edit__footer">
          <button type="button" className="a-btn a-btn--primary" onClick={submit}>
            保存
          </button>
          <Link className="a-btn" to={listHref}>
            取消
          </Link>
        </div>
      </div>

      <ApiDocUploadModal
        open={docModalOpen}
        initialFile={form.docFile}
        onClose={() => setDocModalOpen(false)}
        onConfirm={(file) => {
          setField("docFile", file);
          setDocModalOpen(false);
        }}
      />
    </div>
  );
}
