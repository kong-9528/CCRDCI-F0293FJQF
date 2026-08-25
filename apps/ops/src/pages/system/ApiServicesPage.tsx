import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Switch } from "@/components/Switch";
import {
  API_TAB_LABEL,
  useApiServicesStore,
  type ApiParam,
  type ApiServiceTab,
  type ProductApiEndpoint,
} from "@/lib/apiServicesStore";

function ParamTable({ title, rows }: { title: string; rows: ApiParam[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="a-api-params">
      <div className="a-api-params__title">{title}</div>
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
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={`${title}-${p.name}`}>
                <td>
                  <code className="a-code">{p.name}</code>
                </td>
                <td>{p.type}</td>
                <td>{p.required ? "是" : "否"}</td>
                <td>{p.desc}</td>
                <td>{p.defaultValue || "—"}</td>
                <td>{p.validation || "—"}</td>
                <td>{p.example || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EndpointRow({
  ep,
  expanded,
  onToggle,
  onStatusChange,
}: {
  ep: ProductApiEndpoint;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (online: boolean) => void;
}) {
  const { titleOf } = useApiServicesStore();
  const online = ep.status === "online";

  return (
    <div className={`a-api-row${expanded ? " is-open" : ""}`}>
      <div className="a-api-row__head">
        <button type="button" className="a-api-row__toggle" onClick={onToggle}>
          <span className="a-api-row__chevron" aria-hidden>
            {expanded ? "▾" : "▸"}
          </span>
          <span className="a-api-row__title">{titleOf(ep)}</span>
        </button>
        <div className="a-api-row__status">
          <span className="a-api-row__status-label">{online ? "上线" : "下线"}</span>
          <Switch
            checked={online}
            aria-label={`${titleOf(ep)} ${online ? "下线" : "上线"}`}
            onChange={onStatusChange}
          />
        </div>
        <Link className="a-btn a-btn--text a-btn--sm" to={`/system/api-services/${ep.id}/edit`}>
          编辑
        </Link>
      </div>

      {expanded ? (
        <div className="a-api-row__body">
          <div className="a-desc a-desc--api">
            <div className="a-desc__item">
              <span className="a-desc__label">接口标识</span>
              <span className="a-desc__value">
                <code className="a-code">{ep.apiCode}</code>
              </span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">接口地址</span>
              <span className="a-desc__value">
                <code className="a-code">{ep.path}</code>
              </span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">请求方法</span>
              <span className="a-desc__value">
                <span className="a-method">{ep.method}</span>
              </span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">版本</span>
              <span className="a-desc__value">{ep.version}</span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">负责人</span>
              <span className="a-desc__value">{ep.owner || "—"}</span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">上线状态</span>
              <span className="a-desc__value a-cell-with-action">
                <span className="a-api-row__status-label">{online ? "上线" : "下线"}</span>
                <Switch
                  checked={online}
                  aria-label={`${titleOf(ep)} ${online ? "下线" : "上线"}`}
                  onChange={onStatusChange}
                />
              </span>
            </div>
            {ep.description ? (
              <div className="a-desc__item a-desc__item--block">
                <span className="a-desc__label">说明</span>
                <span className="a-desc__value">{ep.description}</span>
              </div>
            ) : null}
          </div>

          <ParamTable title="Path 参数" rows={ep.pathParams} />
          <ParamTable title="Query 参数" rows={ep.queryParams} />
          <ParamTable title="Header 参数" rows={ep.headerParams} />
          <ParamTable title="Body 参数" rows={ep.bodyParams} />
          <ParamTable title="响应字段" rows={ep.responseParams} />

          <div className="a-api-row__actions">
            <Link className="a-btn a-btn--sm" to={`/system/api-services/${ep.id}/edit`}>
              编辑接口
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function parseTab(raw: string | null): ApiServiceTab {
  return raw === "audit" ? "audit" : "verify";
}

export function ApiServicesPage() {
  const store = useApiServicesStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  const rows = useMemo(() => store.getByTab(tab), [store, tab]);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const switchTab = (next: ApiServiceTab) => {
    setSearchParams(next === "verify" ? {} : { tab: next });
    setOpenIds(new Set());
  };

  return (
    <div className="a-card">
      <div className="a-api-list-toolbar">
        <div className="a-tabs a-tabs--segment" role="tablist">
          {(Object.keys(API_TAB_LABEL) as ApiServiceTab[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`a-tabs__item${tab === key ? " is-active" : ""}`}
              onClick={() => switchTab(key)}
            >
              {API_TAB_LABEL[key]}
            </button>
          ))}
        </div>
        <Link className="a-btn a-btn--primary a-btn--sm" to="/system/api-services/new">
          新增接口
        </Link>
      </div>

      <div className="a-card__body a-card__body--flush">
        {rows.length === 0 ? (
          <div className="a-empty">暂无接口配置</div>
        ) : (
          <div className="a-api-list">
            {rows.map((ep) => (
              <EndpointRow
                key={ep.id}
                ep={ep}
                expanded={openIds.has(ep.id)}
                onToggle={() => toggleOpen(ep.id)}
                onStatusChange={(online) =>
                  store.setStatus(ep.id, online ? "online" : "offline")
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
