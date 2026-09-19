"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCartItem } from "@/features/cart/api";
import { fetchNearbyShops, fetchShopProducts } from "./api";

export function useNearbyShops(coords: {
  latitude: number;
  longitude: number;
  radiusKm: number;
}) {
  return useQuery({
    queryKey: ["nearby-shops", coords],
    queryFn: () => fetchNearbyShops(coords.latitude, coords.longitude, coords.radiusKm),
  });
}

export function useShopProducts(shopId: string) {
  return useQuery({
    queryKey: ["shop-products", shopId],
    queryFn: () => fetchShopProducts(shopId),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity = 1 }: { productId: string; quantity?: number }) =>
      addCartItem(productId, quantity),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
