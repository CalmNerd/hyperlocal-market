import { z } from "zod";

export const nearbyShopsQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(100).default(5),
});

export const shopIdParamsSchema = z.object({
  shopId: z.string().uuid(),
});

export type NearbyShopsQuery = z.infer<typeof nearbyShopsQuerySchema>;
