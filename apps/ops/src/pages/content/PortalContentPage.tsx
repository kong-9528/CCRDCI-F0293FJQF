import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  PORTAL_TAB_LABEL,
  VISIBILITY_LABEL,
  usePortalContentStore,
  type HeroTheme,
  type PortalContentTab,
  type ShowcaseSectionMeta,
  type ShowcaseTheme,
  type Visibility,
} from "@/lib/portalContentStore";

type HeroForm = {
  name: string;
  weight: string;
  imageUrl: string;
  imageName: string;
  eyebrow: string;
  title: string;
  highlight: string;
  lead: string;
};

type ShowcaseForm = {
  title: string;
  desc: string;
  visual: string;
  imageUrl: string;
  imageName: string;
  weight: string;
};

const EMPTY_HERO: HeroForm = {
  name: "",
  weight: "10",
  imageUrl: "",
  imageName: "",
  eyebrow: "",
  title: "",
  highlight: "",
  lead: "",
};

const EMPTY_SHOWCASE: ShowcaseForm = {
  title: "",
  desc: "",
  visual: "",
  imageUrl: "",
  imageName: "",
  weight: "10",
};

function readImageFile(file: File): Promise<{ url: string; name: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("请上传图片文件"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ url: String(reader.result), name: file.name });
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

