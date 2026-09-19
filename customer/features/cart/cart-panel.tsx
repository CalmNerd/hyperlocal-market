"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/state/query-states";
import { getErrorMessage } from "@/lib/api/errors";
import { useCart, usePlaceOrder, useRemoveCartItem, useUpdateCartItem } from "./client";

export function CartPanel() {
  const router = useRouter();
  const cartQuery = useCart();
  const bumpQty = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const checkout = usePlaceOrder();

  if (cartQuery.isPending) return <PageSkeleton />;
  if (cartQuery.isError) {
    return (
      <ErrorState message={getErrorMessage(cartQuery.error)} onRetry={() => cartQuery.refetch()} />
    );
  }

  const cart = cartQuery.data;
  if (!cart?.items.length) {
    return <EmptyState title="Cart is empty" description="Pick something from a nearby shop." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Cart</h1>
        <p className="text-sm text-muted-foreground">From {cart.shopName}</p>
      </div>

      <ul className="space-y-3">
        {cart.items.map((item) => (
          <li key={item.id} className="rounded-3xl border bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-medium">{item.product.title}</h2>
                <p className="text-sm text-muted-foreground">
                  ₹{item.product.price.toFixed(2)} · line ₹{item.lineTotal.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={item.quantity <= 1 || bumpQty.isPending}
                  onClick={() => bumpQty.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                >
                  −
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={bumpQty.isPending}
                  onClick={() => bumpQty.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                >
                  +
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(item.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 rounded-3xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold">Total ₹{cart.totalAmount.toFixed(2)}</p>
        <Button
          disabled={checkout.isPending}
          onClick={() =>
            checkout.mutate(undefined, {
              onSuccess: () => router.push("/orders"),
            })
          }
        >
          {checkout.isPending ? "Placing order…" : "Place order"}
        </Button>
      </div>

      {checkout.isError && (
        <p className="text-sm text-destructive">{getErrorMessage(checkout.error)}</p>
      )}
      {bumpQty.isError && (
        <p className="text-sm text-destructive">{getErrorMessage(bumpQty.error)}</p>
      )}
    </div>
  );
}
