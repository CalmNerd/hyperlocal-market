import { ProductAvailability, VendorStatus } from "@prisma/client";
import { badRequest, conflict, notFound } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import type { AddCartItemInput, UpdateCartItemInput } from "./cart.schemas.js";

async function loadCart(customerId: string) {
  return prisma.cart.findUnique({
    where: { customerId },
    include: {
      vendor: { select: { shopName: true } },
      items: {
        include: { product: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

function shapeCart(cart: Awaited<ReturnType<typeof loadCart>>) {
  if (!cart) return null;

  const items = cart.items.map((item) => {
    const price = Number(item.product.price);
    return {
      id: item.id,
      quantity: item.quantity,
      lineTotal: price * item.quantity,
      product: {
        id: item.product.id,
        title: item.product.title,
        imageUrl: item.product.imageUrl,
        price,
        availability: item.product.availability,
        isDeleted: item.product.deletedAt != null,
      },
    };
  });

  return {
    id: cart.id,
    vendorId: cart.vendorId,
    shopName: cart.vendor.shopName,
    items,
    totalAmount: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
}

export async function getCart(customerId: string) {
  return shapeCart(await loadCart(customerId));
}

export async function addItem(customerId: string, input: AddCartItemInput) {
  const product = await prisma.product.findFirst({
    where: { id: input.productId, deletedAt: null },
    include: { vendor: true },
  });

  if (!product) throw notFound("Product not found");
  if (product.vendor.status !== VendorStatus.APPROVED) {
    throw badRequest("This shop is not accepting orders");
  }
  if (product.availability !== ProductAvailability.AVAILABLE) {
    throw conflict("Product is currently unavailable");
  }

  const cart = await prisma.cart.findUnique({ where: { customerId } });

  // one cart = one shop
  if (cart && cart.vendorId !== product.vendorId) {
    throw conflict(
      "Cart contains products from another shop. Clear the cart before adding items from a different shop.",
    );
  }

  if (!cart) {
    await prisma.cart.create({
      data: {
        customerId,
        vendorId: product.vendorId,
        items: {
          create: { productId: product.id, quantity: input.quantity },
        },
      },
    });
  } else {
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId: product.id },
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + input.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: product.id, quantity: input.quantity },
      });
    }
  }

  return getCart(customerId);
}

export async function updateItem(customerId: string, itemId: string, input: UpdateCartItemInput) {
  const cart = await prisma.cart.findUnique({ where: { customerId } });
  if (!cart) throw notFound("Cart not found");

  const updated = await prisma.cartItem.updateMany({
    where: { id: itemId, cartId: cart.id },
    data: { quantity: input.quantity },
  });

  if (updated.count === 0) throw notFound("Cart item not found");
  return getCart(customerId);
}

export async function removeItem(customerId: string, itemId: string) {
  const cart = await prisma.cart.findUnique({ where: { customerId } });
  if (!cart) throw notFound("Cart not found");

  const deleted = await prisma.cartItem.deleteMany({
    where: { id: itemId, cartId: cart.id },
  });
  if (deleted.count === 0) throw notFound("Cart item not found");

  const left = await prisma.cartItem.count({ where: { cartId: cart.id } });
  if (left === 0) {
    await prisma.cart.delete({ where: { id: cart.id } });
    return null;
  }

  return getCart(customerId);
}
