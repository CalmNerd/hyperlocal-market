"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/layout/require-auth";
import { ShopSettingsPanel } from "@/features/shop/shop-settings-panel";

const nav = [
  { href: "/products", label: "Products" },
  { href: "/shop", label: "Shop" },
];

export default function ShopPage() {
  return (
    <RequireAuth role="VENDOR">
      <AppShell title="Vendor" nav={nav}>
        <ShopSettingsPanel />
      </AppShell>
    </RequireAuth>
  );
}
