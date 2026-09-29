/**
 * 作品智能辅助审核 · 服务说明配图
 * 色系对齐 home /dashboard hero-banner；单幅居中构图，避免零散元素。
 */
export function ReviewIntroVisual() {
  return (
    <div className="c-review-visual" aria-hidden>
      <div className="c-review-visual__bg" />
      <div className="c-review-visual__decor">
        <span className="c-review-visual__orb c-review-visual__orb--a" />
        <span className="c-review-visual__orb c-review-visual__orb--b" />

        <svg className="c-review-visual__scene" viewBox="0 0 640 200" fill="none">
          {/* 背景环 —— 统一视觉重心 */}
          <circle cx="320" cy="100" r="78" stroke="currentColor" strokeWidth="1.2" opacity="0.18" />
          <circle cx="320" cy="100" r="58" stroke="currentColor" strokeWidth="1.2" opacity="0.28" />

          {/* 左侧：多模态输入（图 / 文 / 声） */}
          <g opacity="0.88">
            <rect x="48" y="54" width="88" height="92" rx="12" stroke="currentColor" strokeWidth="1.8" opacity="0.7" />
            <rect x="60" y="68" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="68" cy="76" r="2.2" fill="currentColor" opacity="0.8" />
            <path d="M62 90l6-5 5 4 7-7 8 8H62z" fill="currentColor" opacity="0.5" />
            <path
              d="M104 70h22M104 78h18M104 86h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M64 112v10M70 108v18M76 110v14M82 106v22"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              opacity="0.65"
            />
            <circle cx="112" cy="118" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
            <circle cx="112" cy="118" r="3.5" stroke="currentColor" strokeWidth="1.3" opacity="0.7" />
          </g>

          {/* 左 → 中 连接线 */}
          <path
            d="M148 100h52"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeDasharray="4 4"
            opacity="0.45"
          />
          <path
            d="M192 94l8 6-8 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />

          {/* 中央：智能审核核心面板 */}
          <g className="c-review-visual__core">
            <rect
              x="212"
              y="36"
              width="216"
              height="128"
              rx="14"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.75"
            />
            <rect x="226" y="50" width="188" height="72" rx="8" fill="currentColor" opacity="0.1" />
            {/* 扫描线 */}
            <path d="M226 86h188" stroke="currentColor" strokeWidth="2" opacity="0.9">
              <animate
                attributeName="d"
                values="M226 62h188;M226 110h188;M226 62h188"
                dur="3.8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.35;0.95;0.35"
                dur="3.8s"
                repeatCount="indefinite"
              />
            </path>
            {/* 面板内缩略图 + 文本条 */}
            <rect x="238" y="60" width="52" height="40" rx="4" stroke="currentColor" strokeWidth="1.4" opacity="0.75" />
            <path d="M242 92l8-7 7 5 10-9 13 11H242z" fill="currentColor" opacity="0.45" />
            <path
              d="M304 66h92M304 78h80M304 90h68"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* 底部三项能力状态点 */}
            <circle cx="258" cy="142" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
            <path d="m254.5 142 2.2 2.2 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="320" cy="142" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
            <path d="M316.5 142h7M320 138.5v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="382" cy="142" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
            <path d="m378.5 145.5 7-7M385.5 145.5l-7-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </g>

          {/* 中 → 右 连接线 */}
          <path
            d="M440 100h52"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeDasharray="4 4"
            opacity="0.45"
          />
          <path
            d="M484 94l8 6-8 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />

          {/* 右侧：审核结果 — 安全盾 + 查重比对 */}
          <g opacity="0.9">
            <rect x="504" y="48" width="88" height="104" rx="12" stroke="currentColor" strokeWidth="1.8" opacity="0.7" />
            <path
              d="M548 62 524 72v16c0 16 10 26 24 30 14-4 24-14 24-30V72L548 62Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
              opacity="0.85"
            />
            <path
              d="M548 62 524 72v16c0 16 10 26 24 30 14-4 24-14 24-30V72L548 62Z"
              fill="currentColor"
              opacity="0.1"
            />
            <path
              d="m538 86 6 6 12-13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 双页比对 */}
            <rect x="518" y="118" width="26" height="22" rx="2.5" stroke="currentColor" strokeWidth="1.3" opacity="0.75" />
            <rect x="552" y="118" width="26" height="22" rx="2.5" stroke="currentColor" strokeWidth="1.3" opacity="0.75" />
            <path
              d="M546 126h4M548 123l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
