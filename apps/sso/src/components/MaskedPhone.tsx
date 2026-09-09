import { useEffect, useState } from "react";

type Props = {
  phone: string;
  /** 仅展示脱敏，不可点击揭示（列表用） */
  staticOnly?: boolean;
};

/** 中间 4 位脱敏（与 uc-ops 一致） */
export function maskPhone(phone: string): string {
  const raw = phone.replace(/[\s-]/g, "");
  if (raw.length < 7) return phone || "—";
  const start = Math.floor((raw.length - 4) / 2);
  return `${raw.slice(0, start)}****${raw.slice(start + 4)}`;
}

/** 详情：默认脱敏，点眼睛显示明文 10 秒后恢复 */
export function MaskedPhone({ phone, staticOnly }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!revealed) return;
    setSecondsLeft(10);
    const timer = window.setInterval(() => {
      setSecondsLeft((n) => {
        if (n <= 1) {
          window.clearInterval(timer);
          setRevealed(false);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [revealed, tick]);

  if (!phone) return <span>—</span>;

  if (staticOnly) {
    return <span>{maskPhone(phone)}</span>;
  }

  return (
    <span className="sso-masked-phone">
      <span className="sso-masked-phone__value">{revealed ? phone : maskPhone(phone)}</span>
      {revealed ? (
        <span className="sso-masked-phone__countdown" aria-live="polite">
          {secondsLeft}s
        </span>
      ) : (
        <button
          type="button"
          className="sso-masked-phone__reveal"
          title="显示完整手机号"
          aria-label="显示完整手机号"
          onClick={() => {
            setRevealed(true);
            setTick((n) => n + 1);
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
          </svg>
        </button>
      )}
    </span>
  );
}
