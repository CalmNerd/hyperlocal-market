import { ProductAvailability, VendorStatus } from "@prisma/client";
import { notFound } from "../../lib/errors.js";
import { haversineDistanceKm } from "../../lib/haversine.js";
import { prisma } from "../../lib/prisma.js";
import type { NearbyShopsQuery } from "./shop.schemas.js";

export async function listNearbyShops(query: NearbyShopsQuery) {
  const vendors = await prisma.vendor.findMany({
    where: { status: VendorStatus.APPROVED },
  });

  return vendors
    .map((vendor) => {
      const distanceKm = haversineDistanceKm(
        query.latitude,
        query.longitude,
        Number(vendor.latitude),
        Number(vendor.longitude),
      );

      return {
        id: vendor.id,
        shopName: vendor.shopName,
        latitude: Number(vendor.latitude),
        longitude: Number(vendor.longitude),
        distanceKm: Number(distanceKm.toFixed(3)),
      };
    })
    .filter((shop) => shop.distanceKm <= query.radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function listShopProducts(shopId: string) {
  const vendor = await prisma.vendor.findFirst({
    where: { id: shopId, status: VendorStatus.APPROVED },
  });

  if (!vendor) throw notFound("Shop not found");

  const products = await prisma.product.findMany({
    where: {
      vendorId: vendor.id,
      deletedAt: null,
      availability: ProductAvailability.AVAILABLE,
    },
    orderBy: { title: "asc" },
  });

  return {
    shop: {
      id: vendor.id,
      shopName: vendor.shopName,
      latitude: Number(vendor.latitude),
      longitude: Number(vendor.longitude),
    },
    products: products.map((p) => ({
      id: p.id,
      vendorId: p.vendorId,
      title: p.title,
      imageUrl: p.imageUrl,
      price: Number(p.price),
      availability: p.availability,
    })),
  };
}
