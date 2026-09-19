import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    role: z.enum(["CUSTOMER", "VENDOR"]),
    shopName: z.string().min(2).max(120).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "VENDOR") return;

    if (!data.shopName) {
      ctx.addIssue({ code: "custom", path: ["shopName"], message: "Shop name is required for vendors" });
    }
    if (data.latitude === undefined) {
      ctx.addIssue({ code: "custom", path: ["latitude"], message: "Latitude is required for vendors" });
    }
    if (data.longitude === undefined) {
      ctx.addIssue({ code: "custom", path: ["longitude"], message: "Longitude is required for vendors" });
    }
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
