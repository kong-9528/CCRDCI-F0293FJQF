import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MaskedPhone, maskPhone } from "@/components/MaskedPhone";
import { RequirePerm } from "@/components/RequireAuth";
import { SsoPagination } from "@/components/SsoPagination";
import {
  MEMBERSHIP_LABEL,
  USER_STATUS_LABEL,
  listPortalUsers,
  type PortalUserStatus,
} from "@/lib/portalUserStore";
import { TrademarkText } from "@/lib/trademark";
import { useClientPagination } from "@/lib/useClientPagination";
import { usePortalTick } from "@/lib/usePortalTick";

function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

function statusTagClass(status: PortalUserStatus) {
  if (status === "active") return " is-ok";
  if (status === "frozen") return " is-warn";
  return "";
}

type Filters = {
  keyword: string;
  status: "" | PortalUserStatus;
};

const EMPTY: Filters = { keyword: "", status: "" };

export function PortalUsersPage() {
  return (
    <RequirePerm code="sso.portal.users">
      <PortalUsersPageInner />
    </RequirePerm>
  );
}

function PortalUsersPageInner() {
  usePortalTick();
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);

  const filtered = useMemo(() => {
    const raw = applied.keyword.trim();
    const q = raw.toLowerCase();
    const phoneQ = normalizePhone(raw);
    const exactPhone = /^\d{11}$/.test(phoneQ);

    return listPortalUsers().filter((u) => {
      if (applied.status && u.status !== applied.status) return false;
      if (!q) return true;
      if (exactPhone) {
        return normalizePhone(u.phone) === phoneQ;
      }
      return (
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        false
      );
    });
  }, [applied]);

  const pager = useClientPagination(filtered);

  return (
    <div className="sso-admin">
      <div className="sso-filters">
        <label className="sso-filters__item">
          <span>关键词</span>
          <input
            className="sso-input"
            value={draft.keyword}
            onChange={(e) => setDraft((p) => ({ ...p, keyword: e.target.value }))}
            placeholder="用户名 / 手机号"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setApplied(draft);
                pager.resetPage();
              }
            }}
          />
        </label>
        <label className="sso-filters__item">
          <span>状态</span>
          <select
            className="sso-select"
            value={draft.status}
            onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as Filters["status"] }))}
          >
            <option value="">全部</option>
            <option value="active">正常</option>
            <option value="frozen">冻结</option>
            <option value="cancelled">注销</option>
          </select>
        </label>
        <div className="sso-filters__actions">
          <button
            type="button"
            className="sso-btn sso-btn--primary"
            onClick={() => {
              setApplied(draft);
              pager.resetPage();
            }}
          >
            查询
          </button>
          <button
            type="button"
            className="sso-btn sso-btn--outline"
            onClick={() => {
              setDraft(EMPTY);
              setApplied(EMPTY);
              pager.resetPage();
            }}
          >
            重置
          </button>
        </div>
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
            {pager.pageItems.map((u) => {
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
                    <span className={`sso-tag${statusTagClass(u.status)}`}>
                      {USER_STATUS_LABEL[u.status]}
                    </span>
                  </td>
                  <td className="sso-cell-ellipsis" title={settled || "未入驻"}>
                    {settled ? <TrademarkText text={settled} /> : "—"}
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
            {!pager.total ? (
              <tr>
                <td colSpan={7}>
                  <div className="sso-empty">暂无用户</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <SsoPagination
          page={pager.page}
          pageSize={pager.pageSize}
          total={pager.total}
          totalPages={pager.totalPages}
          pageSizes={pager.pageSizes}
          onPageChange={pager.setPage}
          onPageSizeChange={pager.setPageSize}
        />
      </div>
    </div>
  );
}
