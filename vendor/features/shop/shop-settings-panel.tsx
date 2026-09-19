"use client";

import { FormEvent, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState, PageSkeleton } from "@/components/state/query-states";
import { getErrorMessage } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";
import { useMyShop, useUpdateShop } from "./client";

function badgeFor(status: string) {
  if (status === "APPROVED") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  if (status === "DISABLED" || status === "REJECTED") return "danger" as const;
  return "muted" as const;
}

export function ShopSettingsPanel() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);

  const shopQuery = useMyShop();
  const save = useUpdateShop();

  const [shopName, setShopName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!shopQuery.data) return;
    setShopName(shopQuery.data.shopName);
    setLatitude(String(shopQuery.data.latitude));
    setLongitude(String(shopQuery.data.longitude));
  }, [shopQuery.data]);

  if (shopQuery.isPending) return <PageSkeleton />;
  if (shopQuery.isError) {
    return <ErrorState message={getErrorMessage(shopQuery.error)} onRetry={() => shopQuery.refetch()} />;
  }

  const shop = shopQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Shop</h1>
          <p className="text-sm text-muted-foreground">Name + location used for nearby search.</p>
        </div>
        <Badge variant={badgeFor(shop.status)}>{shop.status}</Badge>
      </div>

      {shop.status === "PENDING" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Waiting on admin approval. You can edit details, but products stay locked for now.
        </p>
      )}
      {shop.status === "DISABLED" && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          This shop was disabled by an admin.
        </p>
      )}
      {shop.status === "REJECTED" && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Registration was rejected.
        </p>
      )}

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          setSaved(false);
          save.mutate(
            {
              shopName,
              latitude: Number(latitude),
              longitude: Number(longitude),
            },
            {
              onSuccess: (updated) => {
                setSaved(true);
                if (token && user) setSession({ token, user, vendor: updated });
              },
            },
          );
        }}
        className="max-w-lg space-y-4 rounded-3xl border bg-background p-4"
      >
        <div>
          <Label htmlFor="shopName">Shop name</Label>
          <Input id="shopName" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input id="lat" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="lng">Longitude</Label>
            <Input id="lng" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
          </div>
        </div>

        {saved && <p className="text-sm text-emerald-700">Saved.</p>}
        {save.isError && <p className="text-sm text-destructive">{getErrorMessage(save.error)}</p>}

        <Button type="submit" disabled={save.isPending || shop.status === "DISABLED"}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </form>
    </div>
  );
}
