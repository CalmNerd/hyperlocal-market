"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/state/query-states";
import { getErrorMessage } from "@/lib/api/errors";
import {
  useApproveVendor,
  useDisableVendor,
  useRejectVendor,
  useVendors,
} from "./client";

function tone(status: string) {
  if (status === "APPROVED") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  if (status === "DISABLED" || status === "REJECTED") return "danger" as const;
  return "muted" as const;
}

export function VendorsPanel() {
  const vendors = useVendors();
  const approve = useApproveVendor();
  const reject = useRejectVendor();
  const disable = useDisableVendor();

  if (vendors.isPending) return <PageSkeleton />;
  if (vendors.isError) {
    return <ErrorState message={getErrorMessage(vendors.error)} onRetry={() => vendors.refetch()} />;
  }
  if (!vendors.data.length) {
    return <EmptyState title="No vendors" description="Registrations will land here." />;
  }

  const actionError = approve.error || reject.error || disable.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Vendors</h1>
        <p className="text-sm text-muted-foreground">Approve, reject, or disable shops.</p>
      </div>

      <ul className="space-y-3">
        {vendors.data.map((vendor) => (
          <li key={vendor.id} className="rounded-2xl border bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium">{vendor.shopName}</h2>
                  <Badge variant={tone(vendor.status)}>{vendor.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{vendor.email}</p>
                <p className="text-xs text-muted-foreground">
                  {vendor.productCount} products · {vendor.orderCount} orders
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(vendor.status === "PENDING" || vendor.status === "DISABLED") && (
                  <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate(vendor.id)}>
                    Approve
                  </Button>
                )}
                {vendor.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={reject.isPending}
                    onClick={() => reject.mutate(vendor.id)}
                  >
                    Reject
                  </Button>
                )}
                {vendor.status === "APPROVED" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={disable.isPending}
                    onClick={() => disable.mutate(vendor.id)}
                  >
                    Disable
                  </Button>
                )}
              </div>
            </div>

            {actionError && (
              <p className="mt-2 text-sm text-destructive">{getErrorMessage(actionError)}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
