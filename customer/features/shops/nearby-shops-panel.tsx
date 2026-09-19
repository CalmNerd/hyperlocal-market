"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/state/query-states";
import { getErrorMessage } from "@/lib/api/errors";
import { useNearbyShops } from "./client";

export function NearbyShopsPanel() {
  const [lat, setLat] = useState("30.3165");
  const [lng, setLng] = useState("78.0322");
  const [radius, setRadius] = useState("5");
  const [search, setSearch] = useState({
    latitude: 30.3165,
    longitude: 78.0322,
    radiusKm: 5,
  });
  const [geoHint, setGeoHint] = useState<string | null>(null);

  const shops = useNearbyShops(search);

  function submit(e: FormEvent) {
    e.preventDefault();
    setSearch({
      latitude: Number(lat),
      longitude: Number(lng),
      radiusKm: Number(radius),
    });
  }

  function useGps() {
    setGeoHint(null);
    if (!navigator.geolocation) {
      setGeoHint("Geolocation isn't available here — enter coords manually.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(String(latitude));
        setLng(String(longitude));
        setSearch({ latitude, longitude, radiusKm: Number(radius) || 5 });
      },
      () => setGeoHint("Couldn't read location. Try typing lat/lng instead."),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nearby shops</h1>
        <p className="text-sm text-muted-foreground">Only approved vendors show up here.</p>
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded-3xl border bg-background/80 p-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="lat">Latitude</Label>
          <Input id="lat" value={lat} onChange={(e) => setLat(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="lng">Longitude</Label>
          <Input id="lng" value={lng} onChange={(e) => setLng(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="radius">Radius (km)</Label>
          <Input id="radius" value={radius} onChange={(e) => setRadius(e.target.value)} required />
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1">
            Search
          </Button>
          <Button type="button" variant="outline" onClick={useGps}>
            GPS
          </Button>
        </div>
      </form>

      {geoHint && <p className="text-sm text-destructive">{geoHint}</p>}
      {shops.isPending && <PageSkeleton />}
      {shops.isError && (
        <ErrorState message={getErrorMessage(shops.error)} onRetry={() => shops.refetch()} />
      )}
      {shops.isSuccess && shops.data.length === 0 && (
        <EmptyState title="Nothing nearby" description="Widen the radius or move the pin." />
      )}
      {shops.isSuccess && shops.data.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {shops.data.map((shop) => (
            <li key={shop.id} className="rounded-3xl border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">{shop.shopName}</h2>
                  <p className="text-sm text-muted-foreground">{shop.distanceKm.toFixed(2)} km away</p>
                </div>
                <Link href={`/shops/${shop.id}`}>
                  <Button>Browse</Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
