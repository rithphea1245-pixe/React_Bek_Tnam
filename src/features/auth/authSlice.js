import { createSlice } from "@reduxjs/toolkit";

const TOKEN_KEY = "ishop.token";
const REFRESH_TOKEN_KEY = "ishop.refreshToken";

const readSession = (key) => sessionStorage.getItem(key) || "";

const initialState = {
  token: readSession(TOKEN_KEY),
  refreshToken: readSession(REFRESH_TOKEN_KEY),
  user: null,
};

export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload?.token || "";
      state.refreshToken = action.payload?.refreshToken || "";
      state.user = action.payload?.user || null;
      // Store the refresh token in sessionStorage (cleared when the tab
      // closes). If the API did not return one, store the access token
      // instead so the session can still be restored on reload.
      if (state.refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, state.refreshToken);
        sessionStorage.removeItem(TOKEN_KEY);
      } else if (state.token) {
        sessionStorage.setItem(TOKEN_KEY, state.token);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      } else {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    },
    clearCredentials: (state) => {
      state.token = "";
      state.refreshToken = "";
      state.user = null;
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    },
  },
});

export const { setCredentials, clearCredentials } = AuthSlice.actions;
export default AuthSlice.reducer;
