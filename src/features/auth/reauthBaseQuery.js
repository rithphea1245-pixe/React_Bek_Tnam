import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, clearCredentials } from "./authSlice";

const BASE_URL = import.meta.env.VITE_BASE_ISHOP_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

let refreshPromise = null;

const isRefreshRequest = (args) => {
  const url = typeof args === "string" ? args : args?.url;
  return typeof url === "string" && url.includes("/auth/refresh");
};

// Automatically refreshes the access token (using the stored refresh token)
// when a request comes back 401, then retries the original request once.
// Concurrent 401s share a single refresh call to avoid token rotation races.
export const reauthBaseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (
    result.error &&
    result.error.status === 401 &&
    !isRefreshRequest(args)
  ) {
    const refreshToken = api.getState().auth?.refreshToken;
    if (!refreshToken) {
      return result;
    }

    if (!refreshPromise) {
      refreshPromise = baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions,
      ).finally(() => {
        refreshPromise = null;
      });
    }

    const refreshResult = await refreshPromise;

    if (refreshResult.data) {
      const currentUser = api.getState().auth?.user;
      api.dispatch(
        setCredentials({
          token: refreshResult.data.accessToken,
          refreshToken:
            refreshResult.data.refreshToken || refreshToken,
          user: refreshResult.data.user || currentUser,
        }),
      );
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};
