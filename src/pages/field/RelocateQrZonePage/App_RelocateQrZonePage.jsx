import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const fallbackRelocation = {
  id: "relocate-01",
  manufacturer: "유성 철주",
  material: "SM355A",
  specText: "18 x 2,438 x 6,096",
  weightText: "6,300 kg",
  from: {
    zone: "Zone A-1",
  },
  to: {
    zone: "Zone B-1",
  },
};

const scannerContainerStyle = {
  background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
};

const formatNowTime = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const App_RelocateQrZonePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const relocation = state?.relocation ?? fallbackRelocation;

  const scanState = state?.scanState ?? {
    wipScanned: false,
    wipScannedAt: "",
    zoneScanned: false,
    zoneScannedAt: "",
  };

  const badgeItems = useMemo(
    () => [
      {
        key: "toZone",
        icon: "location_on",
        label: relocation.to?.zone || relocation.toZone || "Zone B-1",
      },
    ],
    [relocation]
  );

  const handleMockScanSuccess = () => {
    navigate("/App/ready/relocate", {
      replace: true,
      state: {
        type: "RELOCATE_ZONE_SCAN_SUCCESS",
        scannedAt: formatNowTime(),
        relocation,
        scanState: {
          ...scanState,
          zoneScanned: true,
        },
      },
    });
  };

  const handlePrevious = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] pb-24 text-[#191C1E]">
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
        <section className="space-y-4 text-center">
          <h1 className="text-[32px] font-extrabold tracking-tight">
            구역 스캔
          </h1>

          <div className="flex items-center justify-center gap-3">
            {badgeItems.map((badge) => (
              <div
                key={badge.key}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#D0E1FB]/30 px-4 py-2 text-sm font-bold text-[#24389C]"
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  {badge.icon}
                </span>
                {badge.label}
              </div>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={handleMockScanSuccess}
          className="relative flex aspect-square w-full max-w-[340px] items-center justify-center overflow-hidden rounded-3xl shadow-2xl"
          style={scannerContainerStyle}
        >
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-white/5 bg-[#111] shadow-inner">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-transparent">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black shadow-lg">
                <div className="h-4 w-4 rounded-full border border-white/30 bg-[#333]" />
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

        <section className="flex w-full items-start gap-4 rounded-xl border-l-4 border-[#3F51B5] bg-white p-5 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)]">
          <div className="rounded-lg bg-[#3F51B5]/20 p-2">
            <span className="material-symbols-outlined text-2xl text-[#24389C]">
              qr_code_2
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-[#191C1E]">
              QR 코드를 중앙에 맞춰주세요
            </p>
            <p className="text-sm leading-relaxed text-[#505F76]">
              인식이 완료되면 자동으로 다음 단계로 넘어갑니다.
            </p>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full flex-col items-center rounded-t-xl bg-white shadow-[0_-4px_20px_rgba(25,28,30,0.06)]">
        <button
          type="button"
          onClick={handlePrevious}
          className="mx-6 my-4 flex w-[calc(100%-3rem)] items-center justify-center gap-2 rounded-xl bg-[#24389C]/10 py-4 text-sm font-semibold uppercase tracking-wider text-[#24389C] transition-all active:translate-y-0.5"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Previous
        </button>
      </nav>
    </div>
  );
};

export default App_RelocateQrZonePage;