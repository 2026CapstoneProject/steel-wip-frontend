import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_Header from "../../../components/field/Header/App_Header";
import { saveBatchItem } from "../../../services/fieldService";

const fallbackPicking = {
  id: "picking-wip-01",
  manufacturer: "현대 제철",
  material: "SS275",
  specText: "22 x 2,438 x 6,096",
  weightText: "7,698 kg",
  duration: "6m",
  expectedDurationText: "6m",
  expectedDurationMinutes: 6,
  from: {
    zone: "Zone C-3",
    time: "",
  },
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
  const currentZone =
    source?.currentZone ||
    source?.current?.zone ||
    source?.from?.zone ||
    source?.zone ||
    fallbackPicking.from.zone;

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
    from: {
      ...fallbackPicking.from,
      ...(source?.from ?? {}),
      zone: currentZone,
      time: source?.from?.time || "",
    },
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
      </div>
    </section>
  );
};

const App_PickingWipPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const processedScanKeyRef = useRef("");
  const completeTimerRef = useRef(null);

  // state 없이 직접 접근 시 Ready 페이지로 리다이렉트
  useEffect(() => {
    if (!location.state?.picking && !location.state?.item && !location.state?.task) {
      navigate("/App/ready", { replace: true });
    }
  }, []);

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

  const [scanState, setScanState] = useState({
    qrScanned: location.state?.scanState?.qrScanned ?? false,
    fromTime: location.state?.scanState?.fromTime ?? "",
    toTime: location.state?.scanState?.toTime ?? "",
  });

  const [isDoubleCheckOpen, setIsDoubleCheckOpen] = useState(false);
  const [isCompletePopupOpen, setIsCompletePopupOpen] = useState(false);

  const isCompleted = scanState.qrScanned;
  const isSaveEnabled = isCompleted;
  const isExitLocked = scanState.qrScanned;

  const statusText = isCompleted ? "이동 완료" : "이동 중";
  const progressWidth = isCompleted ? "100%" : "66.6667%";
  const blurClass =
    isDoubleCheckOpen || isCompletePopupOpen ? "blur-sm" : "";

  const highlightedSlot = useMemo(() => {
    return (
      picking.layout?.highlightedSlot ||
      extractSlotNumber(picking.to?.zone) ||
      "2"
    );
  }, [picking.layout?.highlightedSlot, picking.to?.zone]);

  const fromDisplayTime = scanState.fromTime || "";
  const toDisplayTime = scanState.toTime || "";

  const completedPicking = useMemo(() => {
    return {
      ...picking,
      from: {
        ...picking.from,
        time: fromDisplayTime,
      },
      to: {
        ...picking.to,
        time: toDisplayTime,
      },
    };
  }, [picking, fromDisplayTime, toDisplayTime]);

  useEffect(() => {
    const returnedState = location.state;
    if (!returnedState?.type) return;

    const currentKey = `${location.key}-${returnedState.type}-${returnedState.scannedAt || ""}`;
    if (processedScanKeyRef.current === currentKey) return;
    processedScanKeyRef.current = currentKey;

    if (returnedState.type === "PICKING_WIP_QR_SUCCESS") {
      const nextFromTime =
        returnedState?.scanState?.fromTime ||
        returnedState?.scannedAt ||
        returnedState?.picking?.from?.time ||
        formatNowTime();

      const nextToTime =
        returnedState?.scanState?.toTime ||
        returnedState?.estimatedToTime ||
        returnedState?.picking?.to?.time ||
        "";

      setScanState({
        qrScanned: true,
        fromTime: nextFromTime,
        toTime: nextToTime,
      });
    }
  }, [location.key, location.state]);

  useEffect(() => {
    if (!isCompletePopupOpen) return;

    const nextPath = isLastPicking ? "/App/processing" : "/App/ready";

    completeTimerRef.current = window.setTimeout(() => {
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
      if (completeTimerRef.current) {
        window.clearTimeout(completeTimerRef.current);
      }
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
  if (isExitLocked) return;
  navigate(-1);
};

  const handleScanClick = () => {
    navigate("qr", {
      relative: "path",
      state: {
        ...location.state,
        returnPath: location.pathname,
        picking: completedPicking,
        item: completedPicking,
        pickingOrder: currentPickingOrder,
        totalPickingCount,
        scanState,
      },
    });
  };

  const handleSaveClick = () => {
    if (!isSaveEnabled) return;
    setIsDoubleCheckOpen(true);
  };

  const handleDoubleCheckNo = () => {
    setIsDoubleCheckOpen(false);
  };

  const handleDoubleCheckYes = async () => {
    setIsDoubleCheckOpen(false);
    try {
      const batchItemId = picking.batchItemId;
      if (!batchItemId) {
        alert("작업 정보를 찾을 수 없어 완료 처리할 수 없습니다.");
        return;
      }
      await saveBatchItem(batchItemId, {});
      setIsCompletePopupOpen(true);
    } catch (err) {
      console.error("작업 완료 처리 실패:", err);
      alert("작업 완료 처리에 실패했습니다.");
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#F7F9FB] text-[#191C1E]">
      <App_Header />

{isExitLocked && (
  <div
    className="pointer-events-none fixed left-1/2 top-0 z-[60] h-[72px] w-full max-w-md -translate-x-1/2"
    aria-hidden="true"
  >
    <div className="pointer-events-auto h-full w-[180px]" />
  </div>
)}

      <main
        className={`mx-auto flex h-[calc(100dvh-72px)] w-full max-w-md flex-col ${blurClass}`}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-28 pt-24">
          <div className="space-y-6 pb-6">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#191C1E]">
                  재공품 상세 정보
                </h2>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(25,28,30,0.04)]">
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <p className="mb-1 text-xs font-medium text-[#505F76]">
                      제조사
                    </p>
                    <p className="font-semibold text-[#191C1E]">
                      {picking.manufacturer}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-medium text-[#505F76]">
                      재질
                    </p>
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
                    <p className="mb-1 text-xs font-medium text-[#505F76]">
                      중량
                    </p>
                    <p className="font-semibold text-[#191C1E]">
                      {picking.weightText}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4">
              <InfoCard
                label="FROM"
                zone={picking.from?.zone}
                time={fromDisplayTime}
              />
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
                  <StepCircle type={isCompleted ? "done" : "active"} />
                  <StepCircle type={isCompleted ? "done" : "inactive"} />
                </div>
              </div>

              <p className="rounded-full bg-[#24389C]/10 px-4 py-1 text-sm font-bold text-[#24389C]">
                {statusText}
              </p>
            </section>

            <section className="relative space-y-4">
              <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
                <div className="relative mb-6 flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl bg-[#ECEEF0]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-[#24389C]/30">
                      qr_code_2
                    </span>
                  </div>

                  <div className="absolute left-6 top-6 h-8 w-8 rounded-tl-sm border-l-2 border-t-2 border-[#24389C]/40" />
                  <div className="absolute right-6 top-6 h-8 w-8 rounded-tr-sm border-r-2 border-t-2 border-[#24389C]/40" />
                  <div className="absolute bottom-6 left-6 h-8 w-8 rounded-bl-sm border-b-2 border-l-2 border-[#24389C]/40" />
                  <div className="absolute bottom-6 right-6 h-8 w-8 rounded-br-sm border-b-2 border-r-2 border-[#24389C]/40" />
                  <div className="absolute inset-x-10 top-1/2 h-px bg-[#24389C]/20" />
                </div>

                <div className="w-full">
                  <button
                    type="button"
                    onClick={handleScanClick}
                    disabled={isCompleted}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold transition ${
                      isCompleted
                        ? "cursor-not-allowed bg-[#E6E8EA] text-[#757684]"
                        : "bg-gradient-to-br from-[#24389c] to-[#3f51b5] text-white shadow-lg shadow-[#24389C]/20 active:scale-95"
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      center_focus_weak
                    </span>
                    재공품 scan
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={!isSaveEnabled}
                  className={`flex items-center gap-2 rounded-xl px-10 py-4 font-bold transition ${
                    isSaveEnabled
                      ? "bg-[#1A237E] text-white shadow-lg active:scale-95"
                      : "cursor-not-allowed bg-[#E6E8EA] text-[#757684]"
                  }`}
                >
                  <span className="material-symbols-outlined">save</span>
                  저장
                </button>
              </div>

              <LayoutCard
                layout={picking.layout}
                highlightedSlot={highlightedSlot}
              />
            </section>
          </div>
        </div>
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

      {isDoubleCheckOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
          <div className="flex w-full max-w-sm flex-col items-center rounded-[28px] bg-white p-8 shadow-2xl">
            <p className="mb-8 text-center text-xl font-bold text-[#191C1E]">
              설비 위에 올리셨습니까?
            </p>

            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={handleDoubleCheckNo}
                className="flex-1 rounded-2xl bg-[#E6E8EA] px-6 py-4 font-bold text-[#191C1E] transition active:scale-95"
              >
                아니오
              </button>

              <button
                type="button"
                onClick={handleDoubleCheckYes}
                className="flex-1 rounded-2xl bg-[#24389C] px-6 py-4 font-bold text-white shadow-lg shadow-[#24389C]/20 transition active:scale-95"
              >
                네
              </button>
            </div>
          </div>
        </div>
      )}

      {isCompletePopupOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
          <div className="flex w-full max-w-xs flex-col items-center gap-6 rounded-3xl bg-white p-10 shadow-2xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#24389C]/10">
              <span className="material-symbols-outlined text-5xl text-[#24389C]">
                check_circle
              </span>
            </div>

            <p className="text-center text-xl font-bold leading-tight text-[#191C1E]">
              이동이 완료되었습니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App_PickingWipPage;
