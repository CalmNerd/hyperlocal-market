import { api } from "@/lib/api/client";

export type NearbyShop = {
  id: string;
  shopName: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
};

export type ShopProduct = {
  id: string;
  vendorId: string;
  title: string;
  imageUrl: string | null;
  price: number;
  availability: "AVAILABLE" | "UNAVAILABLE";
};

export async function fetchNearbyShops(latitude: number, longitude: number, radiusKm = 5) {
  const { data } = await api.get<{ shops: NearbyShop[] }>("/api/shops/nearby", {
    params: { latitude, longitude, radiusKm },
  });
  return data.shops;
}

export async function fetchShopProducts(shopId: string) {
  const { data } = await api.get<{
    shop: { id: string; shopName: string; latitude: number; longitude: number };
    products: ShopProduct[];
  }>(`/api/shops/${shopId}/products`);
  return data;
}
