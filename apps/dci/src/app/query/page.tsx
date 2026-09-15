"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { QUERY_EXAMPLE } from "@/lib/content";

type QueryResult = {
  dci: string;
  workName: string;
  owner: string;
  status: string;
};

export default function QueryPage() {
  const [dci, setDci] = useState("");
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const onSearch = () => {
    const code = dci.trim();
    const key = keyword.trim();
    if (!code && !key) {
      setError("请输入 DCI 码或著作权人/作品名称");
      setResult(null);
      return;
    }
    setError(null);
    if (code.toUpperCase().includes("RANTQZ") || key.includes("数字版权保护技术规范")) {
      setResult({
        dci: code || "DCI:RANTQZ010.156.2026070120989764467",
        workName: "数字版权保护技术规范",
        owner: "中国版权保护中心",
        status: "已申领",
      });
      showToast("查询成功");
      return;
    }
    setResult({
      dci: code || "—",
      workName: key || "—",
      owner: key || "—",
      status: "未查询到匹配记录（演示）",
    });
    showToast("已完成查询（演示）");
  };

  return (
    <div>
      {toast ? <div className="d-toast">{toast}</div> : null}
      <PageHero
        title="DCI查询"
        subtitle="输入 DCI 码和著作权人或作品信息，快速查询DCI申领状态及权属信息"
      >
        <div className="d-query-box">
          <input
            className="d-query-box__field"
            placeholder="请输入DCI"
            value={dci}
            onChange={(e) => setDci(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <input
            className="d-query-box__field"
            placeholder="请输入著作权人或作品名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <button type="button" className="d-btn d-btn--icon" aria-label="查询" onClick={onSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16.5 16.5L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="d-query-example">{QUERY_EXAMPLE}</p>
      </PageHero>

      <section className="d-section">
        <div className="d-container" style={{ maxWidth: 820 }}>
          {error ? (
            <div className="d-card d-card--pad" style={{ color: "var(--d-danger)" }}>
              {error}
            </div>
          ) : null}
          {result ? (
            <div className="d-card d-query-result">
              <div className="d-query-result__row">
                <span>DCI 码</span>
                <span>{result.dci}</span>
              </div>
              <div className="d-query-result__row">
                <span>作品名称</span>
                <span>{result.workName}</span>
              </div>
              <div className="d-query-result__row">
                <span>著作权人</span>
                <span>{result.owner}</span>
              </div>
              <div className="d-query-result__row">
                <span>申领状态</span>
                <span>{result.status}</span>
              </div>
            </div>
          ) : (
            <div className="d-card d-card--pad" style={{ color: "var(--d-muted)", textAlign: "center" }}>
              请输入查询条件后开始检索
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
