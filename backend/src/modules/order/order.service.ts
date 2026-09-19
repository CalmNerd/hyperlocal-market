import { ProductAvailability, VendorStatus, type Prisma } from "@prisma/client";
import { badRequest, conflict, notFound } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

function shapeOrder(order: {
  id: string;
  customerId: string;
  vendorId: string;
  totalAmount: Prisma.Decimal | number;
  createdAt: Date;
  vendor?: { shopName: string };
  items: Array<{
    id: string;
    productId: string | null;
    productTitle: string;
    unitPrice: Prisma.Decimal | number;
    quantity: number;
    subtotal: Prisma.Decimal | number;
  }>;
}) {
  return {
    id: order.id,
    customerId: order.customerId,
    vendorId: order.vendorId,
    shopName: order.vendor?.shopName,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productTitle: item.productTitle,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
    })),
  };
}

export async function listMyOrders(customerId: string) {
  const orders = await prisma.order.findMany({
    where: { customerId },
    include: {
      vendor: { select: { shopName: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(shapeOrder);
}

export async function placeOrder(customerId: string) {
  // keep checkout atomic — invent totals from live product rows, not the cart cache
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { customerId },
      include: {
        items: { include: { product: true } },
        vendor: true,
      },
    });

    if (!cart?.items.length) throw badRequest("Cart is empty");
    if (cart.vendor.status !== VendorStatus.APPROVED) {
      throw conflict("This shop is not currently accepting orders");
    }

    const lines: Array<{
      productId: string;
      productTitle: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }> = [];

    let total = 0;

    for (const item of cart.items) {
      const { product } = item;

      if (product.deletedAt) {
        throw conflict(`Product "${product.title}" is no longer available`);
      }
      if (product.availability !== ProductAvailability.AVAILABLE) {
        throw conflict(`Product "${product.title}" is currently unavailable`);
      }
      if (product.vendorId !== cart.vendorId) {
        throw conflict("Cart contains products from another shop");
      }

      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      lines.push({
        productId: product.id,
        productTitle: product.title,
        unitPrice,
        quantity: item.quantity,
        subtotal,
      });
    }

    const order = await tx.order.create({
      data: {
        customerId,
        vendorId: cart.vendorId,
        totalAmount: total,
        items: {
          create: lines,
        },
      },
      include: {
        vendor: { select: { shopName: true } },
        items: true,
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.delete({ where: { id: cart.id } });

    return shapeOrder(order);
  });
}

export async function listAllOrders() {
  const orders = await prisma.order.findMany({
    include: {
      vendor: { select: { shopName: true } },
      customer: { select: { id: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    ...shapeOrder(order),
    customerEmail: order.customer.email,
  }));
}

export async function getOrderForCustomer(customerId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId },
    include: {
      vendor: { select: { shopName: true } },
      items: true,
    },
  });

  if (!order) throw notFound("Order not found");
  return shapeOrder(order);
}
