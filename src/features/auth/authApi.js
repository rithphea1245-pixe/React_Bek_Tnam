import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASE_ISHOP_URL;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // POST /auth/login
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    // POST /auth/refresh
    refresh: builder.mutation({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
    }),
    // POST /users/user-signup?emailVerified=...
    // emailVerified=true  -> account is pre-verified (no email sent)
    // emailVerified=false -> backend emails a verification link to the mailbox
    signup: builder.mutation({
      query: ({ emailVerified = true, ...body }) => ({
        url: "/users/user-signup",
        method: "POST",
        params: { emailVerified },
        body,
      }),
    }),
    // POST /users/verify-email?token=...
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: "/users/verify-email",
        method: "POST",
        params: { token },
      }),
    }),
    // POST /users/resend-email-verification
    resendEmailVerification: builder.mutation({
      query: (body) => ({
        url: "/users/resend-email-verification",
        method: "POST",
        body,
      }),
    }),
    // GET /users/me
    getMe: builder.query({
      query: () => "/users/me",
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useSignupMutation,
  useVerifyEmailMutation,
  useResendEmailVerificationMutation,
  useGetMeQuery,
} = authApi;
