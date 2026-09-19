import { api } from "@/lib/api/client";

export type Cart = {
  id: string;
  vendorId: string;
  shopName: string;
  totalAmount: number;
  items: Array<{
    id: string;
    quantity: number;
    lineTotal: number;
    product: {
      id: string;
      title: string;
      imageUrl: string | null;
      price: number;
      availability: string;
      isDeleted: boolean;
    };
  }>;
} | null;

export async function fetchCart() {
  const { data } = await api.get<{ cart: Cart }>("/api/cart");
  return data.cart;
}

export async function addCartItem(productId: string, quantity: number) {
  const { data } = await api.post<{ cart: Cart }>("/api/cart/items", { productId, quantity });
  return data.cart;
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { data } = await api.patch<{ cart: Cart }>(`/api/cart/items/${itemId}`, { quantity });
  return data.cart;
}

export async function removeCartItem(itemId: string) {
  const { data } = await api.delete<{ cart: Cart }>(`/api/cart/items/${itemId}`);
  return data.cart;
}
