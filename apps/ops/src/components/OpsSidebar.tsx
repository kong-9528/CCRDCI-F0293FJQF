import { NavLink } from "react-router-dom";
import { NavIcon } from "@/components/NavIcons";
import { OPS_NAV } from "@/lib/nav";

type Props = {
  collapsed: boolean;
};

export function OpsSidebar({ collapsed }: Props) {
  return (
    <aside className="a-sidebar">
      <NavLink to="/dashboard" className="a-sidebar__logo">
        <span className="a-sidebar__mark">运</span>
        {!collapsed ? <span className="a-sidebar__logo-text">运营后台</span> : null}
      </NavLink>

      {OPS_NAV.map((group) => (
        <div key={group.title}>
          {!collapsed ? <div className="a-menu__group">{group.title}</div> : null}
          {group.items.map((item) =>
            item.ready ? (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `a-menu__item${isActive ? " is-active" : ""}`}
                title={item.label}
              >
                <NavIcon to={item.to} className="a-menu__icon" />
                {!collapsed ? <span className="a-menu__label">{item.label}</span> : null}
              </NavLink>
            ) : (
              <span
                key={item.to}
                className="a-menu__item is-disabled"
                title={`${item.label}（即将接入）`}
              >
                <NavIcon to={item.to} className="a-menu__icon" />
                {!collapsed ? <span className="a-menu__label">{item.label}</span> : null}
              </span>
            ),
          )}
        </div>
      ))}
    </aside>
  );
}
