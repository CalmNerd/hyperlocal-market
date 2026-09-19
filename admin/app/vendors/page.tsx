"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/layout/require-auth";
import { VendorsPanel } from "@/features/vendors/vendors-panel";

const nav = [
  { href: "/vendors", label: "Vendors" },
  { href: "/orders", label: "Orders" },
];

export default function VendorsPage() {
  return (
    <RequireAuth role="ADMIN">
      <AppShell title="Admin" nav={nav}>
        <VendorsPanel />
      </AppShell>
    </RequireAuth>
  );
}
