import { ProductAvailability } from "@prisma/client";
import { notFound } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { assertVendorCanOperate, requireVendorProfile } from "../vendor/vendor.helpers.js";
import type { CreateProductInput, UpdateProductInput } from "./product.schemas.js";

function shapeProduct(product: {
  id: string;
  vendorId: string;
  title: string;
  imageUrl: string | null;
  price: { toString(): string } | number;
  availability: ProductAvailability;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: product.id,
    vendorId: product.vendorId,
    title: product.title,
    imageUrl: product.imageUrl,
    price: Number(product.price),
    availability: product.availability,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function listMyProducts(userId: string) {
  const vendor = await requireVendorProfile(userId);
  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return products.map(shapeProduct);
}

export async function createProduct(userId: string, input: CreateProductInput) {
  const vendor = await requireVendorProfile(userId);
  assertVendorCanOperate(vendor.status);

  const product = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      title: input.title,
      imageUrl: input.imageUrl ?? null,
      price: input.price,
      availability: input.availability,
    },
  });

  return shapeProduct(product);
}

export async function updateProduct(userId: string, productId: string, input: UpdateProductInput) {
  const vendor = await requireVendorProfile(userId);
  assertVendorCanOperate(vendor.status);

  // scope by vendorId so you can't touch someone else's product
  const result = await prisma.product.updateMany({
    where: { id: productId, vendorId: vendor.id, deletedAt: null },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.availability !== undefined && { availability: input.availability }),
    },
  });

  if (result.count === 0) throw notFound("Product not found");

  const product = await prisma.product.findFirstOrThrow({
    where: { id: productId, vendorId: vendor.id },
  });
  return shapeProduct(product);
}

export async function deleteProduct(userId: string, productId: string) {
  const vendor = await requireVendorProfile(userId);
  assertVendorCanOperate(vendor.status);

  const result = await prisma.product.updateMany({
    where: { id: productId, vendorId: vendor.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  if (result.count === 0) throw notFound("Product not found");
}
