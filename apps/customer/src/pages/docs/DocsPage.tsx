import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  collectRequestParams,
  listApiDocCatalogs,
  listOnlineByCatalog,
  subscribeApiCatalog,
  type ApiEndpoint,
  type ApiParam,
} from "@ctp/api-catalog";

function ParamTable({
  rows,
  showRequired,
}: {
  rows: ApiParam[];
  showRequired?: boolean;
}) {
  if (!rows.length) {
    return <div className="c-docs-empty">暂无参数</div>;
  }
  return (
    <div className="c-docs-table-wrap">
      <table className="c-docs-table">
        <thead>
          <tr>
            <th>参数名</th>
            <th>类型</th>
            {showRequired ? <th>必填</th> : null}
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.name}-${row.type}`}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>{row.type}</td>
              {showRequired ? <td>{row.required ? "是" : "否"}</td> : null}
              <td>{row.desc || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApiAccordionItem({
  api,
  open,
  onToggle,
}: {
  api: ApiEndpoint;
  open: boolean;
  onToggle: () => void;
}) {
  const requestParams = collectRequestParams(api);
  const responseParams = api.responseParams ?? [];

  const downloadDoc = () => {
    const file = api.docFile;
    if (file?.url) {
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    const body = [
      `# ${api.apiName}`,
      ``,
      `请求方式：${api.method}`,
      `请求地址：${api.path}`,
      api.description ? `接口描述：${api.description}` : "",
      ``,
      `## 请求入参`,
      requestParams.length
        ? requestParams
            .map(
              (p) =>
                `- ${p.name} (${p.type}, ${p.required ? "必填" : "可选"})${p.desc ? `: ${p.desc}` : ""}`,
            )
            .join("\n")
        : "（无）",
      ``,
      `## 请求出参`,
      responseParams.length
        ? responseParams.map((p) => `- ${p.name} (${p.type})${p.desc ? `: ${p.desc}` : ""}`).join("\n")
        : "（无）",
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${api.apiCode || api.apiName}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <article className={`c-docs-acc${open ? " is-open" : ""}`}>
      <div className="c-docs-acc__head">
        <button type="button" className="c-docs-acc__toggle" onClick={onToggle} aria-expanded={open}>
          <span className="c-docs-acc__caret" aria-hidden>
            {open ? "▾" : "▸"}
          </span>
          <span className="c-docs-acc__meta">
            <span className="c-docs-acc__title">{api.apiName}</span>
            {api.description ? <span className="c-docs-acc__desc">{api.description}</span> : null}
          </span>
        </button>
        <button type="button" className="c-docs-acc__doc-btn" onClick={downloadDoc}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          接口文档
        </button>
      </div>

      {open ? (
        <div className="c-docs-acc__body">
          <div className="c-docs-endpoint">
            <span className={`c-docs-method c-docs-method--${api.method.toLowerCase()}`}>
              {api.method}
            </span>
            <code className="c-docs-path">{api.path}</code>
          </div>

          <section className="c-docs-block">
            <h3 className="c-docs-block__title">请求入参</h3>
            <ParamTable rows={requestParams} showRequired />
          </section>

          <section className="c-docs-block">
            <h3 className="c-docs-block__title">请求出参</h3>
            <ParamTable rows={responseParams} />
          </section>

          {api.exampleRequest || api.exampleResponse ? (
            <section className="c-docs-block">
              <h3 className="c-docs-block__title">调用 / 响应示例</h3>
              {api.exampleRequest ? (
                <pre className="c-docs-code">{api.exampleRequest}</pre>
              ) : null}
              {api.exampleResponse ? (
                <pre className="c-docs-code">{api.exampleResponse}</pre>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function DocsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogFromQuery = searchParams.get("catalog") ?? "";
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeApiCatalog(() => setTick((n) => n + 1)), []);

  const catalogs = listApiDocCatalogs();
  const [activeCatalogId, setActiveCatalogId] = useState(() => {
    if (catalogFromQuery && catalogs.some((c) => c.id === catalogFromQuery)) {
      return catalogFromQuery;
    }
    return catalogs[0]?.id ?? "";
  });
  const [openApiId, setOpenApiId] = useState<string | null>(null);

  useEffect(() => {
    const list = listApiDocCatalogs();
    if (!list.length) {
      setActiveCatalogId("");
      return;
    }
    if (catalogFromQuery && list.some((c) => c.id === catalogFromQuery)) {
      setActiveCatalogId(catalogFromQuery);
      return;
    }
    setActiveCatalogId((prev) => (list.some((c) => c.id === prev) ? prev : list[0].id));
  }, [tick, catalogFromQuery]);

  const activeCatalog = catalogs.find((c) => c.id === activeCatalogId) ?? catalogs[0];

  const apis = activeCatalog ? listOnlineByCatalog(activeCatalog.id) : [];

  useEffect(() => {
    setOpenApiId(null);
  }, [activeCatalogId]);

  const selectCatalog = (id: string) => {
    setActiveCatalogId(id);
    setSearchParams(id ? { catalog: id } : {}, { replace: true });
  };

  return (
    <div className="c-docs-layout">
      <aside className="c-docs-sidebar" aria-label="文档目录">
        <ul className="c-docs-nav">
          {catalogs.map((cat) => {
            const active = cat.id === activeCatalog?.id;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  className={`c-docs-nav__item${active ? " is-active" : ""}`}
                  onClick={() => selectCatalog(cat.id)}
                >
                  {cat.name}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="c-docs-main a-card">
        <div className="c-docs-main__head">
          <h1 className="c-docs-main__title">{activeCatalog?.name ?? "接口列表"}</h1>
        </div>

        <div className="c-docs-list">
          {apis.length === 0 ? (
            <div className="a-empty">该目录暂无可用接口</div>
          ) : (
            apis.map((api) => (
              <ApiAccordionItem
                key={api.id}
                api={api}
                open={openApiId === api.id}
                onToggle={() => setOpenApiId((prev) => (prev === api.id ? null : api.id))}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
