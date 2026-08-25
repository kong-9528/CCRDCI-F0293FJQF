/** 核验失败细节标签（粉底红字 + 叉号），三核验产品详情抽屉共用 */
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
