import { NavLink } from "react-router-dom";
import { NavIcon } from "@/components/icons/NavIcons";
import { CUSTOMER_NAV } from "@/lib/nav";
import { PLATFORM_NAME } from "@/lib/catalog";

type Props = {
  collapsed: boolean;
};

export function CustomerSidebar({ collapsed }: Props) {
  return (
    <aside className="a-sidebar">
      <NavLink to="/desk" className="a-sidebar__logo" title={PLATFORM_NAME}>
        <span className="a-sidebar__mark">D</span>
        {!collapsed ? <span className="a-sidebar__logo-text">{PLATFORM_NAME}</span> : null}
      </NavLink>

      <nav className="a-sidebar__nav">
        {CUSTOMER_NAV.map((group) => (
          <div key={group.title || group.items[0]?.to || "group"}>
            {group.title ? <div className="a-menu__group">{group.title}</div> : null}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/desk"}
                className={({ isActive }) => `a-menu__item${isActive ? " is-active" : ""}`}
                title={item.label}
              >
                <NavIcon id={item.icon} />
                {!collapsed ? <span className="a-menu__label">{item.label}</span> : null}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
