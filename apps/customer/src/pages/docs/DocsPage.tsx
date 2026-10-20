import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { PaneHeader } from "@/components/PaneHeader";
import {
  DOCS_CALL_LANGS,
  DOCS_HIDDEN_CATALOG_IDS,
  DOCS_OVERVIEW,
  DOCS_TABS,
  DOCS_VERSIONS,
  buildDocsCallExamples,
  resolveDocsTab,
  type DocsTabKey,
} from "@/lib/docs";
import {
  collectRequestParams,
  listApiDocCatalogs,
  listOnlineByCatalog,
  parseParamTableJson,
  resolveRequestParamsText,
  resolveResponseFieldsText,
  subscribeApiCatalog,
  type ApiDocCatalog,
  type ApiEndpoint,
  type ApiParam,
  type ParamTableDoc,
  type ParamTableRow,
} from "@ctp/api-catalog";

function visibleDocsCatalogs(list: ApiDocCatalog[] = listApiDocCatalogs()) {
  return list.filter((c) => !DOCS_HIDDEN_CATALOG_IDS.has(c.id));
}

function collectExpandableKeys(rows: ParamTableRow[], out: Set<string>) {
  for (const row of rows) {
    if (row.children?.length) {
      out.add(row.rowKey);
      collectExpandableKeys(row.children, out);
    }
  }
}

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

function NestedParamTable({ doc }: { doc: ParamTableDoc }) {
  const [expanded, setExpanded] = useState(() => {
    const keys = new Set<string>();
    collectExpandableKeys(doc.data, keys);
    return keys;
  });

  useEffect(() => {
    const keys = new Set<string>();
    collectExpandableKeys(doc.data, keys);
    setExpanded(keys);
  }, [doc]);

  const columns = doc.columns?.length
    ? doc.columns
    : [
        { title: "参数名", dataIndex: "name" },
        { title: "类型", dataIndex: "type" },
        { title: "必填", dataIndex: "required" },
        { title: "说明", dataIndex: "desc" },
      ];

  if (!doc.data?.length) {
    return <div className="c-docs-empty">暂无参数</div>;
  }

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderRows = (rows: ParamTableRow[], depth: number): ReactNode[] => {
    const nodes: ReactNode[] = [];
    for (const row of rows) {
      const hasChildren = Boolean(row.children?.length);
      const isOpen = expanded.has(row.rowKey);
      nodes.push(
        <tr key={row.rowKey} className={hasChildren ? "c-docs-table__row--branch" : undefined}>
          {columns.map((col, colIdx) => {
            const raw = row[col.dataIndex];
            const text =
              raw == null || raw === ""
                ? "—"
                : typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean"
                  ? String(raw)
                  : "—";
            if (colIdx === 0) {
              return (
                <td key={col.dataIndex} className="c-docs-table__name-cell">
                  <span
                    className="c-docs-table__indent"
                    style={{ paddingLeft: depth * 16 }}
                  >
                    {hasChildren ? (
                      <button
                        type="button"
                        className="c-docs-table__expand"
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "收起" : "展开"}
                        onClick={() => toggle(row.rowKey)}
                      >
                        {isOpen ? "▾" : "▸"}
                      </button>
                    ) : (
                      <span className="c-docs-table__expand-spacer" aria-hidden />
                    )}
                    <code>{text === "—" && col.dataIndex === "name" ? String(row.name ?? "—") : text}</code>
                  </span>
                </td>
              );
            }
            return <td key={col.dataIndex}>{text}</td>;
          })}
        </tr>,
      );
      if (hasChildren && isOpen && row.children) {
        nodes.push(...renderRows(row.children, depth + 1));
      }
    }
    return nodes;
  };

  return (
    <div className="c-docs-table-wrap c-docs-table-wrap--nested">
      <table className="c-docs-table c-docs-table--nested">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.dataIndex}
                style={
                  col.width != null
                    ? { width: typeof col.width === "number" ? `${col.width}px` : col.width }
                    : undefined
                }
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderRows(doc.data, 0)}</tbody>
      </table>
    </div>
  );
}

function DocsParamBlock({
  title,
  jsonText,
  fallbackRows,
  showRequired,
}: {
  title: string;
  jsonText: string;
  fallbackRows: ApiParam[];
  showRequired?: boolean;
}) {
  const parsed = useMemo(() => parseParamTableJson(jsonText), [jsonText]);
  return (
    <section className="c-docs-block">
      <h3 className="c-docs-block__title">{title}</h3>
      {parsed.ok ? (
        <NestedParamTable doc={parsed.value} />
      ) : (
        <ParamTable rows={fallbackRows} showRequired={showRequired} />
      )}
    </section>
  );
}

