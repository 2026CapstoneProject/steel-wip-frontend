import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

const formatTime = (date) => {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
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
      time: source?.from?.time || source?.fromTime || "",
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
  };
};

export default function App_PickingWipQrPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const routeState = location.state || {};
  const returnPath = routeState.returnPath || "/App/ready/picking/wip";

  const picking = useMemo(() => {
    const source =
      routeState.picking ||
      routeState.item ||
      routeState.task ||
      fallbackPicking;

    return normalizePickingData(source);
  }, [routeState]);

  const handleScanComplete = () => {
    const scannedDate = new Date();
    const scannedAt = formatTime(scannedDate);
    const expectedDurationMinutes = Number.isFinite(picking.expectedDurationMinutes)
      ? picking.expectedDurationMinutes
      : 0;

    const estimatedToDate = new Date(
      scannedDate.getTime() + expectedDurationMinutes * 60 * 1000
    );
    const estimatedToTime = formatTime(estimatedToDate);

    const nextPicking = {
      ...picking,
      from: {
        ...picking.from,
        time: scannedAt,
      },
      to: {
        ...picking.to,
        time: estimatedToTime,
      },
    };

    navigate(returnPath, {
      replace: true,
      state: {
        ...routeState,
        type: "PICKING_WIP_QR_SUCCESS",
        scannedAt,
        estimatedToTime,
        picking: nextPicking,
        item: nextPicking,
        scanState: {
          ...(routeState.scanState ?? {}),
          qrScanned: true,
          fromTime: scannedAt,
          toTime: estimatedToTime,
          expectedDurationMinutes,
        },
      },
    });
  };

  const handlePrev = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#191C1E] pb-24">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-2xl text-[#24389C]">
              factory
            </span>
          </div>

          <div className="flex items-center gap-5 text-[#454652]">
            <span className="material-symbols-outlined text-2xl">
              notifications
            </span>
            <span className="material-symbols-outlined text-2xl">
              account_circle
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col items-center space-y-10 px-6 pt-12">
        <div className="space-y-4 text-center">
          <h1 className="text-[32px] font-extrabold tracking-tight text-[#191C1E]">
            재공품 스캔
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D0E1FB]/30 px-4 py-2 text-sm font-bold text-[#24389C]">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                inventory_2
              </span>
              {picking.material}
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D0E1FB]/30 px-4 py-2 text-sm font-bold text-[#24389C]">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                location_on
              </span>
              {picking.from?.zone} → {picking.to?.zone}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleScanComplete}
          className="relative flex aspect-square w-full max-w-[340px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] shadow-2xl"
          aria-label="재공품 QR 스캔 완료 처리"
        >
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-white/5 bg-[#111111] shadow-inner">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-transparent">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black shadow-lg">
                <div className="h-4 w-4 rounded-full border border-white/30 bg-[#333333]" />
              </div>
            </div>

            <div className="absolute left-1/4 top-1/4 h-1 w-4 rotate-45 rounded-full bg-white/20 blur-[1px]" />
          </div>

          <div className="pointer-events-none absolute h-[200px] w-[200px]">
            <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-[#3F51B5]" />
            <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-[#3F51B5]" />
            <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-[#3F51B5]" />
            <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-[#3F51B5]" />
          </div>
        </button>

        <div className="flex w-full items-start gap-4 rounded-xl border-l-4 border-[#3F51B5] bg-white p-5 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)]">
          <div className="rounded-lg bg-[#3F51B5]/10 p-2">
            <span className="material-symbols-outlined text-2xl text-[#24389C]">
              qr_code_2
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-[#191C1E]">
              재공품 QR 코드를 중앙에 맞춰주세요
            </p>
            <p className="text-sm leading-relaxed text-[#505F76]">
              현재는 실제 카메라 연동 전 단계이므로, 검정 스캔 박스를 누르면
              인식 완료 처리 후 이전 화면으로 돌아갑니다.
            </p>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full flex-col items-center rounded-t-xl bg-white shadow-[0_-4px_20px_rgba(25,28,30,0.06)]">
        <button
          type="button"
          onClick={handlePrev}
          className="mx-6 my-4 flex w-[calc(100%-3rem)] flex-row items-center justify-center gap-2 rounded-xl bg-[#24389C]/10 py-4 text-sm font-semibold uppercase tracking-wider text-[#24389C] transition-all active:translate-y-0.5"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Previous
        </button>
      </nav>
    </div>
  );
}