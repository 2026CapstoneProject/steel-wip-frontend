export default function Web_LoadingModal({
  message = "페이지가 로딩 중입니다.",
}) {
  return (
    <>
      <style>
        {`
          @keyframes web-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
        <div className="bg-white w-[320px] h-[320px] rounded-lg shadow-sm flex flex-col items-center justify-center gap-8">
          <div
            className="w-16 h-16 rounded-full"
            style={{
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #3f51b5",
              animation: "web-spin 1s linear infinite",
            }}
          />

          <div className="flex flex-col items-center gap-2">
            <p className="font-headline font-semibold text-xl text-on-surface tracking-tight">
              {message}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
