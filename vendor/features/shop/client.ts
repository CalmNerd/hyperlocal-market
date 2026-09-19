"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  fetchMyProducts,
  fetchMyShop,
  updateMyShop,
  updateProduct,
  type Product,
} from "./api";

export function useMyShop() {
  return useQuery({
    queryKey: ["vendor-shop"],
    queryFn: fetchMyShop,
  });
}

export function useUpdateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyShop,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vendor-shop"] });
    },
  });
}

export function useMyProducts() {
  return useQuery({
    queryKey: ["vendor-products"],
    queryFn: fetchMyProducts,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<Product, "availability" | "price" | "title" | "imageUrl">>;
    }) => updateProduct(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    },
  });
}
