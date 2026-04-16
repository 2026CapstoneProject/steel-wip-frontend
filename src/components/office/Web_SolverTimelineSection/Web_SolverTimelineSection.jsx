import Web_ScenarioTaskTable from "../Web_ScenarioTaskTable/Web_ScenarioTaskTable";

const ACTION_META = {
  RELOCATE: {
    title: "재배치 (Relocation)",
    icon: "sync_alt",
    colorClass: "bg-primary ring-surface",
    iconColorClass: "text-primary",
    accentTextClass: "text-primary",
  },
  PICK: {
    title: "피킹 (Picking)",
    icon: "inventory",
    colorClass: "bg-red-500 ring-surface",
    iconColorClass: "text-secondary",
    accentTextClass: "text-secondary",
  },
  STORE: {
    title: "적재 (Inbound)",
    icon: "layers",
    colorClass: "bg-emerald-500 ring-surface",
    iconColorClass: "text-emerald-600",
    accentTextClass: "text-emerald-600",
  },
};

function mapLocationLabel(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "-";
  if (raw === "설비") return raw;

  const zoneMap = {
    "1": "A-1",
    "2": "A-2",
    "3": "A-3",
    "4": "A-4",
  };

  return zoneMap[raw] ?? raw;
}

function formatScenarioQr(itemDetail, steelWipId) {
  if (itemDetail?.qrCode) return itemDetail.qrCode;
  return `QR-WIP-${String(steelWipId ?? "").padStart(3, "0")}`;
}

function mapCraneActionToBatchAction(action) {
  if (action === "RELOCATE") return "재배치";
  if (action === "PICK") return "피킹";
  if (action === "STORE") return "적재";
  return action;
}

function createBatchItemLookup(batchItems = []) {
  const lookup = new Map();

  batchItems.forEach((item, index) => {
    const action = String(item.batchItemAction ?? "").trim();
    const key = `${action}:${item.steelWipId}:${index}`;
    lookup.set(key, item);
  });

  return Array.from(lookup.values());
}

function findMatchingBatchItem(batchItems, action, steelWipId) {
  const batchAction = mapCraneActionToBatchAction(action);
  return (
    batchItems.find(
      (item) =>
        item.batchItemAction === batchAction &&
        Number(item.steelWipId) === Number(steelWipId),
    ) ?? null
  );
}

function buildSequentialGroups(craneSchedule = [], batchItems = []) {
  const details = createBatchItemLookup(batchItems);
  const groups = [];

  craneSchedule.forEach((row) => {
    const action = String(row.action ?? "").trim();
    const meta = ACTION_META[action];
    if (!meta) return;

    const itemDetail = findMatchingBatchItem(details, action, row.steelWipId);
    const nextRow = {
      qrNumber: row?.qrCode
        ? formatScenarioQr(row, row.steelWipId)
        : formatScenarioQr(itemDetail, row.steelWipId),
      thickness: row?.thickness ?? itemDetail?.thickness ?? "-",
      width: row?.width ?? itemDetail?.width ?? "-",
      length: row?.length ?? itemDetail?.length ?? "-",
      from: mapLocationLabel(row.fromLocation ?? itemDetail?.fromLocation),
      to: mapLocationLabel(row.toLocation ?? itemDetail?.toLocation),
      estimatedTime: Number(row.eventMinute ?? 0).toFixed(2),
      status: row.moveType ?? "-",
      statusClass: "bg-surface-container-highest text-on-surface-variant",
    };

    const currentGroup = groups[groups.length - 1];
    if (currentGroup && currentGroup.action === action) {
      currentGroup.rows.push(nextRow);
      currentGroup.subLabel = `${currentGroup.rows.length}건`;
      return;
    }

    groups.push({
      id: `${action}-${row.order}`,
      action,
      type: meta.title,
      icon: meta.icon,
      colorClass: meta.colorClass,
      iconColorClass: meta.iconColorClass,
      accentTextClass: meta.accentTextClass,
      subLabel: "1건",
      rows: [nextRow],
    });
  });

  return groups;
}

export default function Web_SolverTimelineSection({
  craneSchedule = [],
  batchItems = [],
}) {
  const items = buildSequentialGroups(craneSchedule, batchItems);

  return (
    <div className="relative">
      <div className="relative space-y-12 border-l-2 border-surface-container-highest pl-8">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <div
              className={`absolute -left-[41px] top-0 h-4 w-4 rounded-full ring-4 ${item.colorClass}`}
            ></div>

            <div className="mb-4 flex items-center gap-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-on-surface">
                <span
                  className={`material-symbols-outlined ${item.iconColorClass}`}
                >
                  {item.icon}
                </span>
                {item.type}
                <span className="text-xs font-medium text-on-surface-variant">
                  {item.subLabel}
                </span>
              </h3>
            </div>

            <Web_ScenarioTaskTable
              rows={item.rows}
              accentTextClass={item.accentTextClass}
              timeHeaderLabel="c[t](min)"
              statusHeaderLabel="Type"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
