"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/layout/require-auth";
import { CartPanel } from "@/features/cart/cart-panel";

const nav = [
  { href: "/shops", label: "Shops" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders" },
];

export default function CartPage() {
  return (
    <RequireAuth role="CUSTOMER">
      <AppShell title="Customer" nav={nav}>
        <CartPanel />
      </AppShell>
    </RequireAuth>
  );
}
