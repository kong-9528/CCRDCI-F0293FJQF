import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PORTAL_HOME_STATUS_LABEL,
  PORTAL_HOME_TEXT_LIMIT,
  PORTAL_HOME_TEXT_SLOTS,
  usePortalHomeStore,
} from "@/lib/portalHomeStore";

export function PortalHomeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = usePortalHomeStore();
  const numericId = Number(id);

  const item = useMemo(() => {
    if (!Number.isFinite(numericId)) return undefined;
    return store.getItem(numericId);
  }, [numericId, store]);

  const [texts, setTexts] = useState<string[]>(() =>
    Array.from({ length: PORTAL_HOME_TEXT_SLOTS }, () => ""),
  );
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!item) {
      setReady(true);
      return;
    }
    if (item.status === "published") {
      setReady(true);
      return;
    }
    setTexts(item.texts.slice(0, PORTAL_HOME_TEXT_SLOTS));
    setReady(true);
  }, [item]);

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
            <button type="button" className="a-btn" onClick={() => navigate("/content/home")}>
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
            <button type="button" className="a-btn" onClick={() => navigate("/content/home")}>
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const setTextAt = (index: number, value: string) => {
    setTexts((prev) => {
      const next = [...prev];
      next[index] = value.slice(0, PORTAL_HOME_TEXT_LIMIT);
      return next;
    });
  };

  const submit = () => {
    for (let i = 0; i < texts.length; i += 1) {
      if (texts[i].length > PORTAL_HOME_TEXT_LIMIT) {
        setError(`区域${i + 1}超过 ${PORTAL_HOME_TEXT_LIMIT} 字符上限`);
        return;
      }
    }
    const res = store.updateTexts(item.id, texts);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    navigate("/content/home");
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          门户内容编辑
          <div className="a-card__extra">
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate("/content/home")}>
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
                <span className="a-desc__value">
                  {PORTAL_HOME_STATUS_LABEL[item.status]}
                </span>
              </div>
            </div>
            <p className="a-field__hint" style={{ marginTop: 8 }}>
              保存后状态将变为草稿；发布后才对外展示。
            </p>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">区域内容配置</h3>
            <div className="a-form a-form--stack">
              {texts.map((text, index) => (
                <div key={index} className="a-field a-field--stack">
                  <span className="a-field__label">区域{index + 1}</span>
                  <textarea
                    className="a-textarea"
                    rows={4}
                    value={text}
                    maxLength={PORTAL_HOME_TEXT_LIMIT}
                    placeholder="请输入纯文本文案，支持多行"
                    onChange={(e) => setTextAt(index, e.target.value)}
                  />
                  <div className="a-field__hint">
                    {text.length}/{PORTAL_HOME_TEXT_LIMIT}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="a-form-actions">
            <button type="button" className="a-btn" onClick={() => navigate("/content/home")}>
              取消
            </button>
            <button type="button" className="a-btn a-btn--primary" onClick={submit}>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
