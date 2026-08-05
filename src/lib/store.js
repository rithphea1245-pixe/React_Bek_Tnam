import { configureStore } from "@reduxjs/toolkit";
import { CounterSlice } from "../features/counter/CounterSlice";
import { AuthSlice } from "../features/auth/authSlice";
import { authApi } from "../features/auth/authApi";
import { productsApi } from "../features/products/productsApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [CounterSlice.reducerPath]: CounterSlice.reducer,
      [AuthSlice.reducerPath]: AuthSlice.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [productsApi.reducerPath]: productsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware, productsApi.middleware),
  });
};
