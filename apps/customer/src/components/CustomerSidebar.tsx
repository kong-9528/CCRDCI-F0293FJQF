import { NavLink, useLocation } from "react-router-dom";
import { NavIcon } from "@/components/icons/NavIcons";
import { CUSTOMER_NAV, isNavItemActive } from "@/lib/nav";

type Props = {
  collapsed: boolean;
};

export function CustomerSidebar({ collapsed }: Props) {
  const { pathname } = useLocation();

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
