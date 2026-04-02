export default function Web_ScenarioAddModal({ onClose, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]">
      <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-modal shadow-[0_40px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
        <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container">
          <h2 className="font-headline font-bold text-on-surface text-xl">
            시나리오 이력 추가
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
          <div className="space-y-3">
            <h1 className="font-headline font-bold text-xl text-on-surface leading-tight">
              시나리오 이력을 추가하시겠습니까?
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-[320px] mx-auto">
              이력 추가 시 시나리오가 저장되며
              <br />
              시나리오 생성 이력 페이지로 이동됩니다.
            </p>
          </div>
        </div>

        <div className="px-8 py-6 bg-surface-container-low flex justify-center gap-3">
          <button
            type="button"
            className="px-6 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant font-medium hover:bg-surface-container-highest transition-colors"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dim shadow-md transition-all active:scale-95"
            onClick={onConfirm}
          >
            네, 확인했습니다.
          </button>
        </div>
      </div>
    </div>
  );
}
