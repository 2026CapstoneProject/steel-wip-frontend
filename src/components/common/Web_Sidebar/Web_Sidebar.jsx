import { NavLink, useLocation } from "react-router-dom";
import { WEB_OFFICE_NAV_ITEMS } from "../../../constants/Web_navigation";
import logoImage from "../../../assets/Steel_all_CI_align_1st.png";

export default function Web_Sidebar() {
  const location = useLocation();

  const mainBaseClass =
    "flex items-center gap-3 px-4 py-3 rounded-full transition-colors";
  const mainInactiveClass = "text-slate-600 hover:bg-slate-200/50";
  const mainActiveClass = "bg-blue-100 text-blue-700 font-semibold";

  const subBaseClass =
    "flex items-center gap-3 px-4 py-2 rounded-full transition-colors";
  const subInactiveClass = "text-slate-600 hover:bg-slate-200/50";
  const subActiveClass = "bg-blue-100 text-blue-700 font-semibold";

  const getIsChildActive = (childPath) => {
    const currentPath = location.pathname;

    if (childPath === "/office/scenario/input") {
      return (
        currentPath === "/office/scenario/input" ||
        currentPath === "/office/scenario/result"
      );
    }

    return currentPath === childPath || currentPath.startsWith(`${childPath}/`);
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-100 px-4 py-6">
      <div className="mb-10 px-2">
        <img
          src={logoImage}
          alt="Steel-All-CI"
          className="h-12 w-auto object-contain"
        />
        <p className="text-[0.75rem] font-medium text-on-surface-variant opacity-70">
          Inventory ERP
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {WEB_OFFICE_NAV_ITEMS.map((item) => {
          if (item.children) {
            const isGroupActive = item.children.some((child) =>
              getIsChildActive(child.path),
            );

            return (
              <div key={item.key} className="space-y-1 pt-2">
                <div
                  className={`flex items-center gap-3 px-4 py-2 font-bold uppercase text-[0.65rem] tracking-wider ${
                    isGroupActive ? "text-blue-700" : "text-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {item.icon}
                  </span>
                  <span className="font-label">{item.label}</span>
                </div>

                <div className="space-y-1 pl-4">
                  {item.children.map((child) => {
                    const isChildActive = getIsChildActive(child.path);

                    return (
                      <NavLink
                        key={child.key}
                        to={child.path}
                        className={() =>
                          `${subBaseClass} ${
                            isChildActive ? subActiveClass : subInactiveClass
                          }`
                        }
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {child.icon}
                        </span>
                        <span className="font-label text-[0.8rem]">
                          {child.label}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `${mainBaseClass} ${
                  isActive ? mainActiveClass : mainInactiveClass
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
