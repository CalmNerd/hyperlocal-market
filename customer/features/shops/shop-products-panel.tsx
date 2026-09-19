"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/state/query-states";
import { getErrorMessage } from "@/lib/api/errors";
import { useAddToCart, useShopProducts } from "./client";

export function ShopProductsPanel({ shopId }: { shopId: string }) {
  const [flash, setFlash] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const productsQuery = useShopProducts(shopId);
  const add = useAddToCart();

  if (productsQuery.isPending) return <PageSkeleton />;
  if (productsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(productsQuery.error)}
        onRetry={() => productsQuery.refetch()}
      />
    );
  }

  const { shop, products } = productsQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{shop.shopName}</h1>
        <p className="text-sm text-muted-foreground">In stock items only.</p>
      </div>

      {flash && <p className="text-sm text-emerald-700">{flash}</p>}
      {err && <p className="text-sm text-destructive">{err}</p>}

      {products.length === 0 ? (
        <EmptyState title="Empty shelf" description="This shop hasn't listed anything available." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {products.map((product) => (
            <li key={product.id} className="overflow-hidden rounded-3xl border bg-background">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h2 className="font-medium">{product.title}</h2>
                  <p className="text-sm text-muted-foreground">₹{product.price.toFixed(2)}</p>
                </div>
                <Button
                  className="w-full"
                  disabled={add.isPending}
                  onClick={() => {
                    add.mutate(
                      { productId: product.id },
                      {
                        onSuccess: () => {
                          setErr(null);
                          setFlash("Added to cart");
                        },
                        onError: (error) => {
                          setFlash(null);
                          setErr(getErrorMessage(error));
                        },
                      },
                    );
                  }}
                >
                  Add to cart
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
