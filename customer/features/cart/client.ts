"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCart, removeCartItem, updateCartItem } from "./api";
import { placeOrder } from "@/features/orders/api";

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: placeOrder,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);
    },
  });
}
