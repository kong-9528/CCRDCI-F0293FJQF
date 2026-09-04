/** 核验失败细节标签（粉底红字 + 叉号） */
export function VerifyFailReasons({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return null;
  return (
    <ul className="c-verify-fail-reasons" aria-label="失败细节">
      {reasons.map((text) => (
        <li key={text} className="c-verify-fail-reasons__item">
          <span className="c-verify-fail-reasons__icon" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6.25" fill="currentColor" />
              <path
                d="M4.6 4.6 9.4 9.4M9.4 4.6 4.6 9.4"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

export function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 2.5v7.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M5.2 7.5 8 10.3l2.8-2.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldOkIcon({ gradId = "usageShieldOk" }: { gradId?: string }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
      <path
        d="M28 6 44 12.5v14.2c0 11.3-7.1 21.4-16 24.3-8.9-2.9-16-13-16-24.3V12.5L28 6Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M20.5 28.2 25.8 33.5 36 22.5"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={gradId} x1="12" y1="8" x2="42" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3aa0ef" />
          <stop offset="1" stopColor="#0b62b8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ShieldFailIcon({ gradId = "usageShieldFail" }: { gradId?: string }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
      <path
        d="M28 6 44 12.5v14.2c0 11.3-7.1 21.4-16 24.3-8.9-2.9-16-13-16-24.3V12.5L28 6Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M22 22.5 34 34.5M34 22.5 22 34.5"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id={gradId} x1="12" y1="8" x2="42" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f07171" />
          <stop offset="1" stopColor="#c62828" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DetailDisclaimer() {
  return (
    <>
      <p className="c-cert-detail__disclaimer">
        ※
        核验结果补充免责声明：本次服务提供的核验结果基于当前数据生成，可能存在滞后，仅供初步参考。关于作品/软件版权权属或登记状态的最终确认，请以您办理的中国版权保护中心著作权登记查询业务出具的官方查询结果为准。
      </p>
      <p className="c-cert-detail__source">数据来源：中国版权保护中心官方数据</p>
    </>
  );
}
