import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  VISIBILITY_LABEL,
  useContentStore,
  type HelpFaq,
} from "@/lib/contentStore";

type Filters = { keyword: string; status: string };
type FormState = { question: string; answer: string; weight: string };

const EMPTY_FILTERS: Filters = { keyword: "", status: "" };
const EMPTY_FORM: FormState = { question: "", answer: "", weight: "10" };

export function FaqManagePage() {
  const store = useContentStore();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<HelpFaq | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<HelpFaq | null>(null);
  const [confirmVis, setConfirmVis] = useState<HelpFaq | null>(null);

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase();
    return store.faqs
      .filter((f) => {
        if (applied.status && f.status !== applied.status) return false;
        if (kw) {
          const hit =
            f.question.toLowerCase().includes(kw) || f.answer.toLowerCase().includes(kw);
          if (!hit) return false;
        }
        return true;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [store.faqs, applied]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDialog("create");
  };

  const openEdit = (row: HelpFaq) => {
    setEditing(row);
    setForm({
      question: row.question,
      answer: row.answer,
      weight: String(row.weight),
    });
    setError(null);
    setDialog("edit");
  };

  const submit = () => {
    if (!form.question.trim()) {
      setError("请填写提问");
      return;
    }
    if (!form.answer.trim()) {
      setError("请填写回答");
      return;
    }
    const weight = Number(form.weight);
    if (!Number.isInteger(weight) || weight < 0) {
      setError("排序权重须为非负整数");
      return;
    }
    const payload = {
      question: form.question,
      answer: form.answer,
      weight,
    };
    if (dialog === "create") store.createFaq(payload);
    else if (editing) store.updateFaq(editing.id, payload);
    setDialog(null);
  };

  return (
    <>
      <div className="a-card">
        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">内容</span>
            <input
              className="a-input"
              style={{ minWidth: 240 }}
              placeholder="请输入提问和回答中的关键词"
              value={draft.keyword}
              onChange={(e) => setDraft((p) => ({ ...p, keyword: e.target.value }))}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">状态</span>
            <select
              className="a-select"
              value={draft.status}
              onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">请选择状态</option>
              <option value="visible">显示</option>
              <option value="hidden">隐藏</option>
            </select>
          </div>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              setDraft(EMPTY_FILTERS);
              setApplied(EMPTY_FILTERS);
            }}
          >
            重置
          </button>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => setApplied({ ...draft })}
          >
            查询
          </button>
          <button type="button" className="a-btn a-btn--primary" onClick={openCreate}>
            新增问答
          </button>
        </div>

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>问题标题</th>
                <th>问题答案</th>
                <th>排序权重</th>
                <th>状态</th>
                <th>更新时间</th>
                <th>维护人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="a-empty">暂无问答</div>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td>{row.question}</td>
                    <td>
                      <div className="a-cell-clamp" title={row.answer}>
                        {row.answer}
                      </div>
                    </td>
                    <td className="num">{row.weight}</td>
                    <td>
                      <span
                        className={`a-tag ${
                          row.status === "visible" ? "a-tag--ok" : "a-tag--muted"
                        }`}
                      >
                        {VISIBILITY_LABEL[row.status]}
                      </span>
                    </td>
                    <td>{row.updatedAt}</td>
                    <td>{row.maintainer}</td>
                    <td>
                      <div className="a-actions">
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
                          onClick={() => openEdit(row)}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
                          onClick={() => setConfirmVis(row)}
                        >
                          {row.status === "visible" ? "隐藏" : "显示"}
                        </button>
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
                          onClick={() => setConfirmDelete(row)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {dialog ? (
        <div className="a-modal-backdrop" role="presentation" onClick={() => setDialog(null)}>
          <div
            className="a-modal a-modal--md"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">
              {dialog === "create" ? "新增问答" : "编辑问答"}
            </h3>
            {dialog === "create" ? (
              <p className="a-modal__desc">新增问答默认为隐藏，需手动「显示」后才会在前端展示。</p>
            ) : null}
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  提问 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.question}
                  onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  回答 <span className="a-req">*</span>
                </span>
                <textarea
                  className="a-textarea"
                  rows={5}
                  value={form.answer}
                  onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">排序权重</span>
                <input
                  className="a-input"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, weight: e.target.value.replace(/\D/g, "") }))
                  }
                />
              </div>
            </div>
            {error ? <div className="a-form-error">{error}</div> : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setDialog(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={submit}>
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="确认删除问答"
        description={
          confirmDelete
            ? `删除后后台不再展示，前端亦不可见（软删除）。确定删除「${confirmDelete.question}」吗？`
            : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          store.softDeleteFaq(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmVis)}
        title={confirmVis?.status === "visible" ? "确认隐藏问答" : "确认显示问答"}
        description={
          confirmVis
            ? confirmVis.status === "visible"
              ? `隐藏后前端帮助中心将不再展示该问答。确定隐藏「${confirmVis.question}」吗？`
              : `显示后该问答将对前端用户可见。确定显示「${confirmVis.question}」吗？`
            : ""
        }
        confirmText={confirmVis?.status === "visible" ? "隐藏" : "显示"}
        danger={confirmVis?.status === "visible"}
        onCancel={() => setConfirmVis(null)}
        onConfirm={() => {
          if (!confirmVis) return;
          store.setFaqVisibility(
            confirmVis.id,
            confirmVis.status === "visible" ? "hidden" : "visible",
          );
          setConfirmVis(null);
        }}
      />
    </>
  );
}
