import { z } from "zod";

export const updateShopSchema = z.object({
  shopName: z.string().min(2).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type UpdateShopInput = z.infer<typeof updateShopSchema>;
