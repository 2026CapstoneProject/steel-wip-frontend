import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const fallbackPicking = {
  id: "picking-raw-01",
  manufacturer: "현대 제철",
  material: "SS275",
  specText: "22 x 2,438 x 6,096",
  weightText: "7,698 kg",
  duration: "6m",
  expectedDurationText: "6m",
  expectedDurationMinutes: 6,
  to: {
    zone: "Position 2",
    time: "",
  },
  layout: {
    highlightedSlot: "2",
    slots: ["1", "2", "3", "4"],
    wallLabel: "벽",
    equipmentLabel: "설비",
  },
  pickingOrder: 2,
  totalPickingCount: 4,
  isLastPicking: false,
};

const formatNowTime = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const extractSlotNumber = (value) => {
  const match = String(value ?? "").match(/(\d+)/);
  return match ? match[1] : "";
};

const parseDurationMinutes = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const hourMatches = [...raw.matchAll(/(\d+)\s*h/gi)];
  const minuteMatches = [...raw.matchAll(/(\d+)\s*m/gi)];

  if (hourMatches.length || minuteMatches.length) {
    const hours = hourMatches.reduce(
      (sum, match) => sum + Number(match[1] || 0),
      0
    );
    const minutes = minuteMatches.reduce(
      (sum, match) => sum + Number(match[1] || 0),
      0
    );
    return hours * 60 + minutes;
  }

  const plainNumber = raw.match(/(\d+)/);
  return plainNumber ? Number(plainNumber[1]) : 0;
};

const formatPositionLabel = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (/position/i.test(raw)) return raw;
  if (/^\d+$/.test(raw)) return `Position ${raw}`;
  return raw;
};

const buildSpecText = (source) => {
  if (source?.specText) return source.specText;

  const thickness = source?.thickness ?? source?.spec?.thickness;
  const width = source?.width ?? source?.spec?.width;
  const length = source?.length ?? source?.spec?.length;

  if (thickness && width && length) {
    return `${thickness} x ${width} x ${length}`;
  }

  return fallbackPicking.specText;
};

const normalizePickingData = (source = {}) => {
  const rawPosition =
    source?.to?.zone ||
    source?.toZone ||
    source?.positionLabel ||
    source?.targetPositionLabel ||
    source?.targetPosition ||
    source?.position ||
    source?.layout?.highlightedSlot ||
    fallbackPicking.to.zone;

  const highlightedSlot = String(
    source?.layout?.highlightedSlot ||
      source?.highlightedSlot ||
      extractSlotNumber(rawPosition) ||
      fallbackPicking.layout.highlightedSlot
  );

  const toZone =
    formatPositionLabel(rawPosition) || `Position ${highlightedSlot}`;

  const expectedDurationText =
    source?.expectedDurationText || source?.duration || fallbackPicking.duration;

  const expectedDurationMinutes =
    typeof source?.expectedDurationMinutes === "number"
      ? source.expectedDurationMinutes
      : parseDurationMinutes(expectedDurationText);

  return {
    ...fallbackPicking,
    ...source,
    manufacturer:
      source?.manufacturer ||
      source?.maker ||
      source?.company ||
      fallbackPicking.manufacturer,
    material: source?.material || source?.grade || fallbackPicking.material,
    specText: buildSpecText(source),
    weightText:
      source?.weightText ||
      source?.weight ||
      source?.weightKg ||
      fallbackPicking.weightText,
    duration: source?.duration || expectedDurationText,
    expectedDurationText,
    expectedDurationMinutes,
    to: {
      ...fallbackPicking.to,
      ...(source?.to ?? {}),
      zone: toZone,
      time: source?.to?.time || source?.toTime || "",
    },
    layout: {
      ...fallbackPicking.layout,
      ...(source?.layout ?? {}),
      highlightedSlot,
    },
    pickingOrder:
      source?.pickingOrder ?? source?.order ?? fallbackPicking.pickingOrder,
    totalPickingCount:
      source?.totalPickingCount ??
      source?.totalCount ??
      fallbackPicking.totalPickingCount,
    isLastPicking:
      typeof source?.isLastPicking === "boolean"
        ? source.isLastPicking
        : fallbackPicking.isLastPicking,
  };
};

