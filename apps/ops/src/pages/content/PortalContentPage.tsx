import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  AUDIT_PRODUCT_KEY_LABEL,
  AUDIT_PRODUCT_KEYS,
  HERO_VARIANT_LABEL,
  HERO_VARIANTS,
  PORTAL_TAB_LABEL,
  VERIFY_PRODUCT_KEY_LABEL,
  VERIFY_PRODUCT_KEYS,
  VISIBILITY_LABEL,
  usePortalContentStore,
  type HeroTheme,
  type HeroVariant,
  type PortalContentTab,
  type ShowcaseSectionMeta,
  type ShowcaseTheme,
  type Visibility,
} from "@/lib/portalContentStore";

type HeroForm = {
  name: string;
  weight: string;
  variant: HeroVariant;
  tabLabel: string;
  title: string;
  highlight: string;
  lead: string;
};

type ShowcaseForm = {
  productKey: string;
  title: string;
  desc: string;
  weight: string;
};

const EMPTY_HERO: HeroForm = {
  name: "",
  weight: "10",
  variant: "trust",
  tabLabel: "",
  title: "",
  highlight: "",
  lead: "",
};

const EMPTY_SHOWCASE: ShowcaseForm = {
  productKey: "",
  title: "",
  desc: "",
  weight: "10",
};

export function PortalContentPage() {
  const store = usePortalContentStore();
  const [tab, setTab] = useState<PortalContentTab>("hero");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <>
      <div className="a-card">
        <div className="a-tabs a-tabs--segment" role="tablist">
          {(Object.keys(PORTAL_TAB_LABEL) as PortalContentTab[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`a-tabs__item${tab === key ? " is-active" : ""}`}
              onClick={() => setTab(key)}
            >
              {PORTAL_TAB_LABEL[key]}
            </button>
          ))}
        </div>

        {tab === "hero" ? (
          <HeroPanel store={store} onToast={showToast} />
        ) : (
          <ShowcasePanel
            kind={tab}
            meta={tab === "verify" ? store.verifyMeta : store.auditMeta}
            themes={tab === "verify" ? store.verifyThemes : store.auditThemes}
            store={store}
            onToast={showToast}
          />
        )}
      </div>

      {toast ? <div className="a-toast">{toast}</div> : null}
    </>
  );
}

