import { useMemo, useState } from "react";
import { Drawer } from "@/components/Drawer";
import { TableAction } from "@/components/TableAction";
import { IconAudit, IconEye, IconRevoke } from "@/components/icons/UiIcons";
import { useAuth } from "@/lib/auth";
import {
  ORDER_STATUS_LABEL,
  WORK_CATEGORIES,
  filterAuditTasks,
  getAuditTask,
  hasAuditFailure,
  manualPassTask,
  trafficLightOf,
  type AuditTask,
  type OrderStatus,
} from "@/lib/auditTasksStore";
import { RISK_LEVEL_LABEL } from "@/lib/sensitiveWordsStore";
import { useUnifyTick } from "@/lib/useUnifyTick";

const emptyFilter = {
  orderId: "",
  workName: "",
  workCategory: "",
  ownerName: "",
  submittedFrom: "",
  submittedTo: "",
  orderStatus: "",
};

export function AuditTasksPage() {
  const tick = useUnifyTick();
  const { session } = useAuth();
  const [draft, setDraft] = useState(emptyFilter);
  const [applied, setApplied] = useState(emptyFilter);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "review">("view");
  const [reviewNote, setReviewNote] = useState("");
  const [toast, setToast] = useState("");

  const rows = useMemo(() => filterAuditTasks(applied), [applied, tick]);
  const active = activeId ? getAuditTask(activeId) : null;

  const setFilter = <K extends keyof typeof emptyFilter>(key: K, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const openTask = (id: string, next: "view" | "review") => {
    setActiveId(id);
    setMode(next);
    setReviewNote("");
  };

  const onManualPass = () => {
    if (!activeId || !session) return;
    const err = manualPassTask(activeId, session.displayName, reviewNote);
    if (err) {
      setToast(err);
      return;
    }
    setToast("已标记为人工复核通过");
    setActiveId(null);
  };

  return (
    <>
      <div className="a-card">
        <div className="a-card__head">
          智能辅助审核任务列表
          <span className="a-card__extra a-muted">
            {/* 红：内容安全不通过；黄：查重/侵权不通过；绿：全过或人工复核通过 */}
          </span>
        </div>

        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">审核任务ID</span>
            <input
              className="a-input"
              placeholder="请输入"
              value={draft.orderId}
              onChange={(e) => setFilter("orderId", e.target.value)}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">作品名称</span>
            <input
              className="a-input"
              placeholder="请输入"
              value={draft.workName}
              onChange={(e) => setFilter("workName", e.target.value)}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">作品类型</span>
            <select
              className="a-select"
              value={draft.workCategory}
              onChange={(e) => setFilter("workCategory", e.target.value)}
              style={{ minWidth: 200 }}
            >
              <option value="">请选择</option>
              {WORK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">著作权人名称</span>
            <input
              className="a-input"
              placeholder="请输入"
              value={draft.ownerName}
              onChange={(e) => setFilter("ownerName", e.target.value)}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">提交时间</span>
            <div className="a-date-range">
              <input
                type="date"
                className="a-input"
                value={draft.submittedFrom}
                onChange={(e) => setFilter("submittedFrom", e.target.value)}
              />
              <span>至</span>
              <input
                type="date"
                className="a-input"
                value={draft.submittedTo}
                onChange={(e) => setFilter("submittedTo", e.target.value)}
              />
            </div>
          </div>
          <div className="a-field">
            <span className="a-field__label">状态</span>
            <select
              className="a-select"
              value={draft.orderStatus}
              onChange={(e) => setFilter("orderStatus", e.target.value)}
            >
              <option value="">请选择</option>
              {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((k) => (
                <option key={k} value={k}>
                  {ORDER_STATUS_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="a-btn a-btn--primary" onClick={() => setApplied({ ...draft })}>
            查询
          </button>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              setDraft(emptyFilter);
              setApplied(emptyFilter);
            }}
          >
            重置
          </button>
        </div>

        {toast ? <div className="a-muted" style={{ padding: "0 16px 8px" }}>{toast}</div> : null}

        <div className="a-card__body a-card__body--flush un-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>审核任务ID</th>
                <th>作品名称</th>
                <th>作品类型</th>
                <th>著作权人</th>
                <th>登记提交时间</th>
                <th>最后更新时间</th>
                <th>风险灯</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="a-empty">暂无任务</div>
                  </td>
                </tr>
              ) : (
                rows.map((t) => {
                  const light = trafficLightOf(t);
                  return (
                    <tr key={t.id}>
                      <td>
                        <code>{t.orderId}</code>
                      </td>
                      <td>{t.workName}</td>
                      <td>{t.workCategory}</td>
                      <td>{t.ownerName}</td>
                      <td>{t.submittedAt}</td>
                      <td>{t.updatedAt}</td>
                      <td>
                        <span
                          className={`un-light un-light--${light}`}
                          title={light === "red" ? "红" : light === "yellow" ? "黄" : "绿"}
                        />
                      </td>
                      <td>
                        {ORDER_STATUS_LABEL[t.orderStatus]}
                        {t.orderStatus === "audit_failed" ? (
                          <span className="a-muted" style={{ marginLeft: 4 }} title="审核未通过">
                            ⓘ
                          </span>
                        ) : null}
                      </td>
                      <td>
                        <div className="a-actions">
                          <TableAction icon={<IconEye />} onClick={() => openTask(t.id, "view")}>
                            查看
                          </TableAction>
                          {hasAuditFailure(t) ? (
                            <TableAction icon={<IconAudit />} onClick={() => openTask(t.id, "review")}>
                              人工复核
                            </TableAction>
                          ) : null}
                          {t.orderStatus === "dci_success" ? (
                            <TableAction
                              icon={<IconRevoke />}
                              onClick={() => setToast("撤销为演示操作，未联通真实 DCI 订单")}
                            >
                              撤销
                            </TableAction>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={!!active}
        title={mode === "review" ? "人工复核" : "任务详情"}
        onClose={() => setActiveId(null)}
        footer={
          mode === "review" && active && hasAuditFailure(active) ? (
            <>
              <button type="button" className="a-btn" onClick={() => setActiveId(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={onManualPass}>
                人工审核通过
              </button>
            </>
          ) : undefined
        }
      >
        {active ? (
          <TaskDetailBody
            task={active}
            mode={mode}
            reviewNote={reviewNote}
            setReviewNote={setReviewNote}
          />
        ) : null}
      </Drawer>
    </>
  );
}

function TaskDetailBody({
  task,
  mode,
  reviewNote,
  setReviewNote,
}: {
  task: AuditTask;
  mode: "view" | "review";
  reviewNote: string;
  setReviewNote: (v: string) => void;
}) {
  const light = trafficLightOf(task);
  return (
    <>
      <section className="un-detail-section">
        <h3>订单信息</h3>
        <dl className="un-kv">
          <dt>审核任务ID</dt>
          <dd>{task.orderId}</dd>
          <dt>作品名称</dt>
          <dd>{task.workName}</dd>
          <dt>作品类型</dt>
          <dd>{task.workCategory}</dd>
          <dt>著作权人</dt>
          <dd>
            {task.ownerName}（{task.ownerId}）
          </dd>
          <dt>风险灯</dt>
          <dd>
            <span className={`un-light un-light--${light}`} />{" "}
            {light === "red" ? "红" : light === "yellow" ? "黄" : "绿"}
          </dd>
          <dt>状态</dt>
          <dd>{ORDER_STATUS_LABEL[task.orderStatus]}</dd>
        </dl>
      </section>

      <section className="un-detail-section">
        <h3>提交材料</h3>
        <dl className="un-kv">
          <dt>作品描述</dt>
          <dd>{task.workDesc}</dd>
          <dt>证件/主体</dt>
          <dd>{task.materials.ownerIdNo}</dd>
          <dt>联系方式</dt>
          <dd>{task.materials.contact}</dd>
          <dt>备注</dt>
          <dd>{task.materials.extraNote || "—"}</dd>
          <dt>附件</dt>
          <dd>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {task.materials.files.map((f) => (
                <li key={f.name}>
                  {f.name}（{f.size}）
                </li>
              ))}
            </ul>
          </dd>
        </dl>
      </section>

      <section className="un-detail-section">
        <h3>审核结果</h3>
        <dl className="un-kv">
          <dt>内容安全审核</dt>
          <dd>
            {task.audits.contentSafety.result === "pass" ? "通过" : "不通过"}
            {task.audits.contentSafety.riskLevel
              ? ` · ${RISK_LEVEL_LABEL[task.audits.contentSafety.riskLevel]}`
              : ""}
            {task.audits.contentSafety.hits.length ? (
              <div className="a-muted" style={{ marginTop: 6 }}>
                命中：
                {task.audits.contentSafety.hits
                  .map((h) => `${h.word}(${RISK_LEVEL_LABEL[h.level]})`)
                  .join("、")}
              </div>
            ) : null}
          </dd>
          <dt>作品登记查重</dt>
          <dd>
            {task.audits.duplicateCheck.result === "pass" ? "通过" : "不通过"}
            <div className="a-muted" style={{ marginTop: 4 }}>{task.audits.duplicateCheck.detail}</div>
          </dd>
          <dt>疑似侵权审核</dt>
          <dd>
            {task.audits.infringement.result === "pass" ? "通过" : "不通过"}
            <div className="a-muted" style={{ marginTop: 4 }}>{task.audits.infringement.detail}</div>
          </dd>
        </dl>
      </section>

      {task.manualReview ? (
        <section className="un-detail-section">
          <h3>人工复核记录</h3>
          <dl className="un-kv">
            <dt>复核人</dt>
            <dd>{task.manualReview.passedBy}</dd>
            <dt>时间</dt>
            <dd>{task.manualReview.passedAt}</dd>
            <dt>意见</dt>
            <dd>{task.manualReview.note}</dd>
          </dl>
        </section>
      ) : null}

      {mode === "review" && hasAuditFailure(task) ? (
        <section className="un-detail-section">
          <h3>复核意见</h3>
          <textarea
            className="a-input"
            rows={8}
            style={{ width: "100%", minHeight: 160, resize: "vertical" }}
            placeholder="可选：填写人工通过说明"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
        </section>
      ) : null}
    </>
  );
}
