"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onVerifiedChange?: (ok: boolean) => void;
  id?: string;
};

function randomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** 简易图形验证码（演示人机校验） */
export function CaptchaField({ value, onChange, onVerifiedChange, id = "captcha" }: Props) {
  const [answer, setAnswer] = useState(randomCode);

  const refresh = useCallback(() => {
    setAnswer(randomCode());
    onChange("");
    onVerifiedChange?.(false);
  }, [onChange, onVerifiedChange]);

  useEffect(() => {
    onVerifiedChange?.(value.trim() === answer);
  }, [value, answer, onVerifiedChange]);

  return (
    <div className="p-field">
      <label htmlFor={id}>
        图形验证码 <span className="p-req">*</span>
      </label>
      <div className="p-captcha-row">
        <button
          type="button"
          className="p-captcha"
          onClick={refresh}
          title="点击刷新"
          aria-label="图形验证码，点击刷新"
        >
          <span className="p-captcha__noise" aria-hidden />
          <span className="p-captcha__text">{answer}</span>
        </button>
        <input
          id={id}
          className="p-input"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="请输入验证码"
          inputMode="numeric"
          maxLength={4}
          autoComplete="off"
        />
      </div>
      <div className="p-field__hint">点击左侧图形可刷新</div>
    </div>
  );
}

export function useCaptchaGate() {
  const [captcha, setCaptcha] = useState("");
  const [captchaOk, setCaptchaOk] = useState(false);
  return { captcha, setCaptcha, captchaOk, setCaptchaOk };
}
