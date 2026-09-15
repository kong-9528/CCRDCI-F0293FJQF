"use client";

import { useEffect, useState } from "react";
import { SlideCaptchaModal } from "@/components/SlideCaptchaModal";
import { LOGO_BLUE } from "@/lib/content";
import {
  DCI_QUERY_EXAMPLE,
  consumeDailyQueryQuota,
  getDailyQueryQuota,
  searchDciRecords,
  type DciQueryRecord,
} from "@/lib/query";

export default function QueryPage() {
  const [dci, setDci] = useState("");
  const [keyword, setKeyword] = useState("");
  const [remain, setRemain] = useState(20);
  const [limit, setLimit] = useState(20);
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [results, setResults] = useState<DciQueryRecord[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const q = getDailyQueryQuota();
    setRemain(q.remain);
    setLimit(q.limit);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const requestSearch = () => {
    if (!dci.trim() || !keyword.trim()) {
      showToast("请输入DCI码和著作权人或作品名称");
      return;
    }
    if (remain <= 0) {
      showToast("当日查询次数已达上限！");
      return;
    }
    setCaptchaOpen(true);
  };

  const runSearch = () => {
    setCaptchaOpen(false);
    const quota = consumeDailyQueryQuota();
    setRemain(quota.remain);
    setLimit(quota.limit);
    if (!quota.ok) {
      showToast(quota.message || "当日查询次数已达上限！");
      return;
    }
    const matched = searchDciRecords(dci, keyword);
    setResults(matched);
    if (matched.length > 0) showToast(`查询成功，找到 ${matched.length} 条结果`);
    else showToast("未找到匹配的记录");
  };

  const copyDci = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast("DCI码已复制");
    } catch {
      showToast("复制失败，请手动选择复制");
    }
  };

  return (
    <div className="d-query-page">
      {toast ? <div className="d-toast">{toast}</div> : null}

      <section className="d-query-hero">
        <div className="d-query-hero__bg" aria-hidden />
        <div className="d-query-hero__matrix" aria-hidden />
        <div className="d-container d-query-hero__content">
          <h1>DCI查询</h1>
          <p>输入 DCI 码和著作权人或作品信息，快速查询DCI申领状态及权属信息</p>
        </div>
      </section>

      <section className="d-query-panel-wrap">
        <div className="d-container">
          <div className="d-query-panel">
            <div className="d-query-box">
              <input
                className="d-query-box__field"
                placeholder="请输入 DCI 码（必填）"
                value={dci}
                onChange={(e) => setDci(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && requestSearch()}
              />
              <span className="d-query-box__divider" aria-hidden />
              <input
                className="d-query-box__field d-query-box__field--wide"
                placeholder="请输入著作权人或作品名称（必填）"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && requestSearch()}
              />
              <button
                type="button"
                className="d-query-box__btn"
                aria-label="查询"
                onClick={requestSearch}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16.5 16.5L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="d-query-meta">
              <p className="d-query-meta__example">{DCI_QUERY_EXAMPLE}</p>
              <p className="d-query-meta__quota">
                今日剩余查询次数：
                <strong>
                  {remain} / {limit}
                </strong>{" "}
                次
              </p>
            </div>
          </div>
        </div>
      </section>

      {results !== null ? (
        <section className="d-query-results">
          <div className="d-container">
            <h2 className="d-query-results__title">查询结果</h2>
            {results.length === 0 ? (
              <div className="d-query-empty">
                <p>未找到匹配的记录，请调整查询条件后重试</p>
              </div>
            ) : (
              <div className="d-query-result-list">
                {results.map((row) => (
                  <article key={row.id} className="d-query-result-card">
                    <header className="d-query-result-card__head">
                      <img src={LOGO_BLUE} alt="" className="d-query-result-card__logo" />
                      <code className="d-query-result-card__code">{row.id}</code>
                      <button
                        type="button"
                        className="d-query-result-card__copy"
                        onClick={() => copyDci(row.id)}
                      >
                        复制
                      </button>
                      {row.status === "已撤销" ? (
                        <span className="d-query-result-card__badge">已撤销</span>
                      ) : null}
                    </header>
                    <div className="d-query-result-card__body">
                      <div className="d-query-result-card__row d-query-result-card__row--full">
                        <span>作品名称：</span>
                        <strong>{row.title}</strong>
                      </div>
                      <div className="d-query-result-card__grid">
                        <div>
                          <span>作品类型：</span>
                          {row.type}
                        </div>
                        <div>
                          <span>DCI分配日期：</span>
                          {row.date}
                        </div>
                      </div>
                      <div className="d-query-result-card__grid">
                        <div>
                          <span>著作权人：</span>
                          {row.holder}
                        </div>
                        <div>
                          <span>DCI注册中心：</span>
                          {row.center}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      <SlideCaptchaModal
        open={captchaOpen}
        onClose={() => setCaptchaOpen(false)}
        onSuccess={runSearch}
      />
    </div>
  );
}
