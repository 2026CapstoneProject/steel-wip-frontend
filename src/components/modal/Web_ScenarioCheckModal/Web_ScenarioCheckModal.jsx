export default function Web_ScenarioCheckModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]">
      <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-modal shadow-[0_40px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
        <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container">
          <h2 className="font-headline font-bold text-on-surface text-xl">
            시나리오 결과 확인
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
              시나리오 결과를 확인하시겠습니까?
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-[320px] mx-auto">
              입력하신 자재 정보의 수정이 불가하오니
              <br />
              <span className="font-semibold text-error">
                신중하시길 바랍니다.
              </span>
            </p>
          </div>

          <div className="flex w-full gap-3 pt-2">
            <button
              type="button"
              className="flex-1 px-5 py-3 rounded-lg bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="button"
              className="flex-1 px-5 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-dim text-white font-semibold shadow-md hover:opacity-95 transition-all"
              onClick={onConfirm}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
