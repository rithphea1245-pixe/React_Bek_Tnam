import {
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
} from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { auth } from "../../firebase/config";
import { useLoginMutation, useSignupMutation, useUpdateUserMutation } from "../../features/auth/authApi";
import { setCredentials } from "../../features/auth/authSlice";
import { useAppDispatch } from "../../lib/hook.js";

// Stable per-Google-account value derived from the Firebase UID. Used to build
// a deterministic password so the same Google account always maps to the same
// backend account, and a unique username to avoid collisions.
function hashUid(uid) {
  let hash = 2166136261;
  for (let i = 0; i < uid.length; i++) {
    hash ^= uid.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return (hash >>> 0).toString(36);
}

// Satisfies the backend password rules (8-20 chars, upper+lower+digit+special).
function googleShadowPassword(uid) {
  const base = hashUid(uid).padStart(6, "0");
  return `Go${base}le1@`;
}

function googleUsername(googleUser) {
  const cleaned = (googleUser.displayName || googleUser.email.split("@")[0])
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 15);
  const base = cleaned.length >= 3 ? cleaned : "googleuser";
  const suffix = hashUid(googleUser.uid).slice(0, 4);
  return `${base}_${suffix}`;
}

// The backend rejects an empty profile URL, so fall back to an avatar.
function defaultProfileImage(username) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=002D74&color=fff`;
}

function apiErrorMessage(err) {
  const description = err?.data?.description ?? err?.description;
  if (typeof description === "string") return description;
  if (description && typeof description === "object") {
    return Object.values(description).flat().join(" ");
  }
  return err?.data?.message || err?.message || "Google sign-in failed. Please try again.";
}

// Translate common Firebase popup errors into clear, actionable messages.
const FIREBASE_AUTH_MESSAGES = {
  "auth/operation-not-allowed":
    "Google sign-in is disabled for this Firebase project. Enable it in Firebase Console → Authentication → Sign-in method → Google → Enable → Save.",
  "auth/unauthorized-domain":
    "This website is not authorized for Firebase sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.",
  "auth/popup-blocked":
    "The browser blocked the sign-in popup. Allow popups for this site and try again.",
  "auth/account-exists-with-different-credential":
    "This Google email is already linked to a different sign-in method in Firebase.",
  "auth/too-many-requests":
    "Too many sign-in attempts. Wait a minute and try again.",
};

function firebaseAuthMessage(err) {
  if (err?.code && FIREBASE_AUTH_MESSAGES[err.code]) {
    return FIREBASE_AUTH_MESSAGES[err.code];
  }
  return null;
}

const DEFAULT_REDIRECT = "/dashboard/products";

export const GoogleLoginComponent = ({
  label = "Continue with Google",
  redirectTo = DEFAULT_REDIRECT,
}) => {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const [login] = useLoginMutation();
  const [signup] = useSignupMutation();
  const [updateUser] = useUpdateUserMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Prevents completing the same Google account twice (e.g. when both the
  // redirect result and the session listener fire for the same sign-in).
  const handledRef = useRef(false);

  // Runs after Google returns the account: syncs it with the backend and
  // stores the session, exactly as the old popup flow did.
  const completeGoogleLogin = async (googleUser) => {
    if (!googleUser?.email) {
      throw new Error("Could not read your Google account information.");
    }

    const email = googleUser.email;
    const password = googleShadowPassword(googleUser.uid);
    const username = googleUsername(googleUser);
    const profile = googleUser.photoURL || defaultProfileImage(username);

    let result;
    try {
      result = await login({ email, password }).unwrap();
    } catch (loginErr) {
      // Only reach the register branch when the server answered (e.g. 404
      // "user not found"). Network failures are thrown straight through.
      if (typeof loginErr?.status !== "number") {
        throw loginErr;
      }

      try {
        await signup({
          emailVerified: true,
          username,
          email,
          password,
          confirmPassword: password,
          profile,
          address: {
            addressLine1: "",
            addressLine2: "",
            road: "",
            linkAddress: "",
          },
        }).unwrap();
        result = await login({ email, password }).unwrap();
      } catch (signupErr) {
        if (/(already|exist|registered|duplicate)/i.test(apiErrorMessage(signupErr))) {
          throw new Error(
            "This Google email is already registered with a password. Please log in with your email and password instead.",
          );
        }
        throw signupErr;
      }
    }

    // Persist the Google photo to the backend account so the avatar keeps
    // showing after a page refresh (the backend only stores it at signup).
    if (googleUser.photoURL && googleUser.photoURL !== result.user?.profile) {
      try {
        await updateUser({
          uuid: result.user.uuid,
          username: result.user.username,
          profile: googleUser.photoURL,
          phoneNumber: result.user.phoneNumber || "",
          address: {
            addressLine1: result.user.address?.addressLine1 || "",
            addressLine2: result.user.address?.addressLine2 || "",
            road: result.user.address?.road || "",
            linkAddress: result.user.address?.linkAddress || "",
          },
        }).unwrap();
      } catch {
        // Best-effort: never block sign-in because the avatar could not sync.
      }
    }

    // Prefer the live Google photo so the avatar shows even if the backend
    // account was created earlier with a fallback image.
    const googleProfile = googleUser.photoURL || result.user?.profile;
    const sessionUser =
      googleProfile && googleProfile !== result.user?.profile
        ? { ...result.user, profile: googleProfile }
        : result.user;

    dispatch(
      setCredentials({
        token: result.accessToken,
        refreshToken: result.refreshToken,
        user: sessionUser,
      }),
    );
    navigate(redirectTo);
  };

  // When the browser brings us back from Google, pick up the signed-in account.
  // Two paths feed the same handler so it works even if one of them is blocked
  // by the browser: the redirect result, and Firebase's session listener.
  useEffect(() => {
    let cancelled = false;

    const complete = async (googleUser) => {
      if (cancelled || handledRef.current) return;
      handledRef.current = true;
      try {
        await completeGoogleLogin(googleUser);
      } catch (err) {
        handledRef.current = false;
        setError(firebaseAuthMessage(err) || apiErrorMessage(err));
      }
    };

    setPending(true);
    getRedirectResult(auth)
      .then((res) => {
        if (cancelled) return;
        if (res?.user) return complete(res.user);
      })
      .catch((err) => {
        if (cancelled) return;
        if (
          err?.code === "auth/popup-closed-by-user" ||
          err?.code === "auth/cancelled-popup-request"
        ) {
          return;
        }
        setError(firebaseAuthMessage(err) || apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setPending(false);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (cancelled) return;
      if (user?.email && !handledRef.current) {
        complete(user);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithGoogle = () => {
    setError("");
    setPending(true);

    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    // Always show the full Google account chooser, so any account (or a
    // different one) can be picked on every sign-in.
    provider.setCustomParameters({ prompt: "select_account" });

    signInWithRedirect(auth, provider).catch((err) => {
      setPending(false);
      setError(firebaseAuthMessage(err) || apiErrorMessage(err));
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={loginWithGoogle}
        disabled={pending}
        className="w-full mt-4 border border-gray-300 py-2 rounded-lg flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-60"
      >
        <img
          src="https://www.svgrepo.com/show/355037/google.svg"
          alt="Google"
          className="w-5 h-5 mr-2"
        />
        {pending ? "Connecting…" : label}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
    </>
  );
};
