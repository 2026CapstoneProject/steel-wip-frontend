function formatWipList(values = []) {
  return `[${values.join(", ")}]`;
}

function formatMinute(value) {
  return Number(value ?? 0).toFixed(1);
}

function formatEventMinute(value) {
  return Number(value ?? 0).toFixed(2);
}

function buildSolverText({ solverSummary, jobSchedule, craneSchedule }) {
  if (!solverSummary) return "";

  const lines = [
    "======================================================================",
    `Status: ${solverSummary.status}`,
    `Obj (총 이동 횟수 = PM + RS) : ${solverSummary.objective}`,
    `MIP Gap  : ${Number(solverSummary.mipGap ?? 0).toFixed(2)}%`,
    `Solutions: ${solverSummary.solutions}`,
    `Solve    : ${Number(solverSummary.solveSeconds ?? 0).toFixed(1)}s`,
    "======================================================================",
    "",
    "── Job Schedule ──────────────────────────────────────────",
    ...jobSchedule.map(
      (job) =>
        `  ${job.jobName} (seq=${job.sequence}): start=${formatMinute(job.startMinute).padStart(8, " ")}min  end=${formatMinute(job.endMinute).padStart(8, " ")}min  pick=${formatWipList(job.pickWips)}  output=${formatWipList(job.outputWips)}`,
    ),
    "",
    "── Crane Schedule ────────────────────────────────────────",
    "   t  Action          WIP   From    To   c[t](min)  Type",
    "──────────────────────────────────────────────────────────────────────",
    ...craneSchedule.map((row) => {
      const actionLabel = String(row.action ?? "").padEnd(10, " ");
      const wipLabel = String(row.steelWipId ?? "").padStart(4, " ");
      const fromLabel = String(row.fromLocation ?? "-").padStart(5, " ");
      const toLabel = String(row.toLocation ?? "-").padStart(5, " ");
      const minuteLabel = formatEventMinute(row.eventMinute).padStart(10, " ");
      const typeLabel = row.moveType ? `  ${row.moveType}` : "";
      return `  ${String(row.order).padStart(2, " ")}  ${actionLabel} ${wipLabel} ${fromLabel} ${toLabel} ${minuteLabel}${typeLabel}`;
    }),
  ];

  return lines.join("\n");
}

export default function Web_SolverResultSection({
  solverSummary,
  jobSchedule = [],
  craneSchedule = [],
}) {
  if (!solverSummary) return null;

  const text = buildSolverText({ solverSummary, jobSchedule, craneSchedule });

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-950 px-6 py-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-headline text-lg font-bold text-slate-50">
          Solver Result
        </h3>
        <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">
          {solverSummary.status}
        </span>
      </div>
      <pre className="overflow-x-auto whitespace-pre text-[13px] leading-6 text-slate-100">
        {text}
      </pre>
    </section>
  );
}
