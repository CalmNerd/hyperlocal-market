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
