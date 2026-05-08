import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const App_LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    // 현재 백엔드 연동 전이므로 로그인 버튼 클릭 시 시작 화면으로 이동
    navigate("/App/start");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F9FB] px-6 py-10 font-['Inter'] text-[#191C1E]">
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

      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-[#DEE0FF]/40 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-[#D0E1FB]/30 blur-[100px]" />

      <main className="z-10 w-full max-w-[400px]">
        {/* Header Branding */}
        <div className="mb-10">
          <h1 className="font-['Manrope'] text-5xl font-extrabold leading-none tracking-tight text-[#24389C]">
            Steel All
          </h1>
          <p className="mt-3 ml-1 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[#505F76]">
            Login
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-[#C5C5D4]/20 bg-white px-8 py-10 shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
          <form className="space-y-7" onSubmit={handleLogin}>
            {/* ID Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="ml-1 text-[11px] font-bold uppercase tracking-widest text-[#505F76]"
              >
                ID / USERNAME
              </label>

              <div className="group relative rounded-lg border-2 border-transparent bg-[#F2F4F6] transition-all duration-200 focus-within:border-[#191C1E] focus-within:bg-white">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#A8B0B8] transition-colors group-focus-within:text-[#4355D9]">
                  <span className="material-symbols-outlined text-lg">
                    person
                  </span>
                </div>

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your ID"
                  className="block w-full rounded-lg border-0 bg-transparent py-4 pl-14 pr-4 text-sm text-[#191C1E] placeholder-[#757684]/60 transition-all focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="ml-1 text-[11px] font-bold uppercase tracking-widest text-[#505F76]"
              >
                PASSWORD
              </label>

              <div className="group relative rounded-lg border-2 border-transparent bg-[#F2F4F6] transition-all duration-200 focus-within:border-[#191C1E] focus-within:bg-white">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#A8B0B8] transition-colors group-focus-within:text-[#4355D9]">
                  <span className="material-symbols-outlined text-lg">
                    lock
                  </span>
                </div>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border-0 bg-transparent py-4 pl-14 pr-12 text-sm text-[#191C1E] placeholder-[#757684]/60 transition-all focus:outline-none focus:ring-0"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#A8B0B8] transition-colors hover:text-[#24389C]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="-mt-3 flex justify-end">
              <button
                type="button"
                className="text-[11px] font-medium text-[#505F76] transition-colors hover:text-[#24389C]"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#24389C] to-[#3F51B5] py-4 font-['Manrope'] font-bold text-white shadow-lg shadow-[#24389C]/20 transition-all duration-200 active:scale-95"
            >
              <span>Login</span>
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[13px] text-[#505F76]">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="font-bold text-[#24389C] underline-offset-4 hover:underline"
          >
            Register Now
          </button>
        </p>
      </main>
    </div>
  );
};

export default App_LoginPage;