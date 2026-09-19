"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  email: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
};

export type AuthVendor = {
  id: string;
  shopName: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISABLED";
  latitude: number;
  longitude: number;
} | null;

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  vendor: AuthVendor;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setSession: (payload: { token: string; user: AuthUser; vendor?: AuthVendor }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      vendor: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setSession: ({ token, user, vendor = null }) => set({ token, user, vendor }),
      clearSession: () => set({ token: null, user: null, vendor: null }),
    }),
    {
      name: "marketplace-auth-vendor",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
