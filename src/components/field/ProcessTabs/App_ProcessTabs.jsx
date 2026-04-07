import React from "react";
import { useNavigate } from "react-router-dom";

const TAB_LIST = [
  { key: "ready", label: "생산 준비", path: "/App/ready" },
  { key: "processing", label: "생산 중", path: "/App/processing" },
  { key: "end", label: "작업 완료", path: "/App/end" },
];

const App_ProcessTabs = ({
  activeKey = "ready",
  className = "",
  stateByKey = {},
}) => {
  const navigate = useNavigate();

  return (
    <nav className={`border-b border-slate-200 bg-[#f7f9fb] ${className}`}>
      <div className="flex items-center justify-between px-2">
        {TAB_LIST.map((tab) => {
          const isActive = tab.key === activeKey;

          return (
            <button
              key={tab.key}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => {
                if (isActive) return;

                const nextState = stateByKey?.[tab.key];
                if (nextState) {
                  navigate(tab.path, { state: nextState });
                  return;
                }

                navigate(tab.path);
              }}
              className={`relative flex-1 py-3 text-center text-[15px] ${
                isActive
                  ? "font-extrabold text-slate-900"
                  : "font-medium text-slate-400"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-[10%] right-[10%] h-[3px] rounded-full bg-[#3F51B5]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default App_ProcessTabs;