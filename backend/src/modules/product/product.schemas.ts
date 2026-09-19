import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  imageUrl: z.string().url().max(2048).optional().nullable(),
  price: z.number().positive().max(1_000_000),
  availability: z.enum(["AVAILABLE", "UNAVAILABLE"]).default("AVAILABLE"),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  imageUrl: z.string().url().max(2048).optional().nullable(),
  price: z.number().positive().max(1_000_000).optional(),
  availability: z.enum(["AVAILABLE", "UNAVAILABLE"]).optional(),
});

export const productIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
