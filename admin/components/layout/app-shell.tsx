"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

export function AppShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: Array<{ href: string; label: string }>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  return (
    <div className="min-h-svh bg-zinc-100">
      <div className="border-b bg-zinc-900 text-zinc-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold tracking-wide uppercase">{title}</p>
            <p className="text-xs text-zinc-400">{user?.email}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              clearSession();
              router.replace("/login");
            }}
          >
            Sign out
          </Button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-4 px-4 pb-3 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "pb-1",
                pathname.startsWith(item.href)
                  ? "border-b border-white font-medium"
                  : "text-zinc-400 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
