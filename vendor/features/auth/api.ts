import { api } from "@/lib/api/client";
import type { AuthUser, AuthVendor } from "@/stores/auth-store";

export type AuthResponse = {
  token: string;
  user: AuthUser;
  vendor: AuthVendor;
};

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", { email, password });
  return data;
}

export async function registerVendor(input: {
  email: string;
  password: string;
  shopName: string;
  latitude: number;
  longitude: number;
}) {
  const { data } = await api.post<AuthResponse>("/api/auth/register", {
    ...input,
    role: "VENDOR",
  });
  return data;
}
