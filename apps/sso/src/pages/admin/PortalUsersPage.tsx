import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ListPageHeader } from "@/components/ListPageHeader";
import { MaskedPhone, maskPhone } from "@/components/MaskedPhone";
import { RequirePerm } from "@/components/RequireAuth";
import {
  MEMBERSHIP_LABEL,
  USER_STATUS_LABEL,
  listPortalUsers,
  type PortalUserStatus,
} from "@/lib/portalUserStore";

function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

export function PortalUsersPage() {
  return (
    <RequirePerm code="sso.portal.users">
      <PortalUsersPageInner />
    </RequirePerm>
  );
}

function PortalUsersPageInner() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"" | PortalUserStatus>("");

  const rows = useMemo(() => {
    const raw = keyword.trim();
    const q = raw.toLowerCase();
    const phoneQ = normalizePhone(raw);
    const exactPhone = /^\d{11}$/.test(phoneQ);

    return listPortalUsers().filter((u) => {
      if (status && u.status !== status) return false;
      if (!q) return true;
      if (exactPhone) {
        return normalizePhone(u.phone) === phoneQ;
      }
      return (
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        // 非完整 11 位时，不用脱敏串模糊匹配手机；避免靠 **** 搜到
        false
      );
    });
  }, [keyword, status]);

  return (
    <div className="sso-admin">
      <ListPageHeader
        title="门户用户列表"
        description="UC 全量注册账号。手机号列表脱敏展示；完整 11 位手机号可精准搜索。"
      />

      <div className="sso-filters">
        <label className="sso-filters__item">
          <span>关键词</span>
          <input
            className="sso-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="用户名 / 手机号"
          />
        </label>
        <label className="sso-filters__item">
          <span>状态</span>
          <select
            className="sso-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | PortalUserStatus)}
          >
            <option value="">全部</option>
            <option value="active">正常</option>
            {/* <option value="frozen">冻结</option> */}
            <option value="cancelled">注销</option>
          </select>
        </label>
      </div>

      <div className="sso-card sso-card--flush">
        <table className="sso-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>手机号</th>
              <th>状态</th>
              <th>入驻概览</th>
              <th>注册时间</th>
              <th>最近登录</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const settled = u.memberships
                .filter((m) => m.status === "approved" || m.status === "applying")
                .map((m) => `${m.consoleName.replace("控制台", "")}(${MEMBERSHIP_LABEL[m.status]})`)
                .join("；");
              return (
                <tr key={u.id}>
                  <td>
                    <code>{u.username}</code>
                  </td>
                  <td title={maskPhone(u.phone)}>
                    <MaskedPhone phone={u.phone} staticOnly />
                  </td>
                  <td>
                    <span className={`sso-tag${u.status === "active" ? " is-ok" : ""}`}>
                      {USER_STATUS_LABEL[u.status]}
                    </span>
                  </td>
                  <td className="sso-cell-ellipsis" title={settled || "未入驻"}>
                    {settled || "—"}
                  </td>
                  <td>{u.createdAt}</td>
                  <td>{u.lastLoginAt ?? "—"}</td>
                  <td>
                    <Link className="sso-text-link" to={`/admin/portal-users/${u.id}`}>
                      详情
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!rows.length ? (
              <tr>
                <td colSpan={7}>
                  <div className="sso-empty">暂无用户</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
