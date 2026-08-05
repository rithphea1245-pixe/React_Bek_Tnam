import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";
import {
  useVerifyEmailMutation,
  useResendEmailVerificationMutation,
} from "../../features/auth/authApi";

const resendSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  oldToken: z.string().optional(),
});

function apiErrorMessage(err) {
  return err.data?.description || err.data?.message || err.message || "Failed.";
}

export default function VerifyEmailComponent() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resend, { isLoading: isResending }] =
    useResendEmailVerificationMutation();

  const [status, setStatus] = useState(null);
  const [verified, setVerified] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: "", oldToken: "" },
  });

  useEffect(() => {
    if (!token) {
      setStatus("No verification token found in the link. Use the form below to resend the email.");
      return;
    }
    let cancelled = false;
    setStatus("Verifying your email…");
    verifyEmail(token)
      .unwrap()
      .then((result) => {
        if (cancelled) return;
        setVerified(true);
        setStatus(result?.message || "Your email has been verified successfully!");
      })
      .catch((err) => {
        if (cancelled) return;
        setVerified(false);
        setStatus(apiErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [token, verifyEmail]);

  const onResend = async ({ email, oldToken }) => {
    setResendMessage("");
    try {
      const result = await resend({
        email,
        ...(oldToken ? { oldToken } : {}),
      }).unwrap();
      setResendMessage(
        result?.message || "Verification email sent. Please check your inbox.",
      );
    } catch (err) {
      setResendMessage(apiErrorMessage(err));
    }
  };

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
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          {verified ? "Email verified" : "Verify your email"}
        </h2>

        {status && (
          <p
            className={`mb-4 text-sm rounded-lg p-3 ${
              verified
                ? "text-green-700 bg-green-50 border border-green-200"
                : "text-gray-600 bg-gray-50 border border-gray-200"
            }`}
          >
            {isLoading ? "Verifying your email…" : status}
          </p>
        )}

        {verified && (
          <Link
            to="/auth/login"
            className="inline-block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go to login
          </Link>
        )}

        {!verified && (
          <form onSubmit={handleSubmit(onResend)} className="space-y-4 text-left">
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Your email (you can use a temp-mail)
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Old token <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Paste the old verification token if you have one"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("oldToken")}
              />
            </div>
            <button
              type="submit"
              disabled={isResending}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isResending ? "Sending…" : "Resend verification email"}
            </button>
          </form>
        )}

        {resendMessage && !verified && (
          <p className="mt-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
            {resendMessage}
          </p>
        )}

        <Link
          to="/auth/login"
          className="block mt-4 text-sm text-blue-600 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
