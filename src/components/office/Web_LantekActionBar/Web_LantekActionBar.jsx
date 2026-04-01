export default function Web_LantekActionBar({
  isScenarioDisabled,
  onTemporarySave,
  onScenarioCheck,
}) {
  return (
    <div className="fixed bottom-0 left-64 right-0 bg-surface-container-lowest border-t border-outline-variant/10 px-8 py-4 flex justify-end gap-3 z-30">
      <button
        type="button"
        onClick={onTemporarySave}
        className="px-6 py-3 rounded-xl bg-surface-container text-on-surface font-medium"
      >
        임시저장
      </button>

      <button
        type="button"
        disabled={isScenarioDisabled}
        onClick={onScenarioCheck}
        className={`px-6 py-3 rounded-xl font-bold ${
          isScenarioDisabled
            ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60"
            : "bg-gradient-to-r from-primary to-primary-dim text-white"
        }`}
      >
        시나리오 결과 확인
      </button>
    </div>
  );
}
