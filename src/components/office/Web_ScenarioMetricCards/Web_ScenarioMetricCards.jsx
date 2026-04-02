export default function Web_ScenarioMetricCards({
  metrics,
  equipmentName,
  status,
}) {
  return (
    <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`p-5 rounded-xl border-0 flex flex-col justify-between ${
            metric.highlight
              ? "bg-primary-container"
              : "bg-surface-container-low"
          }`}
        >
          <span
            className={`text-xs font-semibold ${
              metric.highlight
                ? "text-on-primary-container"
                : "text-on-surface-variant"
            }`}
          >
            {metric.label}
          </span>

          <div className="mt-4 flex items-baseline gap-1">
            <span
              className={`text-3xl font-extrabold font-headline ${
                metric.highlight
                  ? "text-on-primary-container"
                  : "text-on-surface"
              }`}
            >
              {metric.value}
            </span>
            <span
              className={`text-sm ${
                metric.highlight
                  ? "text-on-primary-container"
                  : "text-on-surface-variant"
              }`}
            >
              {metric.unit}
            </span>
          </div>
        </div>
      ))}

      <div className="col-span-full bg-surface-container-highest p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-on-surface-variant">
            factory
          </span>
          <span className="text-sm font-semibold text-on-surface-variant">
            설비 명:
          </span>
          <span className="text-sm font-bold text-on-surface">
            {equipmentName}
          </span>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1 bg-surface-container-lowest text-[10px] font-bold rounded-full">
            STATUS: {status}
          </span>
        </div>
      </div>
    </div>
  );
}
