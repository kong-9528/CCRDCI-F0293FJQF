"use client";

import type { ReactNode } from "react";

export function ApplyField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="d-apply__field">
      <div className="d-apply__label-wrap">
        <label className="d-apply__label">
          {label}
          {required ? <span className="d-apply__req"> *</span> : null}
        </label>
        {hint}
      </div>
      <div className="d-apply__control">{children}</div>
    </div>
  );
}

export function ApplySection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="d-apply__section">
      <h3 className="d-apply__section-title">
        {icon}
        {title}
      </h3>
      <div className="d-apply__section-body">{children}</div>
    </section>
  );
}

function IconClock() {
  return (
    <svg className="d-apply__banner-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconWithdraw() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 14H4v-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 14a8 8 0 1 0-1.05-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PENDING_COPY = {
  registry: {
    title: "DCI注册中心申请审核中",
    desc: "您的申请已提交，正在等待平台审核",
  },
  tech: {
    title: "申请接入技术服务中心审核中",
    desc: "您的申请已提交，正在等待平台审核",
  },
} as const;

export function ApplyStatusBanner({
  status,
  kind = "registry",
  rejectReason,
}: {
  status: "none" | "pending" | "approved" | "rejected";
  kind?: "registry" | "tech";
  rejectReason?: string;
}) {
  if (status === "none") return null;

  if (status === "pending") {
    const copy = PENDING_COPY[kind];
    return (
      <div className="d-apply__banner d-apply__banner--pending">
        <IconClock />
        <div className="d-apply__banner-text">
          <p className="d-apply__banner-title">{copy.title}</p>
          <p className="d-apply__banner-desc">{copy.desc}</p>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="d-apply__banner d-apply__banner--rejected">
        <div>
          <p className="d-apply__banner-title">未通过</p>
          <p className="d-apply__banner-desc">{rejectReason || "申请未通过，请修改资料后重新提交。"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-apply__banner d-apply__banner--approved">
      <div>
        <p className="d-apply__banner-title">已通过</p>
        <p className="d-apply__banner-desc">运营已审核通过并开通产品，可进入工作台使用。</p>
      </div>
    </div>
  );
}

export function ApplyWithdrawBar({
  onWithdraw,
  withdrawing,
}: {
  onWithdraw: () => void;
  withdrawing?: boolean;
}) {
  return (
    <button
      type="button"
      className="d-apply__withdraw"
      onClick={onWithdraw}
      disabled={withdrawing}
    >
      <IconWithdraw />
      <span>{withdrawing ? "撤回中…" : "撤回本次申请"}</span>
    </button>
  );
}