function ImageThumb({ url, name }: { url: string; name: string }) {
  if (!url) {
    return <span className="a-img-thumb a-img-thumb--empty">未上传</span>;
  }
  return (
    <span className="a-img-thumb" title={name || "焦点图"}>
      <img src={url} alt="" />
    </span>
  );
}

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
      imageUrl: row.imageUrl,
      imageName: row.imageName,
      eyebrow: row.eyebrow,
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
    if (!form.eyebrow.trim()) {
      setError("请填写眉题（Eyebrow）");
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
      imageUrl: form.imageUrl,
      imageName: form.imageName,
      eyebrow: form.eyebrow,
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

  const onPickImage = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    try {
      const { url, name } = await readImageFile(file);
      setForm((p) => ({ ...p, imageUrl: url, imageName: name }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "图片上传失败");
    }
  };

  return (
    <>
      <div className="a-toolbar">
        <button type="button" className="a-btn a-btn--primary" onClick={openCreate}>
          新增主题
        </button>
        <div className="a-field__hint" style={{ margin: 0 }}>
          对应门户首页焦点区轮播。权重越小越靠前；至少保留{" "}
          <b>1</b> 个「展示中」主题（当前 {visibleCount} 个）。
        </div>
      </div>

      <div className="a-card__body a-card__body--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th style={{ width: 72 }}>权重</th>
              <th>主题名称</th>
              <th style={{ width: 88 }}>焦点图</th>
              <th>主标题 / 高亮</th>
              <th style={{ width: 88 }}>状态</th>
              <th style={{ width: 150 }}>更新时间</th>
              <th style={{ width: 200 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {store.heroThemes.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="a-empty">暂无焦点主题</div>
                </td>
              </tr>
            ) : (
              store.heroThemes.map((row) => (
                <tr key={row.id}>
                  <td className="num">{row.weight}</td>
                  <td>{row.name}</td>
                  <td>
                    <ImageThumb url={row.imageUrl} name={row.imageName} />
                  </td>
                  <td>
                    <div className="a-cell-stack">
                      <span>{row.title}</span>
                      <span className="a-muted">{row.highlight}</span>
                    </div>
                  </td>
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
              文案槽位对齐门户首屏：眉题 → 主标题 → 高亮副标题（渐变行）→ 导语；焦点图建议
              1920×1080 横图，作为主题背景使用。
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
                <span className="a-field__label">焦点图片</span>
                <div className="a-inline-actions">
                  <label className="a-btn a-btn--sm">
                    上传图片
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        void onPickImage(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {form.imageUrl ? (
                    <button
                      type="button"
                      className="a-btn a-btn--sm"
                      onClick={() => setForm((p) => ({ ...p, imageUrl: "", imageName: "" }))}
                    >
                      清除
                    </button>
                  ) : null}
                  <span className="a-muted">{form.imageName || "未选择文件"}</span>
                </div>
                {form.imageUrl ? (
                  <div className="a-img-preview">
                    <img src={form.imageUrl} alt="焦点图预览" />
                  </div>
                ) : null}
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  眉题 Eyebrow <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  placeholder="如 Copyright Infrastructure"
                  value={form.eyebrow}
                  onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  主标题 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  placeholder="h1 第一行（白色）"
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

  useEffect(() => {
    setSection(meta);
  }, [kind, meta.eyebrow, meta.heading]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_SHOWCASE);
    setError(null);
    setDialog("create");
  };

  const openEdit = (row: ShowcaseTheme) => {
    setEditing(row);
    setForm({
      title: row.title,
      desc: row.desc,
      visual: row.visual,
      imageUrl: row.imageUrl,
      imageName: row.imageName,
      weight: String(row.weight),
    });
    setError(null);
    setDialog("edit");
  };

  const saveSection = () => {
    if (!section.eyebrow.trim() || !section.heading.trim()) {
      onToast("请填写板块眉题与标题");
      return;
    }
    if (kind === "verify") store.updateVerifyMeta(section);
    else store.updateAuditMeta(section);
    onToast("板块信息已保存");
  };

  const submit = () => {
    if (!form.title.trim()) {
      setError("请填写主题标题");
      return;
    }
    if (!form.desc.trim()) {
      setError("请填写主题描述");
      return;
    }
    if (!form.visual.trim()) {
      setError("请填写视觉关键词");
      return;
    }
    const weight = Number(form.weight);
    if (!Number.isInteger(weight) || weight < 0) {
      setError("排序权重须为非负整数");
      return;
    }
    const payload = {
      title: form.title,
      desc: form.desc,
      visual: form.visual,
      imageUrl: form.imageUrl,
      imageName: form.imageName,
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

  const onPickImage = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    try {
      const { url, name } = await readImageFile(file);
      setForm((p) => ({ ...p, imageUrl: url, imageName: name }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "图片上传失败");
    }
  };

  return (
    <>
      <div className="a-portal-section-meta">
        <div className="a-form a-form--grid">
          <div className="a-field">
            <span className="a-field__label">板块眉题</span>
            <input
              className="a-input"
              value={section.eyebrow}
              onChange={(e) => setSection((p) => ({ ...p, eyebrow: e.target.value }))}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">板块标题</span>
            <input
              className="a-input"
              value={section.heading}
              onChange={(e) => setSection((p) => ({ ...p, heading: e.target.value }))}
            />
          </div>
        </div>
        <button type="button" className="a-btn a-btn--sm" onClick={saveSection}>
          保存板块信息
        </button>
      </div>

      <div className="a-toolbar">
        <button type="button" className="a-btn a-btn--primary" onClick={openCreate}>
          新增主题
        </button>
        <div className="a-field__hint" style={{ margin: 0 }}>
          对应门户首页产品展示轮播。权重越小越靠前；至少保留 <b>1</b> 个展示中主题（当前{" "}
          {visibleCount} 个）。
        </div>
      </div>

      <div className="a-card__body a-card__body--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th style={{ width: 72 }}>权重</th>
              <th>主题标题</th>
              <th>描述</th>
              <th>关键词</th>
              <th style={{ width: 88 }}>配图</th>
              <th style={{ width: 88 }}>状态</th>
              <th style={{ width: 200 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {themes.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="a-empty">暂无主题</div>
                </td>
              </tr>
            ) : (
              themes.map((row) => (
                <tr key={row.id}>
                  <td className="num">{row.weight}</td>
                  <td>{row.title}</td>
                  <td className="a-cell-clamp a-cell-clamp--wide">{row.desc}</td>
                  <td className="a-cell-clamp">{row.visual}</td>
                  <td>
                    <ImageThumb url={row.imageUrl} name={row.imageName} />
                  </td>
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
              {dialog === "create" ? "新增展示主题" : "编辑展示主题"}
            </h3>
            <p className="a-modal__desc">
              对齐门户产品展示区：标题、描述、关键词（用「 · 」分隔）及可选配图。
            </p>
            <div className="a-form a-form--stack">
              <div className="a-field">
                <span className="a-field__label">
                  主题标题 <span className="a-req">*</span>
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
                  主题描述 <span className="a-req">*</span>
                </span>
                <textarea
                  className="a-textarea"
                  rows={3}
                  value={form.desc}
                  onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  视觉关键词 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  placeholder="如：登记状态 · 权利主体 · 登记编号"
                  value={form.visual}
                  onChange={(e) => setForm((p) => ({ ...p, visual: e.target.value }))}
                />
                <div className="a-field__hint">建议用「 · 」分隔，门户将展示为标签</div>
              </div>
              <div className="a-field">
                <span className="a-field__label">配图（可选）</span>
                <div className="a-inline-actions">
                  <label className="a-btn a-btn--sm">
                    上传图片
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        void onPickImage(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {form.imageUrl ? (
                    <button
                      type="button"
                      className="a-btn a-btn--sm"
                      onClick={() => setForm((p) => ({ ...p, imageUrl: "", imageName: "" }))}
                    >
                      清除
                    </button>
                  ) : null}
                  <span className="a-muted">{form.imageName || "未选择文件"}</span>
                </div>
                {form.imageUrl ? (
                  <div className="a-img-preview">
                    <img src={form.imageUrl} alt="配图预览" />
                  </div>
                ) : null}
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
          confirmDelete ? `确定删除主题「${confirmDelete.title}」吗？删除后不可恢复。` : ""
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
        title={confirmVis?.status === "visible" ? "确认隐藏主题" : "确认展示主题"}
        description={
          confirmVis?.status === "visible"
            ? `隐藏后该主题将不再出现在门户轮播中。确定隐藏「${confirmVis.title}」吗？`
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
