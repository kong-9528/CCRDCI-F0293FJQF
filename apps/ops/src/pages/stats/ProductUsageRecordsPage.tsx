import { useMemo, useState } from "react";
import { AccountSearchSelect } from "@/components/AccountSearchSelect";
import { TableAction } from "@/components/TableAction";
import { IconEye } from "@/components/icons/UiIcons";
import { CertUsageDetailDrawer } from "@/components/usage/CertUsageDetailDrawer";
import { DciUsageDetailDrawer } from "@/components/usage/DciUsageDetailDrawer";
import { InfoUsageDetailDrawer } from "@/components/usage/InfoUsageDetailDrawer";
import { ReviewUsageDetailDrawer } from "@/components/usage/ReviewUsageDetailDrawer";
import {
  CERT_STATUS_LABEL,
  DCI_STATUS_LABEL,
  INFO_STATUS_LABEL,
  INFO_WORK_TYPE_LABEL,
  REVIEW_STATUS_LABEL,
  USAGE_DEFAULT_DAYS,
  USAGE_PAGE_SIZES,
  USAGE_PRODUCT_TAB_LABEL,
  defaultUsageDateRange,
  listCertUsageRecords,
  listDciUsageRecords,
  listInfoUsageRecords,
  listReviewUsageRecords,
  type CertUsageRecord,
  type DciUsageRecord,
  type InfoUsageRecord,
  type ReviewUsageRecord,
  type UsageProductTab,
} from "@/lib/usageRecordsStore";

type CommonFilters = {
  customerId: string;
  from: string;
  to: string;
};

type DciFilters = CommonFilters & {
  status: "" | "pass" | "fail";
  channel: "" | "WebUI" | "API";
  keyword: string;
};

type InfoFilters = CommonFilters & {
  status: "" | "pass" | "fail";
  channel: "" | "WebUI" | "API";
  keyword: string;
  workType: "" | "software" | "work" | "dataset";
};

type CertFilters = CommonFilters & {
  status: "" | "pass" | "fail";
  channel: "" | "WebUI" | "API";
};

type ReviewFilters = CommonFilters & {
  status: "" | "success" | "fail" | "reviewing";
  taskId: string;
};

function emptyCommon(): CommonFilters {
  const range = defaultUsageDateRange();
  return { customerId: "", from: range.from, to: range.to };
}

function dayOf(stamp: string) {
  return stamp.slice(0, 10);
}

