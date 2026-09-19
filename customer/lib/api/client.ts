import axios from "axios";
import { ApiError, type ApiErrorBody } from "./errors";
import { useAuthStore } from "@/stores/auth-store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status ?? 500;
    const body = error.response?.data as ApiErrorBody | undefined;
    const message = body?.error?.message ?? error.message ?? "Request failed";

    if (status === 401) {
      useAuthStore.getState().clearSession();
    }

    return Promise.reject(
      new ApiError(status, message, body?.error?.code ?? "API_ERROR", body?.error?.details ?? null),
    );
  },
);
