import { Link, useParams } from "react-router-dom";
import { ListPageHeader } from "@/components/ListPageHeader";
import { MaskedPhone } from "@/components/MaskedPhone";
import { RequirePerm } from "@/components/RequireAuth";
import {
  MEMBERSHIP_LABEL,
  REAL_NAME_LABEL,
  USER_STATUS_LABEL,
  getPortalUser,
} from "@/lib/portalUserStore";

export function PortalUserDetailPage() {
  return (
    <RequirePerm code="sso.portal.users">
      <PortalUserDetailInner />
    </RequirePerm>
  );
}

function PortalUserDetailInner() {
  const { id } = useParams();
  const user = id ? getPortalUser(id) : null;

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

  return (
    <div className="sso-admin">
      <div className="sso-page-head">
        <Link to="/admin/portal-users" className="sso-text-link">
          ← 返回列表
        </Link>
      </div>
      <ListPageHeader title={`用户详情 · ${user.username}`} />

      <section className="sso-card">
        <div className="sso-card__head">账号信息</div>
        <div className="sso-portal-desc">
          <div>
            <span className="sso-portal-desc__label">用户名</span>
            <span className="sso-portal-desc__value">
              <code>{user.username}</code>
            </span>
          </div>
          <div>
            <span className="sso-portal-desc__label">手机号</span>
            <span className="sso-portal-desc__value">
              <MaskedPhone phone={user.phone} />
            </span>
          </div>
          <div>
            <span className="sso-portal-desc__label">邮箱</span>
            <span className="sso-portal-desc__value">{user.email || "—"}</span>
          </div>
          <div>
            <span className="sso-portal-desc__label">状态</span>
            <span className="sso-portal-desc__value">{USER_STATUS_LABEL[user.status]}</span>
          </div>
          <div>
            <span className="sso-portal-desc__label">实名</span>
            <span className="sso-portal-desc__value">{REAL_NAME_LABEL[user.realNameStatus]}</span>
          </div>
          <div>
            <span className="sso-portal-desc__label">注册渠道</span>
            <span className="sso-portal-desc__value">{user.registerChannel}</span>
          </div>
          <div>
            <span className="sso-portal-desc__label">注册时间</span>
            <span className="sso-portal-desc__value">{user.createdAt}</span>
          </div>
          <div>
            <span className="sso-portal-desc__label">最近登录</span>
            <span className="sso-portal-desc__value">{user.lastLoginAt ?? "—"}</span>
          </div>
          <div>
            <span className="sso-portal-desc__label">备注</span>
            <span className="sso-portal-desc__value">{user.remark || "—"}</span>
          </div>
        </div>
      </section>

      <section className="sso-card" style={{ marginTop: 16 }}>
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
        <p className="sso-hint">入驻审批在各产品运营后台处理；此处只读汇总 UC 侧关系。</p>
      </section>
    </div>
  );
}
