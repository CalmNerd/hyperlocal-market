import bcrypt from "bcryptjs";
import request from "supertest";
import { ProductAvailability, Role, VendorStatus } from "@prisma/client";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

export const app = createApp();

export async function resetDatabase() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();
}

export async function createUser(opts: {
  email: string;
  password?: string;
  role: Role;
}) {
  const passwordHash = await bcrypt.hash(opts.password ?? "Password123!", 10);
  return prisma.user.create({
    data: {
      email: opts.email.toLowerCase(),
      passwordHash,
      role: opts.role,
    },
  });
}

export async function createVendorUser(opts: {
  email: string;
  shopName?: string;
  status?: VendorStatus;
  latitude?: number;
  longitude?: number;
  password?: string;
}) {
  const passwordHash = await bcrypt.hash(opts.password ?? "Password123!", 10);
  return prisma.user.create({
    data: {
      email: opts.email.toLowerCase(),
      passwordHash,
      role: Role.VENDOR,
      vendor: {
        create: {
          shopName: opts.shopName ?? "Test Shop",
          latitude: opts.latitude ?? 30.3165,
          longitude: opts.longitude ?? 78.0322,
          status: opts.status ?? VendorStatus.APPROVED,
        },
      },
    },
    include: { vendor: true },
  });
}

export async function login(email: string, password = "Password123!") {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  }
  return res.body.token as string;
}

export async function authGet(token: string, url: string) {
  return request(app).get(url).set("Authorization", `Bearer ${token}`);
}

export async function authPost(token: string, url: string, body?: object) {
  return request(app).post(url).set("Authorization", `Bearer ${token}`).send(body);
}

export async function authPatch(token: string, url: string, body?: object) {
  return request(app).patch(url).set("Authorization", `Bearer ${token}`).send(body);
}

export async function authPut(token: string, url: string, body?: object) {
  return request(app).put(url).set("Authorization", `Bearer ${token}`).send(body);
}

export async function authDelete(token: string, url: string) {
  return request(app).delete(url).set("Authorization", `Bearer ${token}`);
}

export { ProductAvailability, Role, VendorStatus, prisma };
