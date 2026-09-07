import { NavLink, Outlet, useLocation } from "react-router-dom";

const API_SIDE_NAV = [
  { to: "/api/keys", label: "API key管理", end: true },
  { to: "/api/docs", label: "API文档", end: false },
] as const;

export function ApiManageLayout() {
  const { pathname } = useLocation();

  return (
    <div className="c-api-manage">
      <aside className="c-api-manage__side" aria-label="API管理">
        <nav className="c-api-manage__nav">
          {API_SIDE_NAV.map((item) => {
            const active = item.end
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`c-api-manage__link${active ? " is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="c-api-manage__main">
        <Outlet />
      </div>
    </div>
  );
}
