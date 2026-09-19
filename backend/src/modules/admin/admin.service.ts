import { VendorStatus } from "@prisma/client";
import { badRequest, notFound } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { listAllOrders } from "../order/order.service.js";
import { serializeVendor } from "../vendor/vendor.helpers.js";

export async function listVendors() {
  const vendors = await prisma.vendor.findMany({
    include: {
      user: { select: { id: true, email: true, createdAt: true } },
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return vendors.map((v) => ({
    ...serializeVendor(v),
    email: v.user.email,
    productCount: v._count.products,
    orderCount: v._count.orders,
  }));
}

export async function approveVendor(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw notFound("Vendor not found");

  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: { status: VendorStatus.APPROVED },
  });

  return serializeVendor(updated);
}

export async function rejectVendor(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw notFound("Vendor not found");
  if (vendor.status !== VendorStatus.PENDING) {
    throw badRequest("Only pending vendors can be rejected");
  }

  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: { status: VendorStatus.REJECTED },
  });

  return serializeVendor(updated);
}

export async function disableVendor(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw notFound("Vendor not found");
  if (vendor.status !== VendorStatus.APPROVED) {
    throw badRequest("Only approved vendors can be disabled");
  }

  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: { status: VendorStatus.DISABLED },
  });

  return serializeVendor(updated);
}

export { listAllOrders };
