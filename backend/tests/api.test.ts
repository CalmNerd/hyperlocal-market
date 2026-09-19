import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import {
  app,
  authDelete,
  authGet,
  authPatch,
  authPost,
  createUser,
  createVendorUser,
  login,
  prisma,
  ProductAvailability,
  resetDatabase,
  Role,
  VendorStatus,
} from "./helpers.js";

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("auth", () => {
  it("registers a customer", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "alice@example.com",
      password: "Password123!",
      role: "CUSTOMER",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("CUSTOMER");
    expect(res.body.token).toBeTruthy();
  });

  it("registers a vendor as PENDING", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "shop@example.com",
      password: "Password123!",
      role: "VENDOR",
      shopName: "My Shop",
      latitude: 30.3,
      longitude: 78.0,
    });

    expect(res.status).toBe(201);
    expect(res.body.vendor.status).toBe("PENDING");
  });

  it("rejects duplicate email", async () => {
    await createUser({ email: "dup@example.com", role: Role.CUSTOMER });
    const res = await request(app).post("/api/auth/register").send({
      email: "dup@example.com",
      password: "Password123!",
      role: "CUSTOMER",
    });
    expect(res.status).toBe(409);
  });

  it("rejects invalid login", async () => {
    await createUser({ email: "bob@example.com", role: Role.CUSTOMER });
    const res = await request(app).post("/api/auth/login").send({
      email: "bob@example.com",
      password: "wrong-password",
    });
    expect(res.status).toBe(401);
  });

  it("rejects tokens after tokenVersion is incremented", async () => {
    const user = await createUser({ email: "revoke@example.com", role: Role.CUSTOMER });
    const token = await login("revoke@example.com");

    const before = await authGet(token, "/api/auth/me");
    expect(before.status).toBe(200);

    await prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: { increment: 1 } },
    });

    const after = await authGet(token, "/api/auth/me");
    expect(after.status).toBe(401);

    const freshToken = await login("revoke@example.com");
    const me = await authGet(freshToken, "/api/auth/me");
    expect(me.status).toBe(200);
  });
});

describe("vendor product ownership", () => {
  it("lets a vendor manage their own products", async () => {
    const vendor = await createVendorUser({ email: "v1@example.com" });
    const token = await login("v1@example.com");

    const created = await authPost(token, "/api/vendor/products", {
      title: "Milk",
      price: 50,
      imageUrl: "https://placehold.co/100",
      availability: "AVAILABLE",
    });
    expect(created.status).toBe(201);

    const productId = created.body.product.id as string;
    const updated = await authPatch(token, `/api/vendor/products/${productId}`, { price: 55 });
    expect(updated.status).toBe(200);
    expect(updated.body.product.price).toBe(55);

    const deleted = await authDelete(token, `/api/vendor/products/${productId}`);
    expect(deleted.status).toBe(204);

    // Soft-deleted product stays in DB.
    const row = await prisma.product.findUnique({ where: { id: productId } });
    expect(row?.deletedAt).not.toBeNull();
    expect(vendor.vendor).toBeTruthy();
  });

  it("blocks updating another vendor product", async () => {
    const owner = await createVendorUser({ email: "owner@example.com" });
    const product = await prisma.product.create({
      data: {
        vendorId: owner.vendor!.id,
        title: "Bread",
        price: 40,
        availability: ProductAvailability.AVAILABLE,
      },
    });

    await createVendorUser({ email: "other@example.com" });
    const otherToken = await login("other@example.com");

    const res = await authPatch(otherToken, `/api/vendor/products/${product.id}`, { title: "Hacked" });
    expect(res.status).toBe(404);
  });

  it("blocks deleting another vendor product", async () => {
    const owner = await createVendorUser({ email: "owner2@example.com" });
    const product = await prisma.product.create({
      data: {
        vendorId: owner.vendor!.id,
        title: "Eggs",
        price: 80,
        availability: ProductAvailability.AVAILABLE,
      },
    });

    await createVendorUser({ email: "other2@example.com" });
    const otherToken = await login("other2@example.com");

    const res = await authDelete(otherToken, `/api/vendor/products/${product.id}`);
    expect(res.status).toBe(404);
  });
});

