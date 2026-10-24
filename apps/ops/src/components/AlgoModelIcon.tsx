import type { AlgoModelId } from "@/lib/algoModelsStore";

/** 按模型语义匹配的装饰 SVG（与产品看板水印用法一致） */
export function AlgoModelIcon({
  id,
  className = "a-algo-card__glyph",
}: {
  id: AlgoModelId;
  className?: string;
}) {
  switch (id) {
    case "lowQuality":
      /* 低质检测：漏斗筛选 */
      return (
        <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
          <path
            d="M24 26h48l-16 22v18l-16 8V48L24 26Z"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <path d="M36 40h24" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case "autoClassify":
      /* 自动分类：分层标签网格 */
      return (
        <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
          <rect x="20" y="22" width="24" height="24" rx="5" stroke="currentColor" strokeWidth="5.5" />
          <rect x="52" y="22" width="24" height="24" rx="5" stroke="currentColor" strokeWidth="5.5" />
          <rect x="20" y="54" width="24" height="24" rx="5" stroke="currentColor" strokeWidth="5.5" />
          <rect x="52" y="54" width="24" height="24" rx="5" stroke="currentColor" strokeWidth="5.5" />
        </svg>
      );
    case "duplicate":
      /* 查重：双层叠文档 */
      return (
        <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
          <rect x="28" y="28" width="40" height="48" rx="6" stroke="currentColor" strokeWidth="5.5" />
          <path
            d="M36 22h28a6 6 0 0 1 6 6v36"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path d="M38 44h20M38 56h14" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case "famousWork":
      /* 知名作品：星标奖章 */
      return (
        <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
          <circle cx="48" cy="42" r="20" stroke="currentColor" strokeWidth="5.5" />
          <path
            d="M48 28l4.2 8.6 9.5 1.4-6.9 6.7 1.6 9.4L48 49.6 39.6 54l1.6-9.4-6.9-6.7 9.5-1.4L48 28Z"
            fill="currentColor"
          />
          <path d="M36 66l12 8 12-8" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "famousTrademark":
      /* 知名商标：盾牌 + 标记 */
      return (
        <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
          <path
            d="M48 20 70 30v18c0 16-10 28-22 32-12-4-22-16-22-32V30L48 20Z"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <path
            d="M40 44h16M48 36v20"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "contentAnalysis":
      /* 内容分析：波形 + 节点 */
      return (
        <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
          <path
            d="M18 52c8-18 14-18 22 0s14 18 22 0 14-18 22 0"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <circle cx="30" cy="46" r="5" fill="currentColor" />
          <circle cx="52" cy="58" r="5" fill="currentColor" />
          <circle cx="74" cy="46" r="5" fill="currentColor" />
        </svg>
      );
    case "safetyAssist":
      /* 安全辅助审核：护盾勾选 */
      return (
        <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
          <path
            d="M48 18 72 28v20c0 18-11 30-24 34-13-4-24-16-24-34V28L48 18Z"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <path
            d="m38 48 8 8 14-16"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}
