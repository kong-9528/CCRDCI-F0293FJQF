import { Link, useParams } from "react-router-dom";
import { MaskedPhone } from "@/components/MaskedPhone";
import {
  MEMBERSHIP_LABEL,
  REAL_NAME_LABEL,
  USER_STATUS_LABEL,
  getUser,
} from "@/lib/ucUserStore";
import { useUcTick } from "@/lib/useUcTick";

export function UserDetailPage() {
  useUcTick();
  const { id } = useParams();
  const user = id ? getUser(id) : null;

  if (!user) {
    return (
      <div className="uo-page">
        <div className="a-empty">用户不存在</div>
        <Link to="/users" className="a-btn">
          返回列表
        </Link>
      </div>
    );
  }

  return (
    <div className="uo-page">
      <div className="uo-page__head">
        <div>
          <Link to="/users" className="a-link">
            ← 返回列表
          </Link>
          <h1 className="uo-page__title">用户详情 · {user.username}</h1>
        </div>
        {/* 冻结 / 解冻功能暂隐藏 */}
      </div>

      <section className="a-card">
        <div className="a-card__head">账号信息</div>
        <div className="a-desc">
          <div>
            <span className="a-desc__label">用户名</span>
            <span className="a-desc__value">
              <code>{user.username}</code>
            </span>
          </div>
          <div>
            <span className="a-desc__label">手机号</span>
            <span className="a-desc__value">
              <MaskedPhone phone={user.phone} />
            </span>
          </div>
          <div>
            <span className="a-desc__label">邮箱</span>
            <span className="a-desc__value">{user.email || "—"}</span>
          </div>
          <div>
            <span className="a-desc__label">状态</span>
            <span className="a-desc__value">{USER_STATUS_LABEL[user.status]}</span>
          </div>
          <div>
            <span className="a-desc__label">实名</span>
            <span className="a-desc__value">{REAL_NAME_LABEL[user.realNameStatus]}</span>
          </div>
          <div>
            <span className="a-desc__label">注册渠道</span>
            <span className="a-desc__value">{user.registerChannel}</span>
          </div>
          <div>
            <span className="a-desc__label">注册时间</span>
            <span className="a-desc__value">{user.createdAt}</span>
          </div>
          <div>
            <span className="a-desc__label">最近登录</span>
            <span className="a-desc__value">{user.lastLoginAt ?? "—"}</span>
          </div>
          <div>
            <span className="a-desc__label">备注</span>
            <span className="a-desc__value">{user.remark || "—"}</span>
          </div>
        </div>
      </section>

      <section className="a-card" style={{ marginTop: 16 }}>
        <div className="a-card__head">控制台入驻关系</div>
        <table className="a-table">
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
        <p className="uo-hint">入驻审批在各产品运营后台处理；此处只读汇总 UC 侧关系。</p>
      </section>
    </div>
  );
}
