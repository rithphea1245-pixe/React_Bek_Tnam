import { useEffect } from "react";
import { useRefreshMutation } from "../features/auth/authApi";
import {
  setCredentials,
  clearCredentials,
} from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "./hook.js";

export default function SessionInitializer({ children }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth?.token);
  const refreshToken = useAppSelector((state) => state.auth?.refreshToken);
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    if (token) return;
    if (!refreshToken) return;

    let cancelled = false;
    refresh({ refreshToken })
      .unwrap()
      .then((result) => {
        if (!cancelled) {
          dispatch(
            setCredentials({
              token: result.accessToken,
              refreshToken: result.refreshToken || refreshToken,
              user: result.user,
            }),
          );
        }
      })
      .catch(() => {
        if (!cancelled) dispatch(clearCredentials());
      });

    return () => {
      cancelled = true;
    };
  }, [token, refreshToken, refresh, dispatch]);

  return children;
}
