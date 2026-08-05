import { useEffect } from "react";
import { useLoginMutation } from "../features/auth/authApi";
import { setCredentials } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "./hook.js";

export default function SessionInitializer({ children }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth?.token);
  const autoLogin = useAppSelector((state) => state.auth?.autoLogin);
  const [login] = useLoginMutation();

  useEffect(() => {
    if (token) return;
    if (autoLogin === false) return;

    const email = import.meta.env.VITE_ISHOP_EMAIL;
    const password = import.meta.env.VITE_ISHOP_PASSWORD;
    if (!email || !password) return;

    let cancelled = false;
    login({ email, password })
      .unwrap()
      .then((result) => {
        if (!cancelled) {
          dispatch(
            setCredentials({ token: result.accessToken, user: result.user }),
          );
        }
      })
      .catch(() => {
        // silent: UI shows a login form when not authenticated
      });

    return () => {
      cancelled = true;
    };
  }, [token, autoLogin, login, dispatch]);

  return children;
}