function HeroPanel({
  store,
  onToast,
}: {
  store: ReturnType<typeof usePortalContentStore>;
  onToast: (msg: string) => void;
}) {
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<HeroTheme | null>(null);
  const [form, setForm] = useState<HeroForm>(EMPTY_HERO);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<HeroTheme | null>(null);
  const [confirmVis, setConfirmVis] = useState<HeroTheme | null>(null);

  const visibleCount = useMemo(
    () => store.heroThemes.filter((t) => t.status === "visible").length,
    [store.heroThemes],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_HERO);
    setError(null);
    setDialog("create");
  };

  const openEdit = (row: HeroTheme) => {
    setEditing(row);
    setForm({
      name: row.name,
      weight: String(row.weight),
      variant: row.variant,
      tabLabel: row.tabLabel,
      title: row.title,
      highlight: row.highlight,
      lead: row.lead,
    });
    setError(null);
    setDialog("edit");
  };

  const submit = () => {
    if (!form.name.trim()) {
      setError("请填写主题名称");
      return;
    }
    if (!form.title.trim()) {
      setError("请填写主标题");
      return;
    }
    if (!form.highlight.trim()) {
      setError("请填写高亮副标题");
      return;
    }
    if (!form.lead.trim()) {
      setError("请填写导语");
      return;
    }
    const weight = Number(form.weight);
    if (!Number.isInteger(weight) || weight < 0) {
      setError("排序权重须为非负整数");
      return;
    }
    const payload = {
      name: form.name,
      weight,
      variant: form.variant,
      tabLabel: form.tabLabel,
      title: form.title,
      highlight: form.highlight,
      lead: form.lead,
    };
    if (dialog === "create") store.createHeroTheme(payload);
    else if (editing) {
      const err = store.updateHeroTheme(editing.id, payload);
      if (err) {
        setError(err);
        return;
      }
    }
    setDialog(null);
  };

  return (
    <>
      <div className="a-toolbar">
        <button type="button" className="a-btn a-btn--primary" onClick={openCreate}>
          新增主题
        </button>
        <div className="a-field__hint" style={{ margin: 0 }}>
          对应门户首页焦点区轮播。右侧为内置插画（按视觉变体切换），无需上传背景图。至少保留{" "}
          <b>1</b> 个「展示中」主题（当前 {visibleCount} 个）。
        </div>
      </div>

      <div className="a-card__body a-card__body--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th style={{ width: 72 }}>权重</th>
              <th>主题名称</th>
              <th style={{ width: 100 }}>视觉变体</th>
              <th>主标题 / 高亮</th>
              <th style={{ width: 100 }}>Tab 文案</th>
              <th style={{ width: 88 }}>状态</th>
              <th style={{ width: 150 }}>更新时间</th>
              <th style={{ width: 200 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {store.heroThemes.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="a-empty">暂无焦点主题</div>
                </td>
              </tr>
            ) : (
              store.heroThemes.map((row) => (
                <tr key={row.id}>
                  <td className="num">{row.weight}</td>
                  <td>{row.name}</td>
                  <td>{HERO_VARIANT_LABEL[row.variant]}</td>
                  <td>
                    <div className="a-cell-stack">
                      <span>{row.title}</span>
                      <span className="a-muted">{row.highlight}</span>
                    </div>
                  </td>
                  <td>{row.tabLabel || HERO_VARIANT_LABEL[row.variant]}</td>
                  <td>
                    <span
                      className={`a-tag ${
                        row.status === "visible" ? "a-tag--ok" : "a-tag--muted"
                      }`}
                    >
                      {row.status === "visible" ? "展示中" : VISIBILITY_LABEL[row.status]}
                    </span>
                  </td>
                  <td>{row.updatedAt}</td>
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

      {dialog ? (
        <div className="a-modal-backdrop" role="presentation" onClick={() => setDialog(null)}>
          <div
            className="a-modal a-modal--lg"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">
              {dialog === "create" ? "新增焦点主题" : "编辑焦点主题"}
            </h3>
            <p className="a-modal__desc">
              对齐门户首屏：主标题 → 高亮副标题（渐变行）→ 导语；视觉变体决定右侧插画与默认 Tab 文案。
            </p>
            <div className="a-form a-form--stack">
              <div className="a-field">
                <span className="a-field__label">
                  主题名称 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  placeholder="仅运营后台展示，如「信任主张」"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  排序权重 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.weight}
                  onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                />
                <div className="a-field__hint">数值越小，轮播中越靠前</div>
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  视觉变体 <span className="a-req">*</span>
                </span>
                <select
                  className="a-select"
                  value={form.variant}
                  onChange={(e) => {
                    const variant = e.target.value as HeroVariant;
                    setForm((p) => ({
                      ...p,
                      variant,
                      tabLabel: p.tabLabel || HERO_VARIANT_LABEL[variant],
                    }));
                  }}
                >
                  {HERO_VARIANTS.map((v) => (
                    <option key={v} value={v}>
                      {HERO_VARIANT_LABEL[v]}（{v}）
                    </option>
                  ))}
                </select>
                <div className="a-field__hint">对应门户右侧插画：trust / verify / audit</div>
              </div>
              <div className="a-field">
                <span className="a-field__label">轮播 Tab 文案</span>
                <input
                  className="a-input"
                  placeholder={`默认：${HERO_VARIANT_LABEL[form.variant]}`}
                  value={form.tabLabel}
                  onChange={(e) => setForm((p) => ({ ...p, tabLabel: e.target.value }))}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  主标题 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  placeholder="h1 第一行"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  高亮副标题 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  placeholder="h1 第二行（渐变强调）"
                  value={form.highlight}
                  onChange={(e) => setForm((p) => ({ ...p, highlight: e.target.value }))}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  导语 <span className="a-req">*</span>
                </span>
                <textarea
                  className="a-textarea"
                  rows={3}
                  placeholder="主标题下方说明文案"
                  value={form.lead}
                  onChange={(e) => setForm((p) => ({ ...p, lead: e.target.value }))}
                />
              </div>
              {error ? <div className="a-form-error">{error}</div> : null}
            </div>
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
        title="确认删除主题"
        description={
          confirmDelete
            ? `确定删除焦点主题「${confirmDelete.name}」吗？删除后不可恢复。`
            : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const err = store.deleteHeroTheme(confirmDelete.id);
          setConfirmDelete(null);
          if (err) onToast(err);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmVis)}
        title={confirmVis?.status === "visible" ? "确认隐藏主题" : "确认展示主题"}
        description={
          confirmVis?.status === "visible"
            ? `隐藏后该主题将不再出现在门户焦点轮播中。确定隐藏「${confirmVis.name}」吗？`
            : `确定将「${confirmVis?.name ?? ""}」设为展示中吗？`
        }
        confirmText={confirmVis?.status === "visible" ? "隐藏" : "显示"}
        danger={confirmVis?.status === "visible"}
        onCancel={() => setConfirmVis(null)}
        onConfirm={() => {
          if (!confirmVis) return;
          const next: Visibility = confirmVis.status === "visible" ? "hidden" : "visible";
          const err = store.setHeroThemeVisibility(confirmVis.id, next);
          setConfirmVis(null);
          if (err) onToast(err);
        }}
      />
    </>
  );
}

function ShowcasePanel({
  kind,
  meta,
  themes,
  store,
  onToast,
}: {
  kind: "verify" | "audit";
  meta: ShowcaseSectionMeta;
  themes: ShowcaseTheme[];
  store: ReturnType<typeof usePortalContentStore>;
  onToast: (msg: string) => void;
}) {
  const [section, setSection] = useState(meta);
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ShowcaseTheme | null>(null);
  const [form, setForm] = useState<ShowcaseForm>(EMPTY_SHOWCASE);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ShowcaseTheme | null>(null);
  const [confirmVis, setConfirmVis] = useState<ShowcaseTheme | null>(null);

  const visibleCount = themes.filter((t) => t.status === "visible").length;
  const productKeys = kind === "verify" ? VERIFY_PRODUCT_KEYS : AUDIT_PRODUCT_KEYS;

  const labelOf = (key: string) => {
    if (kind === "verify") {
      return VERIFY_PRODUCT_KEY_LABEL[key as keyof typeof VERIFY_PRODUCT_KEY_LABEL] ?? key;
    }
    return AUDIT_PRODUCT_KEY_LABEL[key as keyof typeof AUDIT_PRODUCT_KEY_LABEL] ?? key;
  };

  useEffect(() => {
    setSection(meta);
  }, [kind, meta.heading, meta.lead]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...EMPTY_SHOWCASE,
      productKey: productKeys[0],
    });
    setError(null);
    setDialog("create");
  };

  const openEdit = (row: ShowcaseTheme) => {
    setEditing(row);
    setForm({
      productKey: row.productKey,
      title: row.title,
      desc: row.desc,
      weight: String(row.weight),
    });
    setError(null);
    setDialog("edit");
  };

  const saveSection = () => {
    if (!section.heading.trim()) {
      onToast("请填写板块标题");
      return;
    }
    if (!section.lead.trim()) {
      onToast("请填写板块导语");
      return;
    }
    if (kind === "verify") store.updateVerifyMeta(section);
    else store.updateAuditMeta(section);
    onToast("板块信息已保存");
  };

  const submit = () => {
    if (!form.productKey.trim()) {
      setError("请选择产品视觉");
      return;
    }
    if (!form.title.trim()) {
      setError("请填写产品标题");
      return;
    }
    if (!form.desc.trim()) {
      setError("请填写产品描述");
      return;
    }
    const weight = Number(form.weight);
    if (!Number.isInteger(weight) || weight < 0) {
      setError("排序权重须为非负整数");
      return;
    }
    const payload = {
      productKey: form.productKey,
      title: form.title,
      desc: form.desc,
      weight,
    };
    if (dialog === "create") {
      if (kind === "verify") store.addVerifyTheme(payload);
      else store.addAuditTheme(payload);
    } else if (editing) {
      const err =
        kind === "verify"
          ? store.updateVerifyTheme(editing.id, payload)
          : store.updateAuditTheme(editing.id, payload);
      if (err) {
        setError(err);
        return;
      }
    }
    setDialog(null);
  };

  return (
    <>
      <div className="a-portal-section-meta">
        <div className="a-form a-form--stack" style={{ flex: 1 }}>
          <div className="a-field">
            <span className="a-field__label">板块标题</span>
            <input
              className="a-input"
              value={section.heading}
              onChange={(e) => setSection((p) => ({ ...p, heading: e.target.value }))}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">板块导语</span>
            <textarea
              className="a-textarea"
              rows={2}
              value={section.lead}
              onChange={(e) => setSection((p) => ({ ...p, lead: e.target.value }))}
            />
            <div className="a-field__hint">对应门户首页板块标题下方的说明文案</div>
          </div>
        </div>
        <button type="button" className="a-btn a-btn--sm" onClick={saveSection}>
          保存板块信息
        </button>
      </div>

      <div className="a-toolbar">
        <button type="button" className="a-btn a-btn--primary" onClick={openCreate}>
          新增产品
        </button>
        <div className="a-field__hint" style={{ margin: 0 }}>
          对应门户首页产品卡片。卡片配图由「产品视觉」内置插画决定，无需上传。至少保留{" "}
          <b>1</b> 个展示中产品（当前 {visibleCount} 个）。
        </div>
      </div>

      <div className="a-card__body a-card__body--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th style={{ width: 72 }}>权重</th>
              <th style={{ width: 120 }}>产品视觉</th>
              <th>产品标题</th>
              <th>描述</th>
              <th style={{ width: 88 }}>状态</th>
              <th style={{ width: 200 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {themes.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="a-empty">暂无产品</div>
                </td>
              </tr>
            ) : (
              themes.map((row) => (
                <tr key={row.id}>
                  <td className="num">{row.weight}</td>
                  <td>{labelOf(row.productKey)}</td>
                  <td>{row.title}</td>
                  <td className="a-cell-clamp a-cell-clamp--wide">{row.desc}</td>
                  <td>
                    <span
                      className={`a-tag ${
                        row.status === "visible" ? "a-tag--ok" : "a-tag--muted"
                      }`}
                    >
                      {row.status === "visible" ? "展示中" : VISIBILITY_LABEL[row.status]}
                    </span>
                  </td>
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

      {dialog ? (
        <div className="a-modal-backdrop" role="presentation" onClick={() => setDialog(null)}>
          <div
            className="a-modal a-modal--lg"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">
              {dialog === "create" ? "新增产品" : "编辑产品"}
            </h3>
            <p className="a-modal__desc">
              对齐门户产品展示卡片：产品视觉（内置插画）→ 标题 → 描述。
            </p>
            <div className="a-form a-form--stack">
              <div className="a-field">
                <span className="a-field__label">
                  产品视觉 <span className="a-req">*</span>
                </span>
                <select
                  className="a-select"
                  value={form.productKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setForm((p) => ({
                      ...p,
                      productKey: key,
                      title: p.title || labelOf(key),
                    }));
                  }}
                >
                  {productKeys.map((k) => (
                    <option key={k} value={k}>
                      {labelOf(k)}（{k}）
                    </option>
                  ))}
                </select>
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  产品标题 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  排序权重 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.weight}
                  onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  产品描述 <span className="a-req">*</span>
                </span>
                <textarea
                  className="a-textarea"
                  rows={4}
                  value={form.desc}
                  onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))}
                />
              </div>
              {error ? <div className="a-form-error">{error}</div> : null}
            </div>
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
        title="确认删除产品"
        description={
          confirmDelete ? `确定删除产品「${confirmDelete.title}」吗？删除后不可恢复。` : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const err =
            kind === "verify"
              ? store.deleteVerifyTheme(confirmDelete.id)
              : store.deleteAuditTheme(confirmDelete.id);
          setConfirmDelete(null);
          if (err) onToast(err);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmVis)}
        title={confirmVis?.status === "visible" ? "确认隐藏产品" : "确认展示产品"}
        description={
          confirmVis?.status === "visible"
            ? `隐藏后该产品将不再出现在门户首页。确定隐藏「${confirmVis.title}」吗？`
            : `确定将「${confirmVis?.title ?? ""}」设为展示中吗？`
        }
        confirmText={confirmVis?.status === "visible" ? "隐藏" : "显示"}
        danger={confirmVis?.status === "visible"}
        onCancel={() => setConfirmVis(null)}
        onConfirm={() => {
          if (!confirmVis) return;
          const next: Visibility = confirmVis.status === "visible" ? "hidden" : "visible";
          const err =
            kind === "verify"
              ? store.setVerifyThemeVisibility(confirmVis.id, next)
              : store.setAuditThemeVisibility(confirmVis.id, next);
          setConfirmVis(null);
          if (err) onToast(err);
        }}
      />
    </>
  );
}
