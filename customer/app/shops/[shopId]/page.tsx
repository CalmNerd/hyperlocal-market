"use client";

import { use } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/layout/require-auth";
import { ShopProductsPanel } from "@/features/shops/shop-products-panel";

const nav = [
  { href: "/shops", label: "Shops" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders" },
];

export default function ShopDetailPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = use(params);

  return (
    <RequireAuth role="CUSTOMER">
      <AppShell title="Customer" nav={nav}>
        <ShopProductsPanel shopId={shopId} />
      </AppShell>
    </RequireAuth>
  );
}
