import { prisma } from "../../lib/prisma.js";
import { assertVendorCanOperate, requireVendorProfile, serializeVendor } from "./vendor.helpers.js";
import type { UpdateShopInput } from "./vendor.schemas.js";

export async function getMyShop(userId: string) {
  const vendor = await requireVendorProfile(userId);
  return serializeVendor(vendor);
}

export async function updateMyShop(userId: string, input: UpdateShopInput) {
  const vendor = await requireVendorProfile(userId);

  // disabled shops stay locked; pending vendors can still fix their details
  if (vendor.status === "DISABLED") {
    assertVendorCanOperate(vendor.status);
  }

  const updated = await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      shopName: input.shopName,
      latitude: input.latitude,
      longitude: input.longitude,
    },
  });

  return serializeVendor(updated);
}
