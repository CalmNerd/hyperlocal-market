"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/layout/require-auth";
import { OrdersPanel } from "@/features/orders/orders-panel";

const nav = [
  { href: "/vendors", label: "Vendors" },
  { href: "/orders", label: "Orders" },
];

export default function OrdersPage() {
  return (
    <RequireAuth role="ADMIN">
      <AppShell title="Admin" nav={nav}>
        <OrdersPanel />
      </AppShell>
    </RequireAuth>
  );
}
