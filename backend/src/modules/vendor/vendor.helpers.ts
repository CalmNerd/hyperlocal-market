import { VendorStatus } from "@prisma/client";
import { forbidden, notFound } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

export async function requireVendorProfile(userId: string) {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) throw notFound("Vendor profile not found");
  return vendor;
}

export function assertVendorCanOperate(status: VendorStatus) {
  if (status === VendorStatus.APPROVED) return;

  const messages: Record<Exclude<VendorStatus, "APPROVED">, string> = {
    PENDING: "Your shop is pending admin approval",
    REJECTED: "Your shop registration was rejected",
    DISABLED: "Your shop has been disabled",
  };

  throw forbidden(messages[status]);
}

export function serializeVendor(vendor: {
  id: string;
  shopName: string;
  latitude: { toString(): string } | number;
  longitude: { toString(): string } | number;
  status: VendorStatus;
  createdAt: Date;
  updatedAt?: Date;
}) {
  return {
    id: vendor.id,
    shopName: vendor.shopName,
    latitude: Number(vendor.latitude),
    longitude: Number(vendor.longitude),
    status: vendor.status,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
  };
}
