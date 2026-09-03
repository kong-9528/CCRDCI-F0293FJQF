import { NavLink, useLocation } from "react-router-dom";
import { NavIcon } from "@/components/icons/NavIcons";
import { CUSTOMER_NAV, isNavItemActive } from "@/lib/nav";

type Props = {
  collapsed: boolean;
  locked?: boolean;
};

export function CustomerSidebar({ collapsed, locked }: Props) {
  const { pathname } = useLocation();

  if (locked) {
    return (
      <aside className="a-sidebar">
        <nav className="a-sidebar__nav">
          <NavLink
            to="/apply"
            end
            className={({ isActive }) => `a-menu__item${isActive ? " is-active" : ""}`}
            title="入驻申请"
          >
            <NavIcon id="account" />
            {!collapsed ? <span className="a-menu__label">入驻申请</span> : null}
          </NavLink>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="a-sidebar">
      <nav className="a-sidebar__nav">
        {CUSTOMER_NAV.map((item) => {
          const active = isNavItemActive(item, pathname);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/desk"}
              className={`a-menu__item${active ? " is-active" : ""}`}
              title={item.label}
            >
              <NavIcon id={item.icon} />
              {!collapsed ? <span className="a-menu__label">{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
