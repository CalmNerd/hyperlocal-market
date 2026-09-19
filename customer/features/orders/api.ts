import { api } from "@/lib/api/client";

export type Order = {
  id: string;
  vendorId: string;
  shopName?: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string | null;
    productTitle: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
};

export async function fetchOrders() {
  const { data } = await api.get<{ orders: Order[] }>("/api/orders");
  return data.orders;
}

export async function placeOrder() {
  const { data } = await api.post<{ order: Order }>("/api/orders");
  return data.order;
}
