"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  SERVICE_ENTRIES,
  getServiceCardTarget,
  getServiceStatusLabel,
  type ServiceApplyStatus,
} from "@/lib/serviceAccess";

function statusClass(status: ServiceApplyStatus) {
  return `d-account__status d-account__status--${status}`;
}

/** 已开通：类实名认证成功的盾牌校验标识 */
function IconOpenedVerified() {
  return (
    <svg className="d-account__service-verified-icon" width="18" height="20" viewBox="0 0 18 20" aria-hidden>
      <path
        className="d-account__service-verified-shield"
        d="M9 1.2L15.6 3.6v5.2c0 4.05-2.7 7.55-6.6 8.95C5.1 16.35 2.4 12.85 2.4 8.8V3.6L9 1.2z"
      />
      <path
        d="M5.6 9.35l2.15 2.15 4.45-4.55"
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AccountServicesPanel() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="d-account__card">
      <div className="d-account__card-head">
        <div className="d-account__card-title">
          <span>开通管理</span>
        </div>
      </div>
      <div className="d-account__card-body">
        <div className="d-account__service-grid">
          {SERVICE_ENTRIES.map((entry) => {
            const target = getServiceCardTarget(user, entry);
            const label = getServiceStatusLabel(target.status);
            const opened = target.status === "approved";
            const cardClass = `d-account__service-card${opened ? " d-account__service-card--opened" : ""}`;
            const inner = (
              <>
                <div className="d-account__service-top">
                  <div className="d-account__service-heading">
                    <h3 className="d-account__service-name">{entry.name}</h3>
                    {opened ? (
                      <span className="d-account__service-verified" title="已开通" aria-label="已开通认证通过">
                        <IconOpenedVerified />
                      </span>
                    ) : null}
                  </div>
                  <span className={statusClass(target.status)}>{label}</span>
                </div>
                <p className="d-account__service-desc">{entry.description}</p>
                <span className="d-account__service-cta">
                  {opened
                    ? "进入工作台"
                    : target.status === "pending"
                      ? "查看审核进度"
                      : target.status === "rejected"
                        ? "修改后重新提交"
                        : "去填写申请资料"}{" "}
                  →
                </span>
              </>
            );

            if (target.external) {
              return (
                <a
                  key={entry.kind}
                  href={target.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  {inner}
                </a>
              );
            }

            return (
              <Link key={entry.kind} href={target.href} className={cardClass}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
