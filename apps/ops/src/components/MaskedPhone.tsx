import { useEffect, useState } from "react";
import { IconEye } from "@/components/icons/UiIcons";

type Props = {
  phone: string;
};

/** 中间 4 位脱敏；点击显示后 10 秒自动恢复 */
export function maskPhone(phone: string): string {
  const raw = phone.replace(/[\s-]/g, "");
  if (raw.length < 7) return phone || "—";
  const start = Math.floor((raw.length - 4) / 2);
  return `${raw.slice(0, start)}****${raw.slice(start + 4)}`;
}

export function MaskedPhone({ phone }: Props) {
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

  if (!phone) {
    return <span>—</span>;
  }

  const show = () => {
    setRevealed(true);
    setTick((n) => n + 1);
  };

  return (
    <span className="a-masked-phone">
      <span className="a-masked-phone__value">{revealed ? phone : maskPhone(phone)}</span>
      {revealed ? (
        <span className="a-masked-phone__countdown" aria-live="polite">
          {secondsLeft}s
        </span>
      ) : (
        <button
          type="button"
          className="a-masked-phone__reveal"
          title="显示"
          aria-label="显示完整手机号"
          onClick={show}
        >
          <IconEye size={14} />
          <span>显示</span>
        </button>
      )}
    </span>
  );
}
