import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { validate } from "../../middleware/errorHandler.js";
import { vendorIdParamsSchema } from "./admin.schemas.js";
import * as adminService from "./admin.service.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRoles(Role.ADMIN));

adminRouter.get("/vendors", async (_req, res, next) => {
  try {
    const vendors = await adminService.listVendors();
    res.status(200).json({ vendors });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch(
  "/vendors/:id/approve",
  validate(vendorIdParamsSchema, "params"),
  async (req, res, next) => {
    try {
      const params = req.validatedParams as { id: string };
      const vendor = await adminService.approveVendor(params.id);
      res.status(200).json({ vendor });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.patch(
  "/vendors/:id/reject",
  validate(vendorIdParamsSchema, "params"),
  async (req, res, next) => {
    try {
      const params = req.validatedParams as { id: string };
      const vendor = await adminService.rejectVendor(params.id);
      res.status(200).json({ vendor });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.patch(
  "/vendors/:id/disable",
  validate(vendorIdParamsSchema, "params"),
  async (req, res, next) => {
    try {
      const params = req.validatedParams as { id: string };
      const vendor = await adminService.disableVendor(params.id);
      res.status(200).json({ vendor });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.get("/orders", async (_req, res, next) => {
  try {
    const orders = await adminService.listAllOrders();
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
});
