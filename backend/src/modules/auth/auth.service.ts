import bcrypt from "bcryptjs";
import { Role, VendorStatus } from "@prisma/client";
import { conflict, unauthorized } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { signToken } from "../../middleware/auth.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";

const SALT_ROUNDS = 10;

function toUser(user: { id: string; email: string; role: Role }) {
  return { id: user.id, email: user.email, role: user.role };
}

function toVendor(
  vendor: {
    id: string;
    shopName: string;
    status: VendorStatus;
    latitude: { toString(): string } | number;
    longitude: { toString(): string } | number;
  } | null,
) {
  if (!vendor) return null;
  return {
    id: vendor.id,
    shopName: vendor.shopName,
    status: vendor.status,
    latitude: Number(vendor.latitude),
    longitude: Number(vendor.longitude),
  };
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase();

  const taken = await prisma.user.findUnique({ where: { email } });
  if (taken) {
    throw conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  if (input.role === "VENDOR") {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.VENDOR,
        vendor: {
          create: {
            shopName: input.shopName!,
            latitude: input.latitude!,
            longitude: input.longitude!,
            status: VendorStatus.PENDING,
          },
        },
      },
      include: { vendor: true },
    });

    return {
      token: signToken(toUser(user)),
      user: toUser(user),
      vendor: toVendor(user.vendor),
    };
  }

  const user = await prisma.user.create({
    data: { email, passwordHash, role: Role.CUSTOMER },
  });

  return {
    token: signToken(toUser(user)),
    user: toUser(user),
    vendor: null,
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: { vendor: true },
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw unauthorized("Invalid email or password");
  }

  return {
    token: signToken(toUser(user)),
    user: toUser(user),
    vendor: toVendor(user.vendor),
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { vendor: true },
  });

  if (!user) {
    throw unauthorized("User no longer exists");
  }

  return {
    user: toUser(user),
    vendor: toVendor(user.vendor),
  };
}
