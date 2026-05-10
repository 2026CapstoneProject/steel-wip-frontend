const DEFAULT_PIECES = {
  case2: [
    {
      id: "1",
      label: "1",
      x: 0,
      y: 0,
      width: 96,
      height: 280,
    },
    {
      id: "2",
      label: "2",
      x: 120,
      y: 0,
      width: 96,
      height: 280,
    },
  ],

  case3: [
    {
      id: "1",
      label: "1",
      x: 0,
      y: 0,
      width: 96,
      height: 128,
    },
    {
      id: "2",
      label: "2",
      x: 0,
      y: 152,
      width: 96,
      height: 128,
    },
    {
      id: "3",
      aliases: ["long-2"],
      label: "3",
      x: 120,
      y: 0,
      width: 96,
      height: 280,
    },
  ],

  case4: [
    {
      id: "1",
      label: "1",
      x: 0,
      y: 0,
      width: 96,
      height: 128,
    },
    {
      id: "2",
      label: "2",
      x: 120,
      y: 0,
      width: 96,
      height: 128,
    },
    {
      id: "3",
      label: "3",
      x: 0,
      y: 152,
      width: 96,
      height: 128,
    },
    {
      id: "4",
      label: "4",
      x: 120,
      y: 152,
      width: 96,
      height: 128,
    },
  ],
};

const normalizeValue = (value) => String(value ?? "").trim().toLowerCase();

const normalizeLayoutType = (layout) => {
  const raw = normalizeValue(
    layout?.type ||
      layout?.layoutType ||
      layout?.caseType ||
      layout?.equipmentLayoutType
  );

  if (["2", "case2", "long"].includes(raw)) return "case2";
  if (["3", "case3", "mixed", "mix"].includes(raw)) return "case3";

  return "case4";
};

const isHighlightedPiece = (piece, highlightedSlot, layout) => {
  const targetValues = [
    highlightedSlot,
    layout?.highlightedSlot,
    layout?.highlightedPieceId,
    layout?.targetSlot,
    layout?.targetPieceId,
  ]
    .filter(Boolean)
    .map(normalizeValue);

  const pieceValues = [piece.id, ...(piece.aliases ?? [])]
    .filter(Boolean)
    .map(normalizeValue);

  return pieceValues.some((value) => targetValues.includes(value));
};

const normalizePieces = (pieces = []) => {
  return pieces.map((piece, index) => ({
    id: piece.id ?? piece.slot ?? piece.position ?? String(index + 1),
    aliases: piece.aliases ?? [],
    label: String(index + 1),
    x: piece.x ?? piece.left ?? 0,
    y: piece.y ?? piece.top ?? 0,
    width: piece.width ?? piece.w ?? 96,
    height: piece.height ?? piece.h ?? 128,
  }));
};

const App_EquipmentLayout = ({ layout = {}, highlightedSlot }) => {
  const layoutType = normalizeLayoutType(layout);

  const pieces = layout?.pieces?.length
    ? normalizePieces(layout.pieces)
    : DEFAULT_PIECES[layoutType];

  const wallLabel = layout?.wallLabel ?? "벽";
  const equipmentLabel = layout?.equipmentLabel ?? "설비";

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#191C1E]">레이아웃</h2>
      </div>

      <div className="rounded-xl bg-white p-6">
        <div className="flex justify-center">
          <div className="relative inline-block min-w-[280px] rounded-lg bg-[#E0E0E0] p-6 pb-12 pr-16">
            <div className="absolute left-0 right-16 top-0 flex h-12 items-center justify-center rounded-t-lg bg-[#9E9E9E] text-base font-bold text-white">
              {equipmentLabel}
            </div>

            <div className="relative mt-12 h-[280px] w-[216px]">
              {pieces.map((piece) => {
                const isHighlighted = isHighlightedPiece(
                  piece,
                  highlightedSlot,
                  layout
                );

                return (
                  <div
                    key={piece.id}
                    className={`absolute flex items-center justify-center border text-center text-3xl font-extrabold shadow-sm ${
                      isHighlighted
                        ? "border-transparent text-white shadow-md"
                        : "border-[#BDBDBD] bg-white text-[#191C1E]"
                    }`}
                    style={{
                      left: piece.x,
                      top: piece.y,
                      width: piece.width,
                      height: piece.height,
                      backgroundColor: isHighlighted
                        ? "rgba(54, 73, 172, 0.86)"
                        : undefined,
                    }}
                  >
                    {piece.label}
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-0 right-0 top-0 flex w-16 flex-col items-center justify-center">
              <div className="h-full w-4 bg-[#191C1E]" />
              <div className="absolute rounded bg-[#424242] px-2 py-3 text-xs font-bold text-white shadow-sm">
                {wallLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default App_EquipmentLayout;