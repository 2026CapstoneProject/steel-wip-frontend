import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_Header from "../../../components/field/Header/App_Header";


const getTargetZone = (generatedWip = {}) =>
  generatedWip.zone ?? generatedWip.toZone ?? "-";

const App_ProcessingQrWipZonePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // state 없이 직접 접근 시 Processing 페이지로 리다이렉트
  React.useEffect(() => {
    if (!location.state?.generatedWip) {
      navigate("/App/processing", { replace: true });
    }
  }, []);

  const {
    generatedWip = {},
    generatedItems = [],
    batches = [],
    summary = {},
    returnTo = "/App/processing/qr/wip",
  } = location.state ?? {};

  const targetZone = useMemo(
    () => getTargetZone(generatedWip),
    [generatedWip]
  );

  const handleScanComplete = () => {
    const scannedAt = new Date().toISOString();

    navigate(returnTo, {
      state: {
        generatedWip,
        generatedItems,
        batches,
        summary,
        zoneScanCompleted: true,
        zoneScannedAt: scannedAt,
      },
    });
  };

  const handlePrevious = () => {
    navigate(-1);
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#f7f9fb] text-slate-900">
      <App_Header />

      <main className="mx-auto flex h-[calc(100dvh-72px)] max-w-md flex-col">
  <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-12 pb-28">
    <div className="flex flex-col items-center space-y-10">
      <section className="space-y-4 text-center">
        <h1 className="text-[32px] font-extrabold tracking-tight text-slate-900">
          구역 스캔
        </h1>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#d0e1fb]/30 px-4 py-2 text-sm font-bold text-[#24389c]">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            location_on
          </span>
          {targetZone}
        </div>
      </section>

      <button
        type="button"
        onClick={handleScanComplete}
        className="relative flex aspect-square w-full max-w-[340px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] shadow-2xl"
        aria-label="구역 QR 스캔 완료"
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
        <div className="rounded-lg bg-[#3F51B5]/10 p-2">
          <span className="material-symbols-outlined text-2xl text-[#24389c]">
            qr_code_2
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-base font-bold text-slate-900">
            QR 코드를 중앙에 맞춰주세요
          </p>
          <p className="text-sm leading-relaxed text-slate-600">
            인식이 완료되면 자동으로 다음 단계로 넘어갑니다.
          </p>
        </div>
      </section>
    </div>
  </div>
</main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full flex-col items-center rounded-t-xl bg-white shadow-[0_-4px_20px_rgba(25,28,30,0.06)]">
        <button
          type="button"
          onClick={handlePrevious}
          className="mx-6 my-4 flex w-[calc(100%-3rem)] items-center justify-center gap-2 rounded-xl bg-[#24389c]/10 py-4 text-sm font-semibold uppercase tracking-wider text-[#24389c] transition-all active:translate-y-0.5"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Previous
        </button>
      </nav>
    </div>
  );
};

export default App_ProcessingQrWipZonePage;