const InfoCard = ({ label, zone, time }) => {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-[#ECEEF0] p-4">
      <div className="rounded-full bg-[#24389C]/10 p-3">
        <span className="material-symbols-outlined text-[#24389C]">
          location_on
        </span>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[#505F76]">
          {label}
        </p>
        <p className="text-base font-bold text-[#191C1E]">
          {zone}
          {time ? (
            <span className="ml-1 text-xs font-normal text-[#505F76]">
              {time}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
};

const StepCircle = ({ type = "inactive" }) => {
  if (type === "done") {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#24389C]">
        <span
          className="material-symbols-outlined text-[14px] text-white"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          check
        </span>
      </div>
    );
  }

  if (type === "active") {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#24389C] ring-4 ring-[#DEE0FF]">
        <span
          className="material-symbols-outlined text-[14px] text-white"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          check
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#E0E3E5] bg-[#E6E8EA]">
      <span className="material-symbols-outlined text-[14px] text-[#505F76]">
        inventory_2
      </span>
    </div>
  );
};

const LayoutCard = ({ layout, highlightedSlot }) => {
  const slots = layout?.slots ?? ["1", "2", "3", "4"];
  const wallLabel = layout?.wallLabel ?? "벽";
  const equipmentLabel = layout?.equipmentLabel ?? "설비";

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#191C1E]">레이아웃</h2>
      </div>

      <div className="flex justify-center">
        <div className="relative inline-block min-w-[280px] rounded-lg bg-[#E0E0E0] p-6 pb-12 pr-16">
          <div className="absolute left-0 right-16 top-0 flex h-12 items-center justify-center rounded-t-lg bg-[#9E9E9E] text-base font-bold text-white">
            {equipmentLabel}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6">
            {slots.map((slot) => {
              const isHighlighted = String(slot) === String(highlightedSlot);

              return (
                <div
                  key={slot}
                  className={`flex h-32 w-24 items-center justify-center border text-2xl font-extrabold shadow-sm ${
                    isHighlighted
                      ? "border-transparent text-white shadow-md"
                      : "border-[#BDBDBD] bg-white text-[#191C1E]"
                  }`}
                  style={
                    isHighlighted
                      ? { backgroundColor: "rgba(54, 73, 172, 0.86)" }
                      : undefined
                  }
                >
                  {slot}
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
    </section>
  );
};

const DoubleCheckModal = ({ onNo, onYes }) => {
  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md" />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-8">
        <div className="w-full max-w-[320px] rounded-[16px] bg-white p-6 pt-10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <h3 className="mb-8 text-center text-[18px] font-bold leading-tight text-[#191C1E]">
            설비 위에 올리셨습니까?
          </h3>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onNo}
              className="h-[48px] flex-1 rounded-[8px] bg-[#E0E3E5] text-[15px] font-bold text-[#454652] transition-all active:scale-95"
            >
              아니오
            </button>

            <button
              type="button"
              onClick={onYes}
              className="h-[48px] flex-1 rounded-[8px] bg-[#24389C] text-[15px] font-bold text-white shadow-lg shadow-[#24389C]/20 transition-all active:scale-95"
            >
              네
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const CompleteModal = () => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
      <div className="flex w-full max-w-xs flex-col items-center gap-6 rounded-3xl bg-white p-10 shadow-2xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#24389C]/10">
          <span className="material-symbols-outlined text-5xl font-bold text-[#24389C]">
            check_circle
          </span>
        </div>

        <p className="text-center text-xl font-bold leading-tight tracking-tight text-[#191C1E]">
          이동이 완료되었습니다
        </p>
      </div>
    </div>
  );
};

const App_PickingRawPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const picking = useMemo(() => {
    const source =
      location.state?.picking ||
      location.state?.item ||
      location.state?.task ||
      fallbackPicking;

    return normalizePickingData(source);
  }, [location.state]);

  const currentPickingOrder =
    location.state?.pickingOrder ?? picking.pickingOrder ?? 1;

  const totalPickingCount =
    location.state?.totalPickingCount ?? picking.totalPickingCount ?? 4;

  const isLastPicking =
    typeof picking.isLastPicking === "boolean" && picking.isLastPicking
      ? true
      : currentPickingOrder >= totalPickingCount;

  const [movementState, setMovementState] = useState({
    isCompleted: false,
    toTime: "",
  });
  const [isDoubleCheckOpen, setIsDoubleCheckOpen] = useState(false);
  const [isCompletePopupOpen, setIsCompletePopupOpen] = useState(false);

  const statusText = movementState.isCompleted ? "이동 완료" : "이동 중";
  const progressWidth = movementState.isCompleted ? "100%" : "66.6667%";
  const blurClass =
    isDoubleCheckOpen || isCompletePopupOpen ? "blur-sm" : "";

  const highlightedSlot = useMemo(() => {
    return (
      picking.layout?.highlightedSlot ||
      extractSlotNumber(picking.to?.zone) ||
      "1"
    );
  }, [picking.layout?.highlightedSlot, picking.to?.zone]);

  const toDisplayTime = movementState.toTime || "";

  const completedPicking = useMemo(() => {
    return {
      ...picking,
      to: {
        ...picking.to,
        time: toDisplayTime,
      },
    };
  }, [picking, toDisplayTime]);

  useEffect(() => {
    if (!isCompletePopupOpen) return;

    const nextPath = isLastPicking ? "/App/processing" : "/App/ready";

    const timer = window.setTimeout(() => {
      navigate(nextPath, {
        replace: true,
        state: {
          completedPickingId: completedPicking.id,
          picking: completedPicking,
          pickingOrder: currentPickingOrder,
          totalPickingCount,
        },
      });
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    completedPicking,
    currentPickingOrder,
    isCompletePopupOpen,
    isLastPicking,
    navigate,
    totalPickingCount,
  ]);

  const handlePrevClick = () => {
    navigate(-1);
  };

  const handleSaveClick = () => {
    const savedAt = formatNowTime();
    setMovementState({
      isCompleted: true,
      toTime: savedAt,
    });
    setIsDoubleCheckOpen(true);
  };

  const handleDoubleCheckNo = () => {
    setIsDoubleCheckOpen(false);
    setMovementState({
      isCompleted: false,
      toTime: "",
    });
  };

  const handleDoubleCheckYes = () => {
    setIsDoubleCheckOpen(false);
    setIsCompletePopupOpen(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F9FB] pb-24 text-[#191C1E]">
      <header
        className={`fixed left-0 top-0 z-50 w-full bg-white/80 backdrop-blur-xl ${blurClass}`}
      >
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-6">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-2xl text-[#24389C]">
              factory
            </span>
          </div>

          <div className="flex items-center gap-5 text-[#454652]">
            <button type="button">
              <span className="material-symbols-outlined text-2xl">
                notifications
              </span>
            </button>
            <button type="button">
              <span className="material-symbols-outlined text-2xl">
                account_circle
              </span>
            </button>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto w-full max-w-md space-y-6 px-6 pb-6 pt-24 ${blurClass}`}
      >
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#191C1E]">원자재 상세 정보</h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(25,28,30,0.04)]">
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="mb-1 text-xs font-medium text-[#505F76]">제조사</p>
                <p className="font-semibold text-[#191C1E]">
                  {picking.manufacturer}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-[#505F76]">재질</p>
                <p className="font-semibold text-[#191C1E]">
                  {picking.material}
                </p>
              </div>

              <div className="col-span-2 pt-2">
                <p className="mb-1 text-xs font-medium text-[#505F76]">
                  규격 (두께 x 폭 x 길이)
                </p>
                <p className="text-lg font-bold text-[#24389C]">
                  {picking.specText}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-[#505F76]">중량</p>
                <p className="font-semibold text-[#191C1E]">
                  {picking.weightText}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <InfoCard
            label="TO"
            zone={picking.to?.zone}
            time={toDisplayTime}
          />
        </section>

        <section className="flex flex-col items-center py-4">
          <div className="relative mb-6 flex h-1 w-full max-w-xs items-center rounded-full bg-[#E6E8EA]">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[#24389C] transition-all"
              style={{ width: progressWidth }}
            />

            <div className="absolute inset-0 flex items-center justify-between">
              <StepCircle type="done" />
              <StepCircle type={movementState.isCompleted ? "done" : "active"} />
              <StepCircle type={movementState.isCompleted ? "done" : "inactive"} />
            </div>
          </div>

          <p className="rounded-full bg-[#24389C]/10 px-4 py-1 text-sm font-bold text-[#24389C]">
            {statusText}
          </p>
        </section>

        <section className="space-y-4">
          <LayoutCard
            layout={picking.layout}
            highlightedSlot={highlightedSlot}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveClick}
              className="flex items-center gap-2 rounded-xl px-10 py-4 font-bold transition bg-[#1A237E] text-white shadow-lg active:scale-95"
            >
              <span className="material-symbols-outlined">save</span>
              저장
            </button>
          </div>
        </section>
      </main>

      <nav
        className={`fixed bottom-0 left-0 z-50 flex w-full flex-col items-center rounded-t-xl bg-white shadow-[0_-4px_20px_rgba(25,28,30,0.06)] ${blurClass}`}
      >
        <button
          type="button"
          onClick={handlePrevClick}
          className="mx-6 my-4 flex w-[calc(100%-3rem)] items-center justify-center gap-2 rounded-xl bg-[#24389C]/10 py-4 text-sm font-semibold uppercase tracking-wider text-[#24389C] transition active:translate-y-0.5"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Previous
        </button>
      </nav>

      {isDoubleCheckOpen ? (
        <DoubleCheckModal
          onNo={handleDoubleCheckNo}
          onYes={handleDoubleCheckYes}
        />
      ) : null}

      {isCompletePopupOpen ? <CompleteModal /> : null}
    </div>
  );
};

export default App_PickingRawPage;