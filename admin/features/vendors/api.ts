import { api } from "@/lib/api/client";

export type AdminVendor = {
  id: string;
  shopName: string;
  email: string;
  latitude: number;
  longitude: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISABLED";
  productCount: number;
  orderCount: number;
  createdAt: string;
};

export type AdminOrder = {
  id: string;
  customerEmail: string;
  shopName?: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    productTitle: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
};

export async function fetchVendors() {
  const { data } = await api.get<{ vendors: AdminVendor[] }>("/api/admin/vendors");
  return data.vendors;
}

export async function approveVendor(id: string) {
  const { data } = await api.patch<{ vendor: AdminVendor }>(`/api/admin/vendors/${id}/approve`);
  return data.vendor;
}

export async function rejectVendor(id: string) {
  const { data } = await api.patch<{ vendor: AdminVendor }>(`/api/admin/vendors/${id}/reject`);
  return data.vendor;
}

export async function disableVendor(id: string) {
  const { data } = await api.patch<{ vendor: AdminVendor }>(`/api/admin/vendors/${id}/disable`);
  return data.vendor;
}

export async function fetchAdminOrders() {
  const { data } = await api.get<{ orders: AdminOrder[] }>("/api/admin/orders");
  return data.orders;
}
