"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const TRACK_W = 320;
const KNOB = 44;
const THRESHOLD = 0.92;

export function SlideCaptchaModal({ open, onClose, onSuccess }: Props) {
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");
  const startX = useRef(0);
  const startOffset = useRef(0);
  const offsetRef = useRef(0);
  const draggingRef = useRef(false);
  const max = TRACK_W - KNOB;

  const reset = useCallback(() => {
    offsetRef.current = 0;
    draggingRef.current = false;
    setOffset(0);
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;

    const onMove = (clientX: number) => {
      if (!draggingRef.current) return;
      const next = Math.min(max, Math.max(0, startOffset.current + clientX - startX.current));
      offsetRef.current = next;
      setOffset(next);
    };

    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const ratio = offsetRef.current / max;
      if (ratio >= THRESHOLD) {
        offsetRef.current = max;
        setOffset(max);
        setStatus("ok");
        window.setTimeout(() => onSuccess(), 280);
      } else {
        setStatus("fail");
        window.setTimeout(() => {
          offsetRef.current = 0;
          setOffset(0);
          setStatus("idle");
        }, 450);
      }
    };

    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => onMove(e.touches[0]?.clientX ?? 0);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [max, onSuccess, open]);

  if (!open) return null;

  const pct = Math.round((offset / max) * 100);

  return (
    <div className="d-modal" role="dialog" aria-modal="true" aria-label="滑动验证">
      <button type="button" className="d-modal__mask" aria-label="关闭" onClick={onClose} />
      <div className="d-modal__panel d-slide-captcha">
        <button type="button" className="d-modal__close" onClick={onClose} aria-label="关闭">
          ×
        </button>
        <h3>安全验证</h3>
        <p className="d-modal__desc">请按住滑块，拖动到最右侧完成验证</p>

        <div className="d-slide-captcha__stage" aria-hidden>
          <div className="d-slide-captcha__puzzle">
            <span className="d-slide-captcha__hole" style={{ left: `${72 + (pct / 100) * 40}%` }} />
            <span className="d-slide-captcha__piece" style={{ left: `${(offset / max) * 58}%` }} />
          </div>
        </div>

        <div
          className={`d-slide-captcha__track${status === "ok" ? " is-ok" : ""}${status === "fail" ? " is-fail" : ""}`}
          style={{ width: TRACK_W }}
        >
          <div className="d-slide-captcha__fill" style={{ width: offset + KNOB / 2 }} />
          <span className="d-slide-captcha__hint">
            {status === "ok" ? "验证通过" : status === "fail" ? "请重试" : "向右滑动验证"}
          </span>
          <button
            type="button"
            className="d-slide-captcha__knob"
            style={{ transform: `translateX(${offset}px)` }}
            aria-label="拖动滑块"
            onMouseDown={(e) => {
              e.preventDefault();
              if (status === "ok") return;
              draggingRef.current = true;
              startX.current = e.clientX;
              startOffset.current = offsetRef.current;
            }}
            onTouchStart={(e) => {
              if (status === "ok") return;
              draggingRef.current = true;
              startX.current = e.touches[0]?.clientX ?? 0;
              startOffset.current = offsetRef.current;
            }}
          >
            {status === "ok" ? "✓" : "››"}
          </button>
        </div>
      </div>
    </div>
  );
}
