import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { validate } from "../../middleware/errorHandler.js";
import { updateShopSchema } from "./vendor.schemas.js";
import * as vendorService from "./vendor.service.js";

export const vendorRouter = Router();

vendorRouter.use(authenticate, requireRoles(Role.VENDOR));

vendorRouter.get("/shop", async (req, res, next) => {
  try {
    const shop = await vendorService.getMyShop(req.user!.id);
    res.status(200).json({ shop });
  } catch (error) {
    next(error);
  }
});

vendorRouter.put("/shop", validate(updateShopSchema), async (req, res, next) => {
  try {
    const shop = await vendorService.updateMyShop(req.user!.id, req.body);
    res.status(200).json({ shop });
  } catch (error) {
    next(error);
  }
});
