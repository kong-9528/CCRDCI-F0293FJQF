import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { UC_OPS_NAV, findNavGroupKey } from "@/lib/nav";

function isPathActive(pathname: string, to: string, end?: boolean) {
  return end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
}

export function Sidebar() {
  const { pathname } = useLocation();
  const activeGroupKey = findNavGroupKey(pathname);

  const [openKeys, setOpenKeys] = useState<string[]>(() =>
    activeGroupKey && activeGroupKey !== "home" ? [activeGroupKey] : ["users", "security", "system"],
  );

  useEffect(() => {
    if (!activeGroupKey || activeGroupKey === "home") return;
    setOpenKeys((prev) => (prev.includes(activeGroupKey) ? prev : [...prev, activeGroupKey]));
  }, [activeGroupKey]);

  const toggleGroup = (key: string) => {
    setOpenKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  return (
    <aside className="a-sidebar">
      <div className="a-sidebar__logo">
        <strong>C端用户中心运营后台</strong>
      </div>
      <nav className="a-sidebar__nav uo-menu-acc">
        {UC_OPS_NAV.map((group) => {
          if (!group.title) {
            const item = group.items[0];
            if (!item) return null;
            return (
              <NavLink
                key={group.key}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `a-menu__item a-menu__item--root${isActive ? " is-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            );
          }

          const open = openKeys.includes(group.key);
          const childActive = group.items.some((item) => isPathActive(pathname, item.to, item.end));

          return (
            <div
              key={group.key}
              className={`uo-menu__acc${open ? " is-open" : ""}${childActive ? " has-active" : ""}`}
            >
              <button
                type="button"
                className={`a-menu__item uo-menu__dir${childActive ? " is-active" : ""}`}
                aria-expanded={open}
                onClick={() => toggleGroup(group.key)}
              >
                <span className="uo-menu__dir-label">{group.title}</span>
                <span className={`uo-menu__caret${open ? " is-open" : ""}`} aria-hidden />
              </button>
              {open ? (
                <div className="uo-menu__sub">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `a-menu__item a-menu__item--sub${isActive ? " is-active" : ""}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
