import { NavLink } from "react-router-dom";
import { NavIcon } from "@/components/icons/NavIcons";
import { CUSTOMER_NAV } from "@/lib/nav";

type Props = {
  collapsed: boolean;
  locked?: boolean;
};

export function CustomerSidebar({ collapsed, locked }: Props) {
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
        {CUSTOMER_NAV.map((group) => (
          <div key={group.title || group.items[0]?.to || "group"} className="a-menu__block">
            {group.title && !collapsed ? <div className="a-menu__group">{group.title}</div> : null}
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
