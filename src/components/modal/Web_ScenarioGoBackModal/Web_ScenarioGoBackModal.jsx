export default function Web_ScenarioGoBackModal({
  onClose,
  onCancel,
  onNo,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]">
      <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-modal shadow-[0_40px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
        <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container">
          <h2 className="font-headline font-bold text-on-surface text-xl">
            뒤로가기
          </h2>
          <button
            type="button"
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-12 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-xl bg-[#FDE7E9] flex items-center justify-center">
            <span
              className="material-symbols-outlined text-error text-3xl"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              warning
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="font-headline font-bold text-xl text-on-surface leading-tight">
              기존 LANTEK 정보를 불러오시겠습니까?
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-[320px] mx-auto">
              아니오를 누르실 경우
              <br />
              <span className="font-semibold text-error">
                기존 입력된 정보는 삭제됩니다.
              </span>
            </p>
          </div>

          <div className="flex w-full gap-3 pt-2">
            <button
              type="button"
              className="flex-1 px-5 py-3 rounded-lg bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
              onClick={onCancel}
            >
              취소
            </button>

            <button
              type="button"
              className="flex-1 px-5 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
              onClick={onNo}
            >
              아니오
            </button>

            <button
              type="button"
              className="flex-1 px-5 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-dim text-white font-semibold shadow-md hover:opacity-95 transition-all"
              onClick={onConfirm}
            >
              예
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
