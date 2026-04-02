import Web_ScenarioTaskTable from "../Web_ScenarioTaskTable/Web_ScenarioTaskTable";

export default function Web_ScenarioTimelineSection({ items }) {
  const getAccentTextClass = (type) => {
    if (type.includes("재배치")) return "text-primary";
    if (type.includes("피킹")) return "text-secondary";
    if (type.includes("적재")) return "text-emerald-600";
    return "text-primary";
  };

  return (
    <div className="relative">
      <div className="relative pl-8 border-l-2 border-surface-container-highest space-y-12">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <div
              className={`absolute -left-[41px] top-0 w-4 h-4 rounded-full ring-4 ${item.colorClass}`}
            ></div>

            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <span
                  className={`material-symbols-outlined ${item.iconColorClass}`}
                >
                  {item.icon}
                </span>
                {item.type}
                {item.subLabel && (
                  <span className="text-xs font-medium text-on-surface-variant">
                    {item.subLabel}
                  </span>
                )}
              </h3>
            </div>

            <Web_ScenarioTaskTable
              rows={item.rows}
              accentTextClass={getAccentTextClass(item.type)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
