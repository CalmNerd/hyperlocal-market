"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveVendor,
  disableVendor,
  fetchAdminOrders,
  fetchVendors,
  rejectVendor,
} from "./api";

export function useVendors() {
  return useQuery({
    queryKey: ["admin-vendors"],
    queryFn: fetchVendors,
  });
}

export function useApproveVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveVendor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
    },
  });
}

export function useRejectVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectVendor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
    },
  });
}

export function useDisableVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disableVendor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
    },
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchAdminOrders,
  });
}
