"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/layout/require-auth";
import { ProductsPanel } from "@/features/products/products-panel";

const nav = [
  { href: "/products", label: "Products" },
  { href: "/shop", label: "Shop" },
];

export default function ProductsPage() {
  return (
    <RequireAuth role="VENDOR">
      <AppShell title="Vendor" nav={nav}>
        <ProductsPanel />
      </AppShell>
    </RequireAuth>
  );
}
