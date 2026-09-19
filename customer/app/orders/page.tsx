"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/layout/require-auth";
import { OrdersPanel } from "@/features/orders/orders-panel";

const nav = [
  { href: "/shops", label: "Shops" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders" },
];

export default function OrdersPage() {
  return (
    <RequireAuth role="CUSTOMER">
      <AppShell title="Customer" nav={nav}>
        <OrdersPanel />
      </AppShell>
    </RequireAuth>
  );
}
