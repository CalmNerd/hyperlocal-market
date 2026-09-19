import { z } from "zod";

export const vendorIdParamsSchema = z.object({
  id: z.string().uuid(),
});
