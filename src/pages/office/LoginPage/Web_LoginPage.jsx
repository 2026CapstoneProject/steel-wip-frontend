import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Web_LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();

    // 백엔드 로그인 연동 전 임시 이동
    navigate("/office/dashboard");
  };

  return (
    <main className="flex min-h-screen flex-col bg-surface font-body text-on-surface">
      <style>
        {`
          input[type="password"]::-ms-reveal,
          input[type="password"]::-ms-clear {
            display: none;
          }

          input[type="password"]::-webkit-credentials-auto-fill-button {
            visibility: hidden;
            display: none !important;
          }
        `}
      </style>

      <section className="flex flex-grow items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-[600px]">
          <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_40px_60px_-15px_rgba(42,52,57,0.06)]">
            <div className="h-1 bg-gradient-to-r from-primary to-primary-dim" />

            <div className="mx-auto max-w-[520px] px-10 pt-16 pb-10">
              <div className="mb-11 text-center">
                <h1 className="mb-3 font-headline text-[44px] font-extrabold leading-none tracking-tight text-[#24389c]">
                  Steel All
                </h1>
                <p className="font-body text-base text-on-surface-variant">
                  Login
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label
                    className="block px-1 font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                    htmlFor="user-id"
                  >
                    ID / Username
                  </label>

                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-outline-variant transition-colors group-focus-within:text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        person
                      </span>
                    </div>

                    <input
                      id="user-id"
                      type="text"
                      placeholder="Enter your ID"
                      className="w-full rounded-lg border-0 bg-surface-container-low py-3.5 pl-14 pr-4 text-on-surface transition-all placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label
                      className="block font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                      htmlFor="password"
                    >
                      Password
                    </label>
                  </div>

                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-outline-variant transition-colors group-focus-within:text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        lock
                      </span>
                    </div>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full rounded-lg border-0 bg-surface-container-low py-3.5 pl-14 pr-12 text-on-surface transition-all placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-outline-variant transition-colors hover:text-on-surface"
                      aria-label="비밀번호 보기 전환"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="-mt-2 flex justify-end px-1">
                  <button
                    type="button"
                    className="font-label text-xs font-medium text-on-surface-variant transition-colors hover:text-[#24389c]"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-dim py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
                >
                  <span>Login</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
              </form>

              <p className="mt-8 text-center font-label text-[13px] text-on-surface-variant">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="font-bold text-[#24389c] underline-offset-4 hover:underline"
                >
                  Register Now
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}