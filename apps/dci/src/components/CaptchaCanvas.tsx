"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onRefresh: (next: string) => void;
  width?: number;
  height?: number;
};

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomCaptchaCode(len = 4) {
  let out = "";
  for (let i = 0; i < len; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)];
  return out;
}

export function CaptchaCanvas({ value, onRefresh, width = 120, height = 44 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(
    (code: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
      }
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.font = "bold 22px Arial";
      ctx.textBaseline = "middle";
      const start = (width - code.length * 24) / 2 + 8;
      for (let i = 0; i < code.length; i++) {
        ctx.save();
        ctx.translate(start + i * 24, height / 2 + (Math.random() - 0.5) * 6);
        ctx.rotate((Math.random() - 0.5) * 0.4);
        ctx.fillStyle = `rgb(${30 + Math.random() * 100},${30 + Math.random() * 100},${30 + Math.random() * 100})`;
        ctx.fillText(code[i], 0, 0);
        ctx.restore();
      }
    },
    [height, width],
  );

  useEffect(() => {
    if (value) draw(value);
    else onRefresh(randomCaptchaCode());
  }, [value, draw, onRefresh]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="d-login-captcha"
      title="点击刷新验证码"
      onClick={() => onRefresh(randomCaptchaCode())}
    />
  );
}
