import { NavLink } from "react-router-dom";
import { OPS_NAV } from "@/lib/nav";
import { PLATFORM_NAME } from "@/lib/catalog";

type Props = {
  collapsed: boolean;
};

export function OpsSidebar({ collapsed }: Props) {
  return (
    <aside className="a-sidebar">
      <NavLink to="/customers" className="a-sidebar__logo">
        <span className="a-sidebar__mark">运</span>
        {!collapsed ? <span className="a-sidebar__logo-text">{PLATFORM_NAME}</span> : null}
      </NavLink>

      {OPS_NAV.map((group) => (
        <div key={group.title}>
          <div className="a-menu__group">{group.title}</div>
          {group.items.map((item) =>
            item.ready ? (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `a-menu__item${isActive ? " is-active" : ""}`}
                title={item.label}
              >
                <span>{collapsed ? item.label.slice(0, 1) : item.label}</span>
              </NavLink>
            ) : (
              <span
                key={item.to}
                className="a-menu__item is-disabled"
                title={`${item.label}（即将接入）`}
              >
                <span>{collapsed ? item.label.slice(0, 1) : item.label}</span>
              </span>
            ),
          )}
        </div>
      ))}
    </aside>
  );
}
