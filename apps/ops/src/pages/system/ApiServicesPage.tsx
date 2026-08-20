import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  API_STATUS_LABEL,
  API_TAB_LABEL,
  useApiServicesStore,
  type ApiOnlineStatus,
  type ApiParam,
  type ApiServiceTab,
  type ProductApiEndpoint,
} from "@/lib/apiServicesStore";

function ParamTable({ title, rows }: { title: string; rows: ApiParam[] }) {
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
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="a-empty">暂无参数</div>
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={`${title}-${p.name}`}>
                  <td>
                    <code className="a-code">{p.name}</code>
                  </td>
                  <td>{p.type}</td>
                  <td>{p.required ? "是" : "否"}</td>
                  <td>{p.desc}</td>
                </tr>
              ))
            )}
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
  onToggleStatus,
}: {
  ep: ProductApiEndpoint;
  expanded: boolean;
  onToggle: () => void;
  onToggleStatus: () => void;
}) {
  const { titleOf } = useApiServicesStore();

  return (
    <div className={`a-api-row${expanded ? " is-open" : ""}`}>
      <div className="a-api-row__head">
        <button type="button" className="a-api-row__toggle" onClick={onToggle}>
          <span className="a-api-row__chevron" aria-hidden>
            {expanded ? "▾" : "▸"}
          </span>
          <span className="a-api-row__title">{titleOf(ep)}</span>
        </button>
        <span
          className={`a-tag ${ep.status === "online" ? "a-tag--ok" : "a-tag--muted"}`}
        >
          {API_STATUS_LABEL[ep.status]}
        </span>
      </div>

      {expanded ? (
        <div className="a-api-row__body">
          <div className="a-desc a-desc--api">
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
              <span className="a-desc__label">状态</span>
              <span className="a-desc__value a-cell-with-action">
                <span
                  className={`a-tag ${
                    ep.status === "online" ? "a-tag--ok" : "a-tag--muted"
                  }`}
                >
                  {API_STATUS_LABEL[ep.status]}
                </span>
                <button
                  type="button"
                  className="a-btn a-btn--text a-btn--sm"
                  onClick={onToggleStatus}
                >
                  {ep.status === "online" ? "下线" : "上线"}
                </button>
              </span>
            </div>
          </div>

          <ParamTable title="提交参数" rows={ep.requestParams} />
          <ParamTable title="返回参数" rows={ep.responseParams} />
        </div>
      ) : null}
    </div>
  );
}

export function ApiServicesPage() {
  const store = useApiServicesStore();
  const [tab, setTab] = useState<ApiServiceTab>("verify");
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState<ProductApiEndpoint | null>(null);

  const rows = store.getByTab(tab);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const switchTab = (next: ApiServiceTab) => {
    setTab(next);
    setOpenIds(new Set());
  };

  return (
    <>
      <div className="a-card">
        <div className="a-tabs" role="tablist">
          {(Object.keys(API_TAB_LABEL) as ApiServiceTab[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              className={`a-tabs__item${tab === key ? " is-active" : ""}`}
              onClick={() => switchTab(key)}
            >
              {API_TAB_LABEL[key]}
            </button>
          ))}
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
                  onToggleStatus={() => setPending(ep)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.status === "online" ? "确认下线接口" : "确认上线接口"}
        description={
          pending
            ? pending.status === "online"
              ? `下线后客户将无法调用「${store.titleOf(pending)}」，确定继续吗？`
              : `上线后客户可调用「${store.titleOf(pending)}」，确定继续吗？`
            : ""
        }
        confirmText={pending?.status === "online" ? "下线" : "上线"}
        danger={pending?.status === "online"}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          const next: ApiOnlineStatus =
            pending.status === "online" ? "offline" : "online";
          store.setStatus(pending.id, next);
          setPending(null);
        }}
      />
    </>
  );
}