export function ProductUsageRecordsPage() {
  const [tab, setTab] = useState<UsageProductTab>("dci");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof USAGE_PAGE_SIZES)[number]>(10);
  const [jump, setJump] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [dciDetail, setDciDetail] = useState<DciUsageRecord | null>(null);
  const [infoDetail, setInfoDetail] = useState<InfoUsageRecord | null>(null);
  const [certDetail, setCertDetail] = useState<CertUsageRecord | null>(null);
  const [reviewDetail, setReviewDetail] = useState<ReviewUsageRecord | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const [dciDraft, setDciDraft] = useState<DciFilters>({
    ...emptyCommon(),
    status: "",
    channel: "",
    keyword: "",
  });
  const [dciApplied, setDciApplied] = useState(dciDraft);

  const [infoDraft, setInfoDraft] = useState<InfoFilters>({
    ...emptyCommon(),
    status: "",
    channel: "",
    keyword: "",
    workType: "",
  });
  const [infoApplied, setInfoApplied] = useState(infoDraft);

  const [certDraft, setCertDraft] = useState<CertFilters>({
    ...emptyCommon(),
    status: "",
    channel: "",
  });
  const [certApplied, setCertApplied] = useState(certDraft);

  const [reviewDraft, setReviewDraft] = useState<ReviewFilters>({
    ...emptyCommon(),
    status: "",
    taskId: "",
  });
  const [reviewApplied, setReviewApplied] = useState(reviewDraft);

  const switchTab = (next: UsageProductTab) => {
    setTab(next);
    setPage(1);
    setJump("");
    setDciDetail(null);
    setInfoDetail(null);
    setCertDetail(null);
    setReviewDetail(null);
  };

  const dciRows = useMemo(() => {
    const f = dciApplied;
    const key = f.keyword.trim().toLowerCase();
    return listDciUsageRecords().filter((r) => {
      const day = dayOf(r.verifiedAt);
      if (f.customerId && r.customerId !== f.customerId) return false;
      if (f.from && day < f.from) return false;
      if (f.to && day > f.to) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.channel && r.channel !== f.channel) return false;
      if (
        key &&
        !r.dciCode.toLowerCase().includes(key) &&
        !r.queryOwner.toLowerCase().includes(key) &&
        !r.queryName.toLowerCase().includes(key)
      ) {
        return false;
      }
      return true;
    });
  }, [dciApplied]);

  const infoRows = useMemo(() => {
    const f = infoApplied;
    const key = f.keyword.trim().toLowerCase();
    return listInfoUsageRecords().filter((r) => {
      const day = dayOf(r.verifiedAt);
      if (f.customerId && r.customerId !== f.customerId) return false;
      if (f.from && day < f.from) return false;
      if (f.to && day > f.to) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.channel && r.channel !== f.channel) return false;
      if (f.workType && r.workType !== f.workType) return false;
      if (
        key &&
        !r.regNo.toLowerCase().includes(key) &&
        !r.owner.toLowerCase().includes(key) &&
        !r.name.toLowerCase().includes(key)
      ) {
        return false;
      }
      return true;
    });
  }, [infoApplied]);

  const certRows = useMemo(() => {
    const f = certApplied;
    return listCertUsageRecords().filter((r) => {
      const day = dayOf(r.verifiedAt);
      if (f.customerId && r.customerId !== f.customerId) return false;
      if (f.from && day < f.from) return false;
      if (f.to && day > f.to) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.channel && r.channel !== f.channel) return false;
      return true;
    });
  }, [certApplied]);

  const reviewRows = useMemo(() => {
    const f = reviewApplied;
    const tid = f.taskId.trim().toLowerCase();
    return listReviewUsageRecords().filter((r) => {
      const day = dayOf(r.submittedAt);
      if (f.customerId && r.customerId !== f.customerId) return false;
      if (f.from && day < f.from) return false;
      if (f.to && day > f.to) return false;
      if (f.status && r.status !== f.status) return false;
      if (tid && !r.taskId.toLowerCase().includes(tid)) return false;
      return true;
    });
  }, [reviewApplied]);

  const activeRows =
    tab === "dci"
      ? dciRows
      : tab === "info"
        ? infoRows
        : tab === "certificate"
          ? certRows
          : reviewRows;

  const totalPages = Math.max(1, Math.ceil(activeRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = activeRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const accountField = (
    value: string,
    onChange: (id: string) => void,
  ) => (
    <div className="a-field">
      <span className="a-field__label">客户账号</span>
      <div style={{ minWidth: 240 }}>
        <AccountSearchSelect value={value} onChange={onChange} />
      </div>
    </div>
  );

  const dateRangeFields = (
    from: string,
    to: string,
    setFrom: (v: string) => void,
    setTo: (v: string) => void,
    label = "时间范围",
  ) => (
    <div className="a-field">
      <span className="a-field__label">{label}</span>
      <div className="a-date-range">
        <input
          type="date"
          className="a-input"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <span>至</span>
        <input type="date" className="a-input" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
    </div>
  );

  return (
    <div className="a-card">
      <div className="a-tabs" role="tablist">
        {(Object.keys(USAGE_PRODUCT_TAB_LABEL) as UsageProductTab[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            className={`a-tabs__item${tab === key ? " is-active" : ""}`}
            onClick={() => switchTab(key)}
          >
            {USAGE_PRODUCT_TAB_LABEL[key]}
          </button>
        ))}
      </div>

      {tab === "dci" ? (
        <div className="a-toolbar">
          {accountField(dciDraft.customerId, (id) =>
            setDciDraft((p) => ({ ...p, customerId: id })),
          )}
          {dateRangeFields(
            dciDraft.from,
            dciDraft.to,
            (v) => setDciDraft((p) => ({ ...p, from: v })),
            (v) => setDciDraft((p) => ({ ...p, to: v })),
          )}
          <div className="a-field">
            <span className="a-field__label">结果</span>
            <select
              className="a-select"
              value={dciDraft.status}
              onChange={(e) =>
                setDciDraft((p) => ({
                  ...p,
                  status: e.target.value as DciFilters["status"],
                }))
              }
            >
              <option value="">全部</option>
              <option value="pass">核验通过</option>
              <option value="fail">核验不通过</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">方式</span>
            <select
              className="a-select"
              value={dciDraft.channel}
              onChange={(e) =>
                setDciDraft((p) => ({
                  ...p,
                  channel: e.target.value as DciFilters["channel"],
                }))
              }
            >
              <option value="">全部</option>
              <option value="WebUI">WebUI</option>
              <option value="API">API</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">关键词</span>
            <input
              className="a-input"
              placeholder="DCI码 / 著作权人 / 名称"
              value={dciDraft.keyword}
              onChange={(e) => setDciDraft((p) => ({ ...p, keyword: e.target.value }))}
            />
          </div>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => {
              setDciApplied(dciDraft);
              setPage(1);
            }}
          >
            查询
          </button>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              const next: DciFilters = {
                ...emptyCommon(),
                status: "",
                channel: "",
                keyword: "",
              };
              setDciDraft(next);
              setDciApplied(next);
              setPage(1);
            }}
          >
            重置
          </button>
        </div>
      ) : null}

      {tab === "info" ? (
        <div className="a-toolbar">
          {accountField(infoDraft.customerId, (id) =>
            setInfoDraft((p) => ({ ...p, customerId: id })),
          )}
          {dateRangeFields(
            infoDraft.from,
            infoDraft.to,
            (v) => setInfoDraft((p) => ({ ...p, from: v })),
            (v) => setInfoDraft((p) => ({ ...p, to: v })),
          )}
          <div className="a-field">
            <span className="a-field__label">作品类型</span>
            <select
              className="a-select"
              value={infoDraft.workType}
              onChange={(e) =>
                setInfoDraft((p) => ({
                  ...p,
                  workType: e.target.value as InfoFilters["workType"],
                }))
              }
            >
              <option value="">全部</option>
              <option value="software">软件</option>
              <option value="work">作品</option>
              <option value="dataset">数据集</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">结果</span>
            <select
              className="a-select"
              value={infoDraft.status}
              onChange={(e) =>
                setInfoDraft((p) => ({
                  ...p,
                  status: e.target.value as InfoFilters["status"],
                }))
              }
            >
              <option value="">全部</option>
              <option value="pass">核验通过</option>
              <option value="fail">核验不通过</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">方式</span>
            <select
              className="a-select"
              value={infoDraft.channel}
              onChange={(e) =>
                setInfoDraft((p) => ({
                  ...p,
                  channel: e.target.value as InfoFilters["channel"],
                }))
              }
            >
              <option value="">全部</option>
              <option value="WebUI">WebUI</option>
              <option value="API">API</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">关键词</span>
            <input
              className="a-input"
              placeholder="登记号 / 著作权人 / 名称"
              value={infoDraft.keyword}
              onChange={(e) => setInfoDraft((p) => ({ ...p, keyword: e.target.value }))}
            />
          </div>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => {
              setInfoApplied(infoDraft);
              setPage(1);
            }}
          >
            查询
          </button>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              const next: InfoFilters = {
                ...emptyCommon(),
                status: "",
                channel: "",
                keyword: "",
                workType: "",
              };
              setInfoDraft(next);
              setInfoApplied(next);
              setPage(1);
            }}
          >
            重置
          </button>
        </div>
      ) : null}

      {tab === "certificate" ? (
        <div className="a-toolbar">
          {accountField(certDraft.customerId, (id) =>
            setCertDraft((p) => ({ ...p, customerId: id })),
          )}
          {dateRangeFields(
            certDraft.from,
            certDraft.to,
            (v) => setCertDraft((p) => ({ ...p, from: v })),
            (v) => setCertDraft((p) => ({ ...p, to: v })),
          )}
          <div className="a-field">
            <span className="a-field__label">结果</span>
            <select
              className="a-select"
              value={certDraft.status}
              onChange={(e) =>
                setCertDraft((p) => ({
                  ...p,
                  status: e.target.value as CertFilters["status"],
                }))
              }
            >
              <option value="">全部</option>
              <option value="pass">通过</option>
              <option value="fail">未通过</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">方式</span>
            <select
              className="a-select"
              value={certDraft.channel}
              onChange={(e) =>
                setCertDraft((p) => ({
                  ...p,
                  channel: e.target.value as CertFilters["channel"],
                }))
              }
            >
              <option value="">全部</option>
              <option value="WebUI">WebUI</option>
              <option value="API">API</option>
            </select>
          </div>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => {
              setCertApplied(certDraft);
              setPage(1);
            }}
          >
            查询
          </button>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              const next: CertFilters = { ...emptyCommon(), status: "", channel: "" };
              setCertDraft(next);
              setCertApplied(next);
              setPage(1);
            }}
          >
            重置
          </button>
        </div>
      ) : null}

      {tab === "workReview" ? (
        <div className="a-toolbar">
          {accountField(reviewDraft.customerId, (id) =>
            setReviewDraft((p) => ({ ...p, customerId: id })),
          )}
          {dateRangeFields(
            reviewDraft.from,
            reviewDraft.to,
            (v) => setReviewDraft((p) => ({ ...p, from: v })),
            (v) => setReviewDraft((p) => ({ ...p, to: v })),
            "提交时间",
          )}
          <div className="a-field">
            <span className="a-field__label">流水号</span>
            <input
              className="a-input"
              placeholder="请输入流水号"
              value={reviewDraft.taskId}
              onChange={(e) => setReviewDraft((p) => ({ ...p, taskId: e.target.value }))}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">状态</span>
            <select
              className="a-select"
              value={reviewDraft.status}
              onChange={(e) =>
                setReviewDraft((p) => ({
                  ...p,
                  status: e.target.value as ReviewFilters["status"],
                }))
              }
            >
              <option value="">全部</option>
              <option value="success">成功</option>
              <option value="fail">失败</option>
              <option value="reviewing">正在审核</option>
            </select>
          </div>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => {
              setReviewApplied(reviewDraft);
              setPage(1);
            }}
          >
            查询
          </button>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              const next: ReviewFilters = { ...emptyCommon(), status: "", taskId: "" };
              setReviewDraft(next);
              setReviewApplied(next);
              setPage(1);
            }}
          >
            重置
          </button>
        </div>
      ) : null}

      <div className="a-card__body a-card__body--flush">
        <table className="a-table">
          <thead>
            {tab === "dci" ? (
              <tr>
                <th>客户账号</th>
                <th>机构/企业名称</th>
                <th>核验时间</th>
                <th>DCI码</th>
                <th>软件/作品/数据集名称</th>
                <th>著作权人</th>
                <th>方式</th>
                <th>结果</th>
                <th>操作</th>
              </tr>
            ) : null}
            {tab === "info" ? (
              <tr>
                <th>客户账号</th>
                <th>机构/企业名称</th>
                <th>核验时间</th>
                <th>作品类型</th>
                <th>登记号</th>
                <th>名称</th>
                <th>著作权人</th>
                <th>方式</th>
                <th>结果</th>
                <th>操作</th>
              </tr>
            ) : null}
            {tab === "certificate" ? (
              <tr>
                <th>客户账号</th>
                <th>机构/企业名称</th>
                <th>核验时间</th>
                <th>证书文件</th>
                <th>方式</th>
                <th>结果</th>
                <th>操作</th>
              </tr>
            ) : null}
            {tab === "workReview" ? (
              <tr>
                <th>客户账号</th>
                <th>机构/企业名称</th>
                <th>提交时间</th>
                <th>流水号</th>
                <th>审核类型</th>
                <th>状态</th>
                <th>完成时间</th>
                <th>操作</th>
              </tr>
            ) : null}
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    tab === "dci" ? 9 : tab === "info" ? 10 : tab === "certificate" ? 7 : 8
                  }
                >
                  <div className="a-empty">
                    暂无使用记录
                    {USAGE_DEFAULT_DAYS ? `（默认近 ${USAGE_DEFAULT_DAYS} 天）` : ""}
                  </div>
                </td>
              </tr>
            ) : tab === "dci" ? (
              (pageRows as typeof dciRows).map((r) => (
                <tr key={r.id}>
                  <td>
                    <code style={{ fontFamily: "var(--font-mono)" }}>{r.account}</code>
                  </td>
                  <td>{r.companyName}</td>
                  <td>{r.verifiedAt}</td>
                  <td>
                    <code style={{ fontFamily: "var(--font-mono)" }}>{r.dciCode}</code>
                  </td>
                  <td>{r.queryName || "—"}</td>
                  <td>{r.queryOwner || "—"}</td>
                  <td>{r.channel}</td>
                  <td>
                    <span className={`a-tag${r.status === "pass" ? " a-tag--ok" : " a-tag--er"}`}>
                      {DCI_STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td>
                    <TableAction icon={<IconEye />} onClick={() => setDciDetail(r)}>
                      详情
                    </TableAction>
                  </td>
                </tr>
              ))
            ) : tab === "info" ? (
              (pageRows as typeof infoRows).map((r) => (
                <tr key={r.id}>
                  <td>
                    <code style={{ fontFamily: "var(--font-mono)" }}>{r.account}</code>
                  </td>
                  <td>{r.companyName}</td>
                  <td>{r.verifiedAt}</td>
                  <td>{INFO_WORK_TYPE_LABEL[r.workType]}</td>
                  <td>
                    <code style={{ fontFamily: "var(--font-mono)" }}>{r.regNo}</code>
                  </td>
                  <td>{r.name || "—"}</td>
                  <td>{r.owner || "—"}</td>
                  <td>{r.channel}</td>
                  <td>
                    <span className={`a-tag${r.status === "pass" ? " a-tag--ok" : " a-tag--er"}`}>
                      {INFO_STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td>
                    <TableAction icon={<IconEye />} onClick={() => setInfoDetail(r)}>
                      详情
                    </TableAction>
                  </td>
                </tr>
              ))
            ) : tab === "certificate" ? (
              (pageRows as typeof certRows).map((r) => (
                <tr key={r.id}>
                  <td>
                    <code style={{ fontFamily: "var(--font-mono)" }}>{r.account}</code>
                  </td>
                  <td>{r.companyName}</td>
                  <td>{r.verifiedAt}</td>
                  <td>{r.fileName}</td>
                  <td>{r.channel}</td>
                  <td>
                    <span className={`a-tag${r.status === "pass" ? " a-tag--ok" : " a-tag--er"}`}>
                      {CERT_STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td>
                    <TableAction icon={<IconEye />} onClick={() => setCertDetail(r)}>
                      详情
                    </TableAction>
                  </td>
                </tr>
              ))
            ) : (
              (pageRows as typeof reviewRows).map((r) => (
                <tr key={r.id}>
                  <td>
                    <code style={{ fontFamily: "var(--font-mono)" }}>{r.account}</code>
                  </td>
                  <td>{r.companyName}</td>
                  <td>{r.submittedAt}</td>
                  <td>
                    <code style={{ fontFamily: "var(--font-mono)" }}>{r.taskId}</code>
                  </td>
                  <td>{r.apiName}</td>
                  <td>
                    <span
                      className={`a-tag${
                        r.status === "success"
                          ? " a-tag--ok"
                          : r.status === "reviewing"
                            ? " a-tag--cyan"
                            : " a-tag--er"
                      }`}
                    >
                      {REVIEW_STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td>{r.finishedAt ?? "—"}</td>
                  <td>
                    <TableAction icon={<IconEye />} onClick={() => setReviewDetail(r)}>
                      {r.status === "reviewing" ? "查询结果" : "查看结果"}
                    </TableAction>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="a-list-footer">
        <div className="a-summary">
          当前筛选结果共 <b>{activeRows.length}</b> 条
        </div>
        <div className="a-pagination">
          <span>
            共 {activeRows.length} 条 · 第 {safePage}/{totalPages} 页
          </span>
          <select
            className="a-select"
            style={{ minWidth: 88 }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value) as (typeof USAGE_PAGE_SIZES)[number]);
              setPage(1);
            }}
          >
            {USAGE_PAGE_SIZES.map((n) => (
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

      <DciUsageDetailDrawer
        open={!!dciDetail}
        record={dciDetail}
        onClose={() => setDciDetail(null)}
        onToast={showToast}
      />
      <InfoUsageDetailDrawer
        open={!!infoDetail}
        record={infoDetail}
        onClose={() => setInfoDetail(null)}
        onToast={showToast}
      />
      <CertUsageDetailDrawer
        open={!!certDetail}
        record={certDetail}
        onClose={() => setCertDetail(null)}
        onToast={showToast}
      />
      <ReviewUsageDetailDrawer
        open={!!reviewDetail}
        record={reviewDetail}
        onClose={() => setReviewDetail(null)}
        onToast={showToast}
      />
      {toast ? <div className="a-toast">{toast}</div> : null}
    </div>
  );
}
