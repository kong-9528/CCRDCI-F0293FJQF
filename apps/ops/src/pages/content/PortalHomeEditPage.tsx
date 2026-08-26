import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  PORTAL_HOME_REGION_MAX,
  PORTAL_HOME_REGION_MIN,
  PORTAL_HOME_STATUS_LABEL,
  PORTAL_HOME_TEXT_LIMIT,
  activeRegions,
  allocRegionId,
  getPortalHomeItem,
  usePortalHomeStore,
  type PortalHomeRegion,
} from "@/lib/portalHomeStore";

function goBack(navigate: ReturnType<typeof useNavigate>) {
  navigate("/content/home");
}

export function PortalHomeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = usePortalHomeStore();
  const numericId = Number(id);

  const item = Number.isFinite(numericId) ? store.getItem(numericId) : undefined;

  const [regions, setRegions] = useState<PortalHomeRegion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  // 仅在配置 id 变化时加载，避免 store 重渲染把本地编辑状态冲掉
  useEffect(() => {
    const source = Number.isFinite(numericId) ? getPortalHomeItem(numericId) : undefined;
    if (!source) {
      setRegions([]);
      setReady(true);
      return;
    }
    if (source.status === "published") {
      setRegions([]);
      setReady(true);
      return;
    }
    const active = activeRegions(source.regions);
    setRegions(active.length > 0 ? active.map((r) => ({ ...r })) : [{ id: allocRegionId(), content: "", removed: false }]);
    setReady(true);
  }, [numericId]);

  if (!ready) {
    return (
      <div className="a-card">
        <div className="a-card__head">门户内容编辑</div>
        <div className="a-card__body">
          <div className="a-empty">加载中…</div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="a-card">
        <div className="a-card__head">门户内容编辑</div>
        <div className="a-card__body">
          <div className="a-empty">配置项不存在</div>
          <div className="a-form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="a-btn" onClick={() => goBack(navigate)}>
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (item.status === "published") {
    return (
      <div className="a-card">
        <div className="a-card__head">门户内容编辑</div>
        <div className="a-card__body">
          <div className="a-empty">已发布内容不可直接编辑，请先撤回后再编辑。</div>
          <div className="a-form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="a-btn" onClick={() => goBack(navigate)}>
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const setContentAt = (index: number, value: string) => {
    setRegions((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, content: value.slice(0, PORTAL_HOME_TEXT_LIMIT) } : r,
      ),
    );
    setError(null);
  };

  const addRegion = () => {
    setRegions((prev) => {
      if (prev.length >= PORTAL_HOME_REGION_MAX) return prev;
      return [...prev, { id: allocRegionId(), content: "", removed: false }];
    });
    setError(null);
  };

  const confirmRemoveRegion = () => {
    if (removeIndex === null) return;
    setRegions((prev) => {
      if (prev.length <= PORTAL_HOME_REGION_MIN) return prev;
      return prev.filter((_, i) => i !== removeIndex);
    });
    setRemoveIndex(null);
    setError(null);
  };

  const submit = () => {
    if (regions.length < PORTAL_HOME_REGION_MIN) {
      setError(`至少保留 ${PORTAL_HOME_REGION_MIN} 个区域`);
      return;
    }
    if (regions.length > PORTAL_HOME_REGION_MAX) {
      setError(`最多配置 ${PORTAL_HOME_REGION_MAX} 个区域`);
      return;
    }
    for (let i = 0; i < regions.length; i += 1) {
      if (regions[i].content.length > PORTAL_HOME_TEXT_LIMIT) {
        setError(`区域${i + 1}超过 ${PORTAL_HOME_TEXT_LIMIT} 字符上限`);
        return;
      }
    }
    const res = store.updateRegions(item.id, regions);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    goBack(navigate);
  };

  const canAdd = regions.length < PORTAL_HOME_REGION_MAX;
  const canRemove = regions.length > PORTAL_HOME_REGION_MIN;
  const removingLabel =
    removeIndex !== null ? `区域${removeIndex + 1}` : "该区域";

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          门户内容编辑
          <div className="a-card__extra">
            <button type="button" className="a-btn a-btn--sm" onClick={() => goBack(navigate)}>
              返回
            </button>
          </div>
        </div>
        <div className="a-card__body a-stack">
          <section className="a-form-section">
            <h3 className="a-form-section__title">基础信息</h3>
            <div className="a-desc">
              <div className="a-desc__item">
                <span className="a-desc__label">配置 ID</span>
                <span className="a-desc__value">{item.id}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">模块</span>
                <span className="a-desc__value">{item.moduleLabel}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">栏目</span>
                <span className="a-desc__value">{item.columnLabel}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">当前状态</span>
                <span className="a-desc__value">{PORTAL_HOME_STATUS_LABEL[item.status]}</span>
              </div>
            </div>
            <p className="a-field__hint" style={{ marginTop: 8 }}>
              保存后状态将变为草稿；发布后才对外展示。区域数据按配置 ID 关联存储，支持随时新增与移除。
            </p>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">区域内容配置</h3>
            <p className="a-field__hint" style={{ marginBottom: 12 }}>
              可新增或移除区域（{PORTAL_HOME_REGION_MIN}–{PORTAL_HOME_REGION_MAX}{" "}
              个），不支持调整区域顺序。移除后需保存才会生效。
            </p>
            <div className="a-form a-form--stack a-portal-region-list">
              {regions.map((region, index) => (
                <div key={region.id} className="a-field a-field--stack a-portal-region">
                  <div className="a-portal-region__head">
                    <span className="a-field__label">区域{index + 1}</span>
                    <button
                      type="button"
                      className="a-btn a-btn--text a-btn--sm a-btn--danger-link"
                      disabled={!canRemove}
                      onClick={() => setRemoveIndex(index)}
                    >
                      移除区域
                    </button>
                  </div>
                  <textarea
                    className="a-textarea"
                    rows={4}
                    value={region.content}
                    maxLength={PORTAL_HOME_TEXT_LIMIT}
                    placeholder="请输入纯文本文案，支持多行"
                    onChange={(e) => setContentAt(index, e.target.value)}
                  />
                  <div className="a-field__hint">
                    {region.content.length}/{PORTAL_HOME_TEXT_LIMIT}
                  </div>
                </div>
              ))}

              <div className="a-portal-region-add">
                <button
                  type="button"
                  className="a-btn a-btn--primary"
                  disabled={!canAdd}
                  onClick={addRegion}
                >
                  新增区域
                </button>
                {!canAdd ? (
                  <span className="a-field__hint">已达上限 {PORTAL_HOME_REGION_MAX} 个</span>
                ) : null}
              </div>
            </div>
          </section>

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="a-form-actions">
            <button type="button" className="a-btn" onClick={() => goBack(navigate)}>
              取消
            </button>
            <button type="button" className="a-btn a-btn--primary" onClick={submit}>
              保存
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={removeIndex !== null}
        title="确认移除区域"
        description={`确定要移除${removingLabel}吗？保存后该区域将从配置中删除（可再次新增）。`}
        confirmText="确认移除"
        danger
        onCancel={() => setRemoveIndex(null)}
        onConfirm={confirmRemoveRegion}
      />
    </div>
  );
}
