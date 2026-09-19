import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, ProductAvailability, Role, VendorStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  await prisma.user.create({
    data: {
      email: "admin@marketplace.local",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: "customer@marketplace.local",
      passwordHash,
      role: Role.CUSTOMER,
    },
  });

  await prisma.user.create({
    data: {
      email: "vendor@marketplace.local",
      passwordHash,
      role: Role.VENDOR,
      vendor: {
        create: {
          shopName: "Green Valley Grocer",
          latitude: 30.3165,
          longitude: 78.0322,
          status: VendorStatus.APPROVED,
          products: {
            create: [
              {
                title: "Fresh Milk 1L",
                imageUrl: "https://placehold.co/400x400?text=Milk",
                price: 50,
                availability: ProductAvailability.AVAILABLE,
              },
              {
                title: "Whole Wheat Bread",
                imageUrl: "https://placehold.co/400x400?text=Bread",
                price: 40,
                availability: ProductAvailability.AVAILABLE,
              },
              {
                title: "Farm Eggs (12)",
                imageUrl: "https://placehold.co/400x400?text=Eggs",
                price: 80,
                availability: ProductAvailability.UNAVAILABLE,
              },
            ],
          },
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "pending-vendor@marketplace.local",
      passwordHash,
      role: Role.VENDOR,
      vendor: {
        create: {
          shopName: "Corner Mart (Pending)",
          latitude: 30.32,
          longitude: 78.04,
          status: VendorStatus.PENDING,
        },
      },
    },
  });

  console.log("Seeded demo users (password: Password123!)");
  console.log("  admin@marketplace.local");
  console.log("  customer@marketplace.local");
  console.log("  vendor@marketplace.local");
  console.log("  pending-vendor@marketplace.local");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
