import { createSlice } from "@reduxjs/toolkit";

const TOKEN_KEY = "ishop.token";
const REFRESH_TOKEN_KEY = "ishop.refreshToken";
const AUTO_LOGIN_KEY = "ishop.autoLogin";

const initialState = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || "",
  user: null,
  autoLogin: localStorage.getItem(AUTO_LOGIN_KEY) !== "0",
};

export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload?.token || "";
      state.refreshToken = action.payload?.refreshToken || "";
      state.user = action.payload?.user || null;
      state.autoLogin = true;
      if (state.token) {
        localStorage.setItem(TOKEN_KEY, state.token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
      if (state.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, state.refreshToken);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
      localStorage.setItem(AUTO_LOGIN_KEY, "1");
    },
    clearCredentials: (state) => {
      state.token = "";
      state.refreshToken = "";
      state.user = null;
      state.autoLogin = false;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.setItem(AUTO_LOGIN_KEY, "0");
    },
  },
});

export const { setCredentials, clearCredentials } = AuthSlice.actions;
export default AuthSlice.reducer;
