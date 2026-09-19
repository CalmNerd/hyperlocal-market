import { api } from "@/lib/api/client";

export type Shop = {
  id: string;
  shopName: string;
  latitude: number;
  longitude: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISABLED";
};

export type Product = {
  id: string;
  vendorId: string;
  title: string;
  imageUrl: string | null;
  price: number;
  availability: "AVAILABLE" | "UNAVAILABLE";
};

export async function fetchMyShop() {
  const { data } = await api.get<{ shop: Shop }>("/api/vendor/shop");
  return data.shop;
}

export async function updateMyShop(input: {
  shopName: string;
  latitude: number;
  longitude: number;
}) {
  const { data } = await api.put<{ shop: Shop }>("/api/vendor/shop", input);
  return data.shop;
}

export async function fetchMyProducts() {
  const { data } = await api.get<{ products: Product[] }>("/api/vendor/products");
  return data.products;
}

export async function createProduct(input: {
  title: string;
  imageUrl?: string | null;
  price: number;
  availability: "AVAILABLE" | "UNAVAILABLE";
}) {
  const { data } = await api.post<{ product: Product }>("/api/vendor/products", input);
  return data.product;
}

export async function updateProduct(
  id: string,
  input: Partial<{
    title: string;
    imageUrl: string | null;
    price: number;
    availability: "AVAILABLE" | "UNAVAILABLE";
  }>,
) {
  const { data } = await api.patch<{ product: Product }>(`/api/vendor/products/${id}`, input);
  return data.product;
}

export async function deleteProduct(id: string) {
  await api.delete(`/api/vendor/products/${id}`);
}
