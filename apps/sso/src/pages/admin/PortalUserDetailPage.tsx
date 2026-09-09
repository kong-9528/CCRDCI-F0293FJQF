import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MaskedPhone } from "@/components/MaskedPhone";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  MEMBERSHIP_LABEL,
  USER_STATUS_LABEL,
  freezePortalUser,
  getPortalUser,
  unfreezePortalUser,
} from "@/lib/portalUserStore";
import { usePortalTick } from "@/lib/usePortalTick";

export function PortalUserDetailPage() {
  return (
    <RequirePerm code="sso.portal.users">
      <PortalUserDetailInner />
    </RequirePerm>
  );
}

function PortalUserDetailInner() {
  usePortalTick();
  const { id } = useParams();
  const { user: operator, can } = useAuth();
  const [message, setMessage] = useState("");
  const user = id ? getPortalUser(id) : null;
  const canWrite = can("sso.portal.users.write");

  if (!user) {
    return (
      <div className="sso-admin">
        <div className="sso-empty">用户不存在</div>
        <Link to="/admin/portal-users" className="sso-btn">
          返回列表
        </Link>
      </div>
    );
  }

  const onFreeze = () => {
    if (!id || !operator) return;
    if (!window.confirm(`确认冻结用户「${user.username}」？冻结后其门户登录将受限。`)) return;
    const result = freezePortalUser(id, operator.username);
    setMessage(result.ok ? "已冻结该用户" : result.message);
  };

  const onUnfreeze = () => {
    if (!id || !operator) return;
    if (!window.confirm(`确认解冻用户「${user.username}」？`)) return;
    const result = unfreezePortalUser(id, operator.username);
    setMessage(result.ok ? "已解冻该用户" : result.message);
  };

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "用户名", value: <code>{user.username}</code> },
    { label: "手机号", value: <MaskedPhone phone={user.phone} /> },
    { label: "状态", value: USER_STATUS_LABEL[user.status] },
    { label: "注册时间", value: user.createdAt },
    { label: "最近登录", value: user.lastLoginAt ?? "—" },
  ];

  return (
    <div className="sso-admin sso-portal-detail">
      <div className="sso-portal-detail__toolbar">
        <Link to="/admin/portal-users" className="sso-text-link">
          ← 返回列表
        </Link>
        {canWrite && user.status === "active" ? (
          <button type="button" className="sso-btn sso-btn--outline sso-btn--sm" onClick={onFreeze}>
            冻结
          </button>
        ) : canWrite && user.status === "frozen" ? (
          <button type="button" className="sso-btn sso-btn--primary sso-btn--sm" onClick={onUnfreeze}>
            解冻
          </button>
        ) : null}
      </div>

      {message ? <p className="sso-hint sso-portal-detail__msg">{message}</p> : null}

      <section className="sso-card sso-card--flush">
        <div className="sso-card__head">账号信息</div>
        <dl className="sso-portal-desc">
          {fields.map((f) => (
            <div key={f.label} className="sso-portal-desc__item">
              <dt className="sso-portal-desc__label">{f.label}</dt>
              <dd className="sso-portal-desc__value">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="sso-card sso-card--flush">
        <div className="sso-card__head">控制台入驻关系</div>
        <table className="sso-table">
          <thead>
            <tr>
              <th>控制台</th>
              <th>状态</th>
              <th>客户主体</th>
              <th>更新时间</th>
            </tr>
          </thead>
          <tbody>
            {user.memberships.map((m) => (
              <tr key={m.consoleId}>
                <td>{m.consoleName}</td>
                <td>{MEMBERSHIP_LABEL[m.status]}</td>
                <td>{m.tenantName ?? "—"}</td>
                <td>{m.updatedAt ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sso-portal-detail__foot">入驻审批在各产品运营后台处理；此处只读汇总 UC 侧关系。</p>
      </section>
    </div>
  );
}