describe("cart", () => {
  it("supports add, update, remove and blocks cross-vendor items", async () => {
    const vendorA = await createVendorUser({ email: "va@example.com", shopName: "Shop A" });
    const vendorB = await createVendorUser({ email: "vb@example.com", shopName: "Shop B", latitude: 30.4, longitude: 78.1 });

    const productA = await prisma.product.create({
      data: {
        vendorId: vendorA.vendor!.id,
        title: "Milk",
        price: 50,
        availability: ProductAvailability.AVAILABLE,
      },
    });
    const productB = await prisma.product.create({
      data: {
        vendorId: vendorB.vendor!.id,
        title: "Juice",
        price: 60,
        availability: ProductAvailability.AVAILABLE,
      },
    });

    await createUser({ email: "cust@example.com", role: Role.CUSTOMER });
    const token = await login("cust@example.com");

    const added = await authPost(token, "/api/cart/items", { productId: productA.id, quantity: 2 });
    expect(added.status).toBe(200);
    expect(added.body.cart.items).toHaveLength(1);

    const itemId = added.body.cart.items[0].id as string;
    const updated = await authPatch(token, `/api/cart/items/${itemId}`, { quantity: 3 });
    expect(updated.body.cart.items[0].quantity).toBe(3);

    const conflict = await authPost(token, "/api/cart/items", { productId: productB.id, quantity: 1 });
    expect(conflict.status).toBe(409);

    const removed = await authDelete(token, `/api/cart/items/${itemId}`);
    expect(removed.status).toBe(200);
    expect(removed.body.cart).toBeNull();
  });
});

describe("checkout", () => {
  it("creates an order with price snapshot and clears the cart", async () => {
    const vendor = await createVendorUser({ email: "checkout-v@example.com" });
    const product = await prisma.product.create({
      data: {
        vendorId: vendor.vendor!.id,
        title: "Milk",
        price: 50,
        availability: ProductAvailability.AVAILABLE,
      },
    });

    await createUser({ email: "checkout-c@example.com", role: Role.CUSTOMER });
    const token = await login("checkout-c@example.com");

    await authPost(token, "/api/cart/items", { productId: product.id, quantity: 2 });

    // Price change after cart add — checkout must use current DB price.
    await prisma.product.update({ where: { id: product.id }, data: { price: 70 } });

    const orderRes = await authPost(token, "/api/orders");
    expect(orderRes.status).toBe(201);
    expect(orderRes.body.order.totalAmount).toBe(140);
    expect(orderRes.body.order.items[0].unitPrice).toBe(70);
    expect(orderRes.body.order.items[0].productTitle).toBe("Milk");

    const cartRes = await authGet(token, "/api/cart");
    expect(cartRes.body.cart).toBeNull();
  });

  it("rejects empty cart and unavailable products", async () => {
    await createUser({ email: "empty@example.com", role: Role.CUSTOMER });
    const token = await login("empty@example.com");

    const empty = await authPost(token, "/api/orders");
    expect(empty.status).toBe(400);

    const vendor = await createVendorUser({ email: "unavail-v@example.com" });
    const product = await prisma.product.create({
      data: {
        vendorId: vendor.vendor!.id,
        title: "Bread",
        price: 40,
        availability: ProductAvailability.AVAILABLE,
      },
    });

    await authPost(token, "/api/cart/items", { productId: product.id, quantity: 1 });
    await prisma.product.update({
      where: { id: product.id },
      data: { availability: ProductAvailability.UNAVAILABLE },
    });

    const unavailable = await authPost(token, "/api/orders");
    expect(unavailable.status).toBe(409);
  });
});

describe("admin", () => {
  it("allows admin to approve and disable vendors; blocks non-admin", async () => {
    const pending = await createVendorUser({
      email: "pending@example.com",
      status: VendorStatus.PENDING,
    });

    await createUser({ email: "admin@example.com", role: Role.ADMIN });
    const adminToken = await login("admin@example.com");

    await createUser({ email: "not-admin@example.com", role: Role.CUSTOMER });
    const customerToken = await login("not-admin@example.com");

    const forbidden = await authPatch(customerToken, `/api/admin/vendors/${pending.vendor!.id}/approve`);
    expect(forbidden.status).toBe(403);

    const approved = await authPatch(adminToken, `/api/admin/vendors/${pending.vendor!.id}/approve`);
    expect(approved.status).toBe(200);
    expect(approved.body.vendor.status).toBe("APPROVED");

    const disabled = await authPatch(adminToken, `/api/admin/vendors/${pending.vendor!.id}/disable`);
    expect(disabled.status).toBe(200);
    expect(disabled.body.vendor.status).toBe("DISABLED");
  });
});
