import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../services/authService";
import useAuthStore from "../../../store/useAuthStore";

export default function Web_LoginPage() {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setErrorMsg("");
		try {
			const res = await authService.login(username, password);
			const { accessToken, user } = res.data;
			useAuthStore.getState().setUser(user, accessToken);

			// role에 따라 이동 경로 분기
			if (user.role === "OFFICE") navigate("/office/dashboard");
			else navigate("/App/start");
		} catch (err) {
			setErrorMsg(
				err.response?.data?.message || "아이디 또는 비밀번호를 확인해주세요.",
			);
		} finally {
			setLoading(false);
		}
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
											value={username}
											onChange={(e) => setUsername(e.target.value)}
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
											value={password}
											onChange={(e) => setPassword(e.target.value)}
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

								{/* <div className="-mt-2 flex justify-end px-1">
									<button
										type="button"
										className="font-label text-xs font-medium text-on-surface-variant transition-colors hover:text-[#24389c]"
									>
										Forgot Password?
									</button>
								</div> */}

								<button
									type="submit"
									disabled={loading}
									className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-dim py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
								>
									<span>{loading ? "로그인 중..." : "Login"}</span>
									<span className="material-symbols-outlined text-[18px]">
										arrow_forward
									</span>
								</button>
							</form>

							{/* <p className="mt-8 text-center font-label text-[13px] text-on-surface-variant">
								Don&apos;t have an account?{" "}
								<button
									type="button"
									className="font-bold text-[#24389c] underline-offset-4 hover:underline"
								>
									Register Now
								</button>
							</p> */}
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