function ApiCallExamplePanel({ api }: { api: ApiEndpoint }) {
  const [lang, setLang] = useState(DOCS_CALL_LANGS[0].id);
  const examples = useMemo(
    () =>
      buildDocsCallExamples({
        method: api.method,
        path: api.path,
        exampleRequest: api.exampleRequest,
      }),
    [api.method, api.path, api.exampleRequest],
  );
  const code = examples[lang] ?? examples[DOCS_CALL_LANGS[0].id] ?? "";

  return (
    <section className="c-docs-block">
      <h3 className="c-docs-block__title">调用示例</h3>
      <div className="c-docs-lang-tabs" role="tablist" aria-label="调用示例语言">
        {DOCS_CALL_LANGS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={lang === item.id}
            className={`c-docs-lang-tabs__item${lang === item.id ? " is-active" : ""}`}
            onClick={() => setLang(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <pre className="c-docs-code">{code}</pre>
    </section>
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
  const requestJsonText = resolveRequestParamsText(api);
  const responseJsonText = resolveResponseFieldsText(api);

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

          <DocsParamBlock
            title="请求入参"
            jsonText={requestJsonText}
            fallbackRows={requestParams}
            showRequired
          />

          <DocsParamBlock
            title="请求出参"
            jsonText={responseJsonText}
            fallbackRows={responseParams}
          />

          <ApiCallExamplePanel api={api} />

          <section className="c-docs-block">
            <h3 className="c-docs-block__title">响应示例</h3>
            {api.exampleResponse?.trim() ? (
              <pre className="c-docs-code">{api.exampleResponse}</pre>
            ) : (
              <div className="c-docs-empty">暂无响应示例</div>
            )}
          </section>
        </div>
      ) : null}
    </article>
  );
}

function VersionPanel() {
  return (
    <div className="c-docs-version-timeline">
      {DOCS_VERSIONS.map((item) => (
        <div key={item.version} className="c-docs-timeline-item">
          <span className="c-docs-timeline-dot" aria-hidden />
          <div className="c-docs-timeline-body">
            <div className="c-docs-version-meta">
              <span className="c-docs-version-badge">{item.version}</span>
              <span className="c-docs-version-date">{item.date}</span>
            </div>
            <p className="c-docs-version-desc">{item.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="c-docs-intro">
      <p>{DOCS_OVERVIEW.summary}</p>
      <h3>{DOCS_OVERVIEW.capabilitiesTitle}</h3>
      <ul>
        {DOCS_OVERVIEW.capabilities.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export function DocsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogFromQuery = searchParams.get("catalog") ?? "";
  const tabFromQuery = searchParams.get("tab");
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeApiCatalog(() => setTick((n) => n + 1)), []);

  const catalogs = visibleDocsCatalogs();

  const initialTab = (): DocsTabKey => {
    if (catalogFromQuery && catalogs.some((c) => c.id === catalogFromQuery)) {
      return "interfaces";
    }
    return resolveDocsTab(tabFromQuery);
  };

  const [activeTab, setActiveTab] = useState<DocsTabKey>(initialTab);
  const [activeCatalogId, setActiveCatalogId] = useState(() => {
    if (catalogFromQuery && catalogs.some((c) => c.id === catalogFromQuery)) {
      return catalogFromQuery;
    }
    return catalogs[0]?.id ?? "";
  });
  const [openApiId, setOpenApiId] = useState<string | null>(null);

  useEffect(() => {
    const list = visibleDocsCatalogs();
    if (catalogFromQuery && list.some((c) => c.id === catalogFromQuery)) {
      setActiveTab("interfaces");
      setActiveCatalogId(catalogFromQuery);
      return;
    }
    if (tabFromQuery) {
      const tab = resolveDocsTab(tabFromQuery);
      setActiveTab(tab);
      if (tab === "interfaces") {
        setActiveCatalogId((prev) => (list.some((c) => c.id === prev) ? prev : list[0]?.id ?? ""));
      }
      return;
    }
    if (!list.length) {
      setActiveCatalogId("");
      return;
    }
    setActiveCatalogId((prev) => (list.some((c) => c.id === prev) ? prev : list[0].id));
  }, [tick, catalogFromQuery, tabFromQuery]);

  const activeCatalog = catalogs.find((c) => c.id === activeCatalogId) ?? catalogs[0];
  const apis = activeCatalog ? listOnlineByCatalog(activeCatalog.id) : [];

  useEffect(() => {
    setOpenApiId(null);
  }, [activeCatalogId]);

  const selectTab = (key: DocsTabKey) => {
    setActiveTab(key);
    if (key === "interfaces") {
      const id = activeCatalogId || catalogs[0]?.id || "";
      setActiveCatalogId(id);
      setSearchParams(id ? { catalog: id } : { tab: "interfaces" }, { replace: true });
      return;
    }
    setSearchParams({ tab: key }, { replace: true });
  };

  const selectCatalog = (id: string) => {
    setActiveTab("interfaces");
    setActiveCatalogId(id);
    setSearchParams(id ? { catalog: id } : { tab: "interfaces" }, { replace: true });
  };

  const panelTitle =
    activeTab === "interfaces"
      ? (activeCatalog?.name ?? "接口列表")
      : (DOCS_TABS.find((t) => t.key === activeTab)?.name ?? "文档");

  return (
    <div className="c-docs-layout">
      <aside className="c-docs-sidebar" aria-label="文档目录">
        <ul className="c-docs-nav">
          {DOCS_TABS.filter((t) => t.key !== "interfaces").map((tab) => {
            const active = activeTab === tab.key;
            return (
              <li key={tab.key}>
                <button
                  type="button"
                  className={`c-docs-nav__item${active ? " is-active" : ""}`}
                  onClick={() => selectTab(tab.key)}
                >
                  {tab.name}
                </button>
              </li>
            );
          })}
          {catalogs.map((cat) => {
            const active = activeTab === "interfaces" && cat.id === activeCatalog?.id;
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

      <section className="c-docs-main">
        <PaneHeader as="h1" title={panelTitle} />

        {activeTab === "version" ? <VersionPanel /> : null}

        {activeTab === "overview" ? <OverviewPanel /> : null}

        {activeTab === "interfaces" ? (
          <div className="c-docs-list">
            <p className="c-docs-list-hint">只展示当前机构有权限的接口列表</p>
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
        ) : null}
      </section>
    </div>
  );
}
