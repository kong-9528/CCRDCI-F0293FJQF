import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NavGroupIcon } from "@/components/NavIcons";
import { OPS_NAV, findNavGroupKey } from "@/lib/nav";

type Props = {
  collapsed: boolean;
};

function isPathActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function OpsSidebar({ collapsed }: Props) {
  const { pathname } = useLocation();
  const activeGroupKey = findNavGroupKey(pathname);

  const [openKeys, setOpenKeys] = useState<string[]>(() =>
    activeGroupKey && activeGroupKey !== "home" ? [activeGroupKey] : [],
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
      <nav className="a-sidebar__nav a-menu-acc">
        {OPS_NAV.map((group) => {
          const visibleItems = group.items.filter((item) => !item.hidden);
          if (!visibleItems.length) return null;

          /* 顶层单链：首页 */
          if (!group.title) {
            const item = visibleItems[0];
            if (!item?.ready) return null;
            return (
              <NavLink
                key={group.key}
                to={item.to}
                end
                className={({ isActive }) =>
                  `a-menu__item a-menu__item--root${isActive ? " is-active" : ""}`
                }
                title={item.label}
              >
                <NavGroupIcon id={group.icon} className="a-menu__icon" />
                {!collapsed ? <span className="a-menu__label">{item.label}</span> : null}
              </NavLink>
            );
          }

          const open = !collapsed && openKeys.includes(group.key);
          const childActive = group.items.some((item) => isPathActive(pathname, item.to));
          const firstReady = visibleItems.find((item) => item.ready);

          return (
            <div
              key={group.key}
              className={`a-menu__acc${open ? " is-open" : ""}${childActive ? " has-active" : ""}`}
            >
              {collapsed ? (
                <NavLink
                  to={firstReady?.to || "#"}
                  className={`a-menu__item a-menu__dir${childActive ? " is-active" : ""}`}
                  title={group.title}
                  onClick={(e) => {
                    if (!firstReady) e.preventDefault();
                  }}
                >
                  <NavGroupIcon id={group.icon} className="a-menu__icon" />
                </NavLink>
              ) : (
                <button
                  type="button"
                  className={`a-menu__item a-menu__dir${childActive ? " is-active" : ""}`}
                  aria-expanded={open}
                  onClick={() => toggleGroup(group.key)}
                >
                  <NavGroupIcon id={group.icon} className="a-menu__icon" />
                  <span className="a-menu__label">{group.title}</span>
                  <span className={`a-menu__caret${open ? " is-open" : ""}`} aria-hidden />
                </button>
              )}

              {open ? (
                <div className="a-menu__sub">
                  {visibleItems.map((item) =>
                    item.ready ? (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `a-menu__item a-menu__item--sub${isActive ? " is-active" : ""}`
                        }
                        title={item.label}
                      >
                        <span className="a-menu__label">{item.label}</span>
                      </NavLink>
                    ) : (
                      <span
                        key={item.to}
                        className="a-menu__item a-menu__item--sub is-disabled"
                        title={`${item.label}（即将接入）`}
                      >
                        <span className="a-menu__label">{item.label}</span>
                      </span>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
