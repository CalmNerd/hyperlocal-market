import { Router } from "express";
import { validate } from "../../middleware/errorHandler.js";
import { nearbyShopsQuerySchema, shopIdParamsSchema } from "./shop.schemas.js";
import * as shopService from "./shop.service.js";

export const shopRouter = Router();

shopRouter.get("/nearby", validate(nearbyShopsQuerySchema, "query"), async (req, res, next) => {
  try {
    const query = req.validatedQuery as Parameters<typeof shopService.listNearbyShops>[0];
    const shops = await shopService.listNearbyShops(query);
    res.status(200).json({ shops });
  } catch (error) {
    next(error);
  }
});

shopRouter.get("/:shopId/products", validate(shopIdParamsSchema, "params"), async (req, res, next) => {
  try {
    const params = req.validatedParams as { shopId: string };
    const result = await shopService.listShopProducts(params.shopId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
