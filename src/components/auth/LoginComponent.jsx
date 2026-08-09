import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useLoginMutation } from "../../features/auth/authApi";
import { setCredentials } from "../../features/auth/authSlice";
import { useAppDispatch } from "../../lib/hook.js";
import { loginSchema } from "../../features/auth/authSchemas";
import { GoogleLoginComponent } from "../oauth/GoogleComponent";

const DEMO_EMAIL = "demo6090619@web-library.net";
const DEMO_PASSWORD = "StrongPass1@";

function apiErrorMessage(err) {
  return (
    err.data?.description ||
    err.data?.message ||
    err.message ||
    "Invalid email or password."
  );
}

export default function LoginComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard/products";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });

  const fillDemoData = () => {
    reset({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    setError("");
  };

  const onSubmit = async ({ email, password }) => {
    setError("");
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(
        setCredentials({
          token: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        }),
      );
      navigate(redirectTo);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <section className="bg-gray-100 min-h-screen flex box-border justify-center items-center px-4 py-8">
      <div className="rounded-2xl flex max-w-3xl w-full p-5 items-center">
        <div className="md:w-1/2 px-4 sm:px-8 w-full">
          <h2 className="font-bold text-3xl text-[#002D74]">Login</h2>
          <p className="text-sm mt-4 text-[#002D74]">
            If you already a member, easily log in now.
          </p>

          <button
            type="button"
            onClick={fillDemoData}
            className="mt-4 w-full border border-[#002D74] bg-[#002D7415] text-[#002D74] py-2 rounded-xl text-sm font-medium hover:bg-[#002D7430] duration-300"
          >
            ✨ Autofill demo login
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <input
                className="p-2 mt-8 rounded-xl border w-full"
                type="email"
                name="email"
                placeholder="Email"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <div className="relative">
                <input
                  className="p-2 rounded-xl border w-full"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Password"
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer z-20"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <button
              className="bg-[#002D74] text-white py-2 rounded-xl hover:scale-105 duration-300 hover:bg-[#206ab1] font-medium disabled:opacity-60"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Logging in…" : "Login"}
            </button>
          </form>
          <div className="mt-6  items-center text-gray-100">
            <hr className="border-gray-300" />
            <p className="text-center text-sm">OR</p>
            <hr className="border-gray-300" />
          </div>
          <GoogleLoginComponent label="Login with Google" redirectTo={redirectTo} />
          <div className="mt-10 text-sm border-b border-gray-500 py-5 playfair tooltip">
            Forget password?
          </div>
          <div className="mt-4 text-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <p className="mr-3 md:mr-0 ">If you don't have an account..</p>
            <Link
              to="/auth/register"
              className="hover:border register text-white bg-[#002D74] hover:border-gray-400 rounded-xl py-2 px-5 hover:scale-110 hover:bg-[#002c7424] font-semibold duration-300"
            >
              Register
            </Link>
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs text-gray-500 hover:text-[#002D74] hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        </div>
        <div className="md:block hidden w-1/2">
          <img
            className="rounded-2xl max-h-[1600px]"
            src="https://images.unsplash.com/photo-1552010099-5dc86fcfaa38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxmcmVzaHxlbnwwfDF8fHwxNzEyMTU4MDk0fDA&ixlib=rb-4.0.3&q=80&w=1080"
            alt="login form image"
          />
        </div>
      </div>
    </section>
  );
}
