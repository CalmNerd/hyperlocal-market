"use client";

import { EmptyState, ErrorState, PageSkeleton } from "@/components/state/query-states";
import { getErrorMessage } from "@/lib/api/errors";
import { useAdminOrders } from "@/features/vendors/client";

export function OrdersPanel() {
  const orders = useAdminOrders();

  if (orders.isPending) return <PageSkeleton />;
  if (orders.isError) {
    return <ErrorState message={getErrorMessage(orders.error)} onRetry={() => orders.refetch()} />;
  }
  if (orders.data.length === 0) {
    return <EmptyState title="No orders yet" description="Customer checkouts will show up here." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">All orders</h1>
        <p className="text-sm text-muted-foreground">Platform-wide order history.</p>
      </div>
      <ul className="space-y-3">
        {orders.data.map((order) => (
          <li key={order.id} className="rounded-3xl border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-medium">{order.shopName ?? "Shop"}</h2>
                <p className="text-sm text-muted-foreground">
                  {order.customerEmail} · {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="font-semibold">₹{order.totalAmount.toFixed(2)}</p>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.productTitle} × {item.quantity} @ ₹{item.unitPrice.toFixed(2)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
