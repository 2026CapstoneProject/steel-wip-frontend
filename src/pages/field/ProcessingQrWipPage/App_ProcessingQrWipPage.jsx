import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const POPUP_DELAY_MS = 1200;

const formatScanTime = (value) => {
  if (!value) return "";

  try {
    return new Date(value).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return String(value);
  }
};

const App_ProcessingQrWipPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    generatedWip = {},
    generatedItems = [],
    batches = [],
    summary = {},
    zoneScanCompleted = false,
    zoneScannedAt = "",
  } = location.state ?? {};

  const [isSavePopupOpen, setIsSavePopupOpen] = useState(false);

  const detailData = useMemo(
    () => ({
      title: generatedWip.title ?? "발생한 재공품",
      manufacturer: generatedWip.manufacturer ?? "현대 제철",
      material:
        generatedWip.inputMaterialName ??
        generatedWip.materialName ??
        generatedWip.material ??
        "SM355A",
      specText:
        generatedWip.specText ??
        generatedWip.spec ??
        generatedWip.sizeText ??
        "16 x 715 x 1,890",
      weightText:
        generatedWip.weightText ??
        generatedWip.weight ??
        generatedWip.weightLabel ??
        "2,100 kg",
      zone: generatedWip.zone ?? generatedWip.toZone ?? "-",
    }),
    [generatedWip]
  );

  const displayedScanTime = useMemo(
    () => formatScanTime(zoneScannedAt),
    [zoneScannedAt]
  );

  useEffect(() => {
    if (!isSavePopupOpen) return;

    const timer = window.setTimeout(() => {
      navigate("/App/processing", {
        state: {
          savedGeneratedWipId: generatedWip.id,
          savedStatus: "complete",
          zoneScannedAt,
        },
      });
    }, POPUP_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isSavePopupOpen, navigate, generatedWip.id, zoneScannedAt]);

  const handleZoneScanClick = () => {
    navigate("/App/processing/qr/wip/zone", {
      state: {
        generatedWip,
        generatedItems,
        batches,
        summary,
        returnTo: "/App/processing/qr/wip",
      },
    });
  };

  const handleSaveClick = () => {
    if (!zoneScanCompleted) return;
    setIsSavePopupOpen(true);
  };

  const handlePrevious = () => {
    navigate(-1);
  };

  const wrapperBlurClass = isSavePopupOpen ? "blur-sm" : "";

  return (
    <div className="relative min-h-screen bg-[#f7f9fb] pb-40 text-slate-900">
      <header
        className={`sticky top-0 z-50 bg-white/80 backdrop-blur-xl ${wrapperBlurClass}`}
      >
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

      <main
        className={`mx-auto max-w-md space-y-6 px-6 pt-12 ${wrapperBlurClass}`}
      >
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">재공품 상세 정보</h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_rgba(25,28,30,0.04)]">
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">제조사</p>
                <p className="font-semibold text-slate-900">
                  {detailData.manufacturer}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">재질</p>
                <p className="font-semibold text-slate-900">
                  {detailData.material}
                </p>
              </div>

              <div className="col-span-2 pt-2">
                <p className="mb-1 text-xs font-medium text-slate-500">
                  규격 (두께 x 폭 x 길이)
                </p>
                <p className="text-lg font-bold text-[#24389c]">
                  {detailData.specText}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">중량</p>
                <p className="font-semibold text-slate-900">
                  {detailData.weightText}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 rounded-xl bg-[#eceef0] p-4">
            <div className="rounded-full bg-[#24389c]/10 p-3">
              <span className="material-symbols-outlined text-[#24389c]">
                location_on
              </span>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                To
              </p>
              <p className="text-base font-bold text-slate-900">
                {detailData.zone}
                {zoneScanCompleted && displayedScanTime ? (
                  <span className="ml-4 text-xs font-normal text-slate-500">
                    {displayedScanTime}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center py-4">
          <div className="relative mb-6 flex h-1 w-full max-w-xs items-center rounded-full bg-[#e6e8ea]">
            <div
              className={`absolute left-0 top-0 h-full rounded-full bg-[#24389c] ${
                zoneScanCompleted ? "w-full" : "w-2/3"
              }`}
            />

            <div className="absolute inset-0 flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#24389c]">
                <span
                  className="material-symbols-outlined text-[14px] text-white"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  check
                </span>
              </div>

              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full bg-[#24389c] ${
                  zoneScanCompleted ? "" : "ring-4 ring-[#dee0ff]"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[14px] text-white"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  check
                </span>
              </div>

              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  zoneScanCompleted
                    ? "bg-[#24389c]"
                    : "border-2 border-[#e6e8ea] bg-[#e0e3e5]"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[14px] ${
                    zoneScanCompleted ? "text-white" : "text-slate-500"
                  }`}
                  style={
                    zoneScanCompleted
                      ? { fontVariationSettings: '"FILL" 1' }
                      : undefined
                  }
                >
                  {zoneScanCompleted ? "check" : "inventory_2"}
                </span>
              </div>
            </div>
          </div>

          <p className="rounded-full bg-[#24389c]/10 px-4 py-1 text-sm font-bold text-[#24389c]">
            {zoneScanCompleted ? "이동 완료" : "이동 중"}
          </p>
        </section>

        <section className="relative space-y-4">
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
            <div className="relative mb-6 flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl bg-[#f2f4f6]">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-[#24389c]/30">
                  qr_code_2
                </span>
              </div>

              <div className="absolute left-6 top-6 h-8 w-8 rounded-tl-sm border-l-2 border-t-2 border-[#24389c]/40" />
              <div className="absolute right-6 top-6 h-8 w-8 rounded-tr-sm border-r-2 border-t-2 border-[#24389c]/40" />
              <div className="absolute bottom-6 left-6 h-8 w-8 rounded-bl-sm border-b-2 border-l-2 border-[#24389c]/40" />
              <div className="absolute bottom-6 right-6 h-8 w-8 rounded-br-sm border-b-2 border-r-2 border-[#24389c]/40" />
              <div className="absolute inset-x-10 top-1/2 h-[1px] bg-[#24389c]/20" />
            </div>

            <div className="w-full">
              <button
                type="button"
                onClick={handleZoneScanClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#24389c] to-[#3f51b5] py-4 font-bold text-white shadow-lg shadow-[#24389c]/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">
                  center_focus_weak
                </span>
                구역 scan
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={!zoneScanCompleted}
              className={`flex items-center gap-2 rounded-xl px-10 py-4 font-bold transition-all ${
                zoneScanCompleted
                  ? "bg-[#1a237e] text-white shadow-lg active:scale-95"
                  : "cursor-not-allowed bg-[#e6e8ea] text-slate-500 shadow-sm"
              }`}
            >
              <span className="material-symbols-outlined">save</span>
              저장
            </button>
          </div>
        </section>
      </main>

      <nav
        className={`fixed bottom-0 left-0 z-50 flex w-full flex-col items-center rounded-t-xl bg-white shadow-[0_-4px_20px_rgba(25,28,30,0.06)] ${wrapperBlurClass}`}
      >
        <button
          type="button"
          onClick={handlePrevious}
          className="mx-6 my-4 flex w-[calc(100%-3rem)] items-center justify-center gap-2 rounded-xl bg-[#24389c]/10 py-4 text-sm font-semibold uppercase tracking-wider text-[#24389c] transition-all active:translate-y-0.5"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Previous
        </button>
      </nav>

      {isSavePopupOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
          <div className="flex w-full max-w-sm flex-col items-center rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#3F51B5]/10">
              <span
                className="material-symbols-outlined text-4xl text-[#3F51B5]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                check_circle
              </span>
            </div>

            <h2 className="text-center text-2xl font-extrabold leading-tight text-slate-900">
              이동이 완료되었습니다
            </h2>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default App_ProcessingQrWipPage;