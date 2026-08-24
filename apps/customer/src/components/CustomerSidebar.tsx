import { NavLink } from "react-router-dom";
import { CUSTOMER_NAV } from "@/lib/nav";
import { PLATFORM_NAME } from "@/lib/catalog";

type Props = {
  collapsed: boolean;
};

export function CustomerSidebar({ collapsed }: Props) {
  return (
    <aside className="a-sidebar">
      <NavLink to="/" className="a-sidebar__logo" end>
        <span className="a-sidebar__mark">版</span>
        {!collapsed ? <span className="a-sidebar__logo-text">{PLATFORM_NAME}</span> : null}
      </NavLink>

      {CUSTOMER_NAV.map((group) => (
        <div key={group.title}>
          <div className="a-menu__group">{group.title}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `a-menu__item${isActive ? " is-active" : ""}`}
              title={item.label}
            >
              <span>{collapsed ? item.label.slice(0, 1) : item.label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}
