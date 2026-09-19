"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { PageSkeleton } from "@/components/state/query-states";

export function RequireAuth({
  role,
  children,
}: {
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
  children: ReactNode;
}) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || !user || user.role !== role) {
      router.replace("/login");
    }
  }, [hasHydrated, token, user, role, router]);

  if (!hasHydrated || !token || !user || user.role !== role) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageSkeleton rows={3} />
      </div>
    );
  }

  return <>{children}</>;
}
