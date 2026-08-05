import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { useSignupMutation, useLoginMutation } from "../../features/auth/authApi";
import { setCredentials } from "../../features/auth/authSlice";
import { useAppDispatch } from "../../lib/hook.js";
import { createTempMailbox } from "../../lib/tempMail";
import {
  registerSchema,
  defaultRegisterValues,
  PASSWORD_RULES,
} from "../../features/auth/authSchemas";

function apiErrorMessage(err) {
  const description = err.data?.description;
  if (typeof description === "string") return description;
  if (description && typeof description === "object") {
    return Object.values(description).flat().join(" ");
  }
  return err.data?.message || err.message || "Registration failed.";
}

function fieldClass(hasError) {
  return `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    hasError ? "border-red-500" : "border-gray-300"
  }`;
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export default function RegisterComponent() {
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [mailbox, setMailbox] = useState(null);
  const [gettingMail, setGettingMail] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [info, setInfo] = useState("");
  const cancelledRef = useRef(false);

  const [signup, { isLoading }] = useSignupMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: defaultRegisterValues,
  });

  const password = watch("password");
  const isSubmitting = isLoading || isLoggingIn;

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const handleGetFakeEmail = async () => {
    setGettingMail(true);
    setRegisterError("");
    setInfo("");
    try {
      const newMailbox = await createTempMailbox();
      setMailbox(newMailbox);
      reset({
        ...defaultRegisterValues,
        email: newMailbox.address,
      });
      setInfo(`Fake email ready: ${newMailbox.address}`);
    } catch {
      setMailbox(null);
      const stamp = Math.random().toString(36).slice(2, 10);
      const fallback = `ishop_${stamp}@web-library.net`;
      reset({
        ...defaultRegisterValues,
        email: fallback,
      });
      setInfo(`Could not create an inbox — using fake email ${fallback}.`);
    } finally {
      setGettingMail(false);
    }
  };

  const fillDemoData = () => {
    const stamp = Date.now().toString(36);
    reset({
      ...defaultRegisterValues,
      username: `demo${stamp}`.slice(0, 15),
      email: `demo${stamp}@web-library.net`,
      phoneNumber: "012345678",
      address: {
        addressLine1: "Phnom Penh, Toul Kork",
        addressLine2: "Sangkat Boeung Kak",
        road: "Street 105",
        linkAddress: "https://maps.google.com/?q=Phnom+Penh",
      },
      password: "StrongPass1@",
      confirmPassword: "StrongPass1@",
    });
    setRegisterError("");
    setLoginError("");
    setInfo("");
  };

  const onSubmit = async (values) => {
    setRegisterError("");
    setLoginError("");
    const payload = {
      username: values.username,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      address: {
        addressLine1: values.address?.addressLine1 ?? "",
        addressLine2: values.address?.addressLine2 ?? "",
        road: values.address?.road ?? "",
        linkAddress: values.address?.linkAddress ?? "",
      },
    };
    if (values.phoneNumber) payload.phoneNumber = values.phoneNumber;
    if (values.profile) payload.profile = values.profile;

    let isNewAccount = true;
    try {
      // emailVerified=true -> the server pre-verifies the account, so login
      // works immediately and the account can never get stuck unverified.
      await signup({ emailVerified: true, ...payload }).unwrap();
    } catch (err) {
      const message = apiErrorMessage(err);
      if (/already|exist|registered|duplicate/i.test(message)) {
        isNewAccount = false;
      } else {
        setRegisterError(message);
        return;
      }
    }

    setRegisteredEmail(values.email);
    setRegistered(true);

    try {
      const result = await login({
        email: values.email,
        password: values.password,
      }).unwrap();
      dispatch(
        setCredentials({
          token: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        }),
      );
      setVerified(true);
    } catch {
      setLoginError(
        isNewAccount
          ? "Account created and verified! But automatic login failed — please log in manually."
          : "That email is already registered, and it may be a stuck unverified account (the iShop server never delivers verification emails to fake-email domains). Click “Get a fake email” for a fresh address and try again.",
      );
    }
  };

  if (registered) {
    const usingGeneratedMailbox = mailbox?.address === registeredEmail;
    return (
      <div className="flex justify-center items-center min-h-screen bg-white px-4">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg text-center">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
              verified ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            {verified ? "✅" : "✉️"}
          </div>
          <h2 className="text-2xl font-bold text-blue-600 mb-2">
            {verified ? "Registered & verified!" : "Account created!"}
          </h2>
          <p className="text-sm text-gray-600 mb-4 break-all">
            {verified
              ? `Your account is verified with ${registeredEmail}. You can log in now.`
              : `Your account is registered with ${registeredEmail}.`}
          </p>

          {loginError && (
            <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {loginError}
            </p>
          )}

          {usingGeneratedMailbox && (
            <>
              <a
                href="https://mail.tm"
                target="_blank"
                rel="noreferrer"
                className="block w-full border border-green-300 bg-green-50 text-green-700 py-2 rounded-lg hover:bg-green-100 transition text-sm font-medium mb-2"
              >
                📥 Open fake email inbox on mail.tm
              </a>
              <p className="mb-4 text-xs text-gray-500">
                Note: the iShop server does not deliver verification emails to
                fake-email domains, so the inbox stays empty — but your account
                is already verified and ready to log in.
              </p>
            </>
          )}

          {verified ? (
            <button
              type="button"
              onClick={() => navigate("/dashboard/products")}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go to dashboard
            </button>
          ) : (
            <Link
              to="/auth/login"
              className="block text-sm text-blue-600 hover:underline"
            >
              Go to login
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white py-8">
      <div className="w-full flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Register</h2>
          <p className="text-xs text-gray-500 mb-6">
            Register with a fake email and verify your account.
          </p>

          <button
            type="button"
            onClick={handleGetFakeEmail}
            disabled={gettingMail}
            className="w-full mb-3 border border-green-300 bg-green-50 text-green-700 py-2 rounded-lg hover:bg-green-100 transition text-sm font-medium disabled:opacity-60"
          >
            {gettingMail ? "Creating fake email…" : "📧 Get a fake email"}
          </button>
          <button
            type="button"
            onClick={fillDemoData}
            className="w-full mb-4 border border-blue-300 bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
          >
            ✨ Autofill demo data (lazy mode)
          </button>

          {info && (
            <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              {info}
            </p>
          )}
          {registerError && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {registerError}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm mb-2">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className={fieldClass(Boolean(errors.username))}
                {...register("username")}
              />
              <FieldError message={errors.username?.message} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">Email</label>
              <input
                type="email"
                placeholder="fake-email@mail.tm (press “Get a fake email”)"
                className={fieldClass(Boolean(errors.email))}
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Phone number <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="012 345 678"
                className={fieldClass(Boolean(errors.phoneNumber))}
                {...register("phoneNumber")}
              />
              <FieldError message={errors.phoneNumber?.message} />
            </div>

            <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
              <legend className="px-2 text-sm font-medium text-gray-700">
                Address <span className="text-gray-400">(optional)</span>
              </legend>
              <div>
                <label className="block text-gray-700 text-xs mb-1">
                  Address line 1
                </label>
                <input
                  type="text"
                  placeholder="House number, street, village"
                  className={fieldClass(Boolean(errors.address?.addressLine1))}
                  {...register("address.addressLine1")}
                />
                <FieldError message={errors.address?.addressLine1?.message} />
              </div>
              <div>
                <label className="block text-gray-700 text-xs mb-1">
                  Address line 2
                </label>
                <input
                  type="text"
                  placeholder="Sangkat, Khan, city"
                  className={fieldClass(Boolean(errors.address?.addressLine2))}
                  {...register("address.addressLine2")}
                />
                <FieldError message={errors.address?.addressLine2?.message} />
              </div>
              <div>
                <label className="block text-gray-700 text-xs mb-1">Road</label>
                <input
                  type="text"
                  placeholder="Street name / number"
                  className={fieldClass(Boolean(errors.address?.road))}
                  {...register("address.road")}
                />
                <FieldError message={errors.address?.road?.message} />
              </div>
              <div>
                <label className="block text-gray-700 text-xs mb-1">
                  Link address <span className="text-gray-400">(https://)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/…"
                  className={fieldClass(Boolean(errors.address?.linkAddress))}
                  {...register("address.linkAddress")}
                />
                <FieldError message={errors.address?.linkAddress?.message} />
              </div>
            </fieldset>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Profile image <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://…"
                className={fieldClass(Boolean(errors.profile))}
                {...register("profile")}
              />
              <FieldError message={errors.profile?.message} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className={fieldClass(Boolean(errors.password))}
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
              {!errors.password && (
                <p className="mt-1 text-[11px] text-gray-400">
                  {PASSWORD_RULES.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                className={fieldClass(Boolean(errors.confirmPassword))}
                {...register("confirmPassword")}
              />
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (password && password.length < 8)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isLoading
                ? "Creating account…"
                : isLoggingIn
                  ? "Logging you in…"
                  : "Sign up"}
            </button>
          </form>
          <p className="mt-6 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
          <p className="mt-4 text-xs text-center">
            <Link
              to="/"
              className="text-gray-500 hover:text-blue-600 hover:underline"
            >
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
