import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import * as orderService from "./order.service.js";

export const orderRouter = Router();

orderRouter.use(authenticate, requireRoles(Role.CUSTOMER));

orderRouter.get("/", async (req, res, next) => {
  try {
    const orders = await orderService.listMyOrders(req.user!.id);
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
});

orderRouter.post("/", async (req, res, next) => {
  try {
    const order = await orderService.placeOrder(req.user!.id);
    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});
