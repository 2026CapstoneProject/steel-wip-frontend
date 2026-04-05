import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MOVE_NEXT_DELAY_MS = 250;

const App_ProcessingQrPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const moveTimerRef = useRef(null);

  const { generatedItems = [], batches = [], summary = {} } = location.state ?? {};

  const pendingItems = useMemo(
    () => generatedItems.filter((item) => item.status !== "complete"),
    [generatedItems]
  );

  const targetItem = pendingItems[0] ?? null;
  const [scanStatus, setScanStatus] = useState("idle");

  const moveToNextPage = (item) => {
    navigate("/App/processing/qr/wip", {
      state: {
        generatedWip: {
          ...item,
          scanCompletedAt: new Date().toISOString(),
        },
        generatedItems,
        batches,
        summary,
      },
    });
  };

  const handleScanComplete = () => {
    if (!targetItem || scanStatus === "recognized") return;

    setScanStatus("recognized");

    if (moveTimerRef.current) {
      window.clearTimeout(moveTimerRef.current);
    }

    moveTimerRef.current = window.setTimeout(() => {
      moveToNextPage(targetItem);
    }, MOVE_NEXT_DELAY_MS);
  };

  const handlePrevious = () => {
    if (moveTimerRef.current) {
      window.clearTimeout(moveTimerRef.current);
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] pb-24 text-slate-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-6">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-2xl text-[#24389C]">
              factory
            </span>
          </div>

          <div className="flex items-center gap-5 text-slate-700">
            <span className="material-symbols-outlined text-2xl">
              notifications
            </span>
            <span className="material-symbols-outlined text-2xl">
              account_circle
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-col items-center space-y-10 px-6 pt-12">
        <div className="space-y-4 text-center">
          <h1 className="text-[32px] font-extrabold tracking-tight text-slate-900">
            재공품 스캔
          </h1>
        </div>

        <button
          type="button"
          onClick={handleScanComplete}
          disabled={!targetItem || scanStatus === "recognized"}
          className={`relative aspect-square w-full max-w-[340px] overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0f0f0f_0%,#1a1a1a_100%)] shadow-2xl ${
            !targetItem || scanStatus === "recognized"
              ? "cursor-default"
              : "cursor-pointer active:scale-[0.99]"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-white/5 bg-[#111] shadow-inner">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-transparent">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black shadow-lg">
                  <div className="h-4 w-4 rounded-full border border-white/30 bg-[#333]" />
                </div>
              </div>

              <div className="absolute left-1/4 top-1/4 h-1 w-4 rotate-45 rounded-full bg-white/20 blur-[1px]" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-[200px] w-[200px]">
              <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-[#3F51B5]" />
              <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-[#3F51B5]" />
              <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-[#3F51B5]" />
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-[#3F51B5]" />
            </div>
          </div>
        </button>

        <div className="flex w-full items-start gap-4 rounded-xl border-l-4 border-[#3F51B5] bg-white p-5 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)]">
          <div className="rounded-lg bg-[#3F51B5]/20 p-2">
            <span className="material-symbols-outlined text-2xl text-[#24389C]">
              qr_code_2
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-slate-900">
              QR 코드를 중앙에 맞춰주세요
            </p>
            <p className="text-sm leading-relaxed text-slate-500">
                인식이 완료되면 자동으로 다음 단계로 넘어갑니다.
            </p>
          </div>
        </div>
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

export default App_ProcessingQrPage;