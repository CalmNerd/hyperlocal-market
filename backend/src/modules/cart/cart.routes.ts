import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { validate } from "../../middleware/errorHandler.js";
import { addCartItemSchema, cartItemIdParamsSchema, updateCartItemSchema } from "./cart.schemas.js";
import * as cartService from "./cart.service.js";

export const cartRouter = Router();

cartRouter.use(authenticate, requireRoles(Role.CUSTOMER));

cartRouter.get("/", async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user!.id);
    res.status(200).json({ cart });
  } catch (error) {
    next(error);
  }
});

cartRouter.post("/items", validate(addCartItemSchema), async (req, res, next) => {
  try {
    const cart = await cartService.addItem(req.user!.id, req.body);
    res.status(200).json({ cart });
  } catch (error) {
    next(error);
  }
});

cartRouter.patch(
  "/items/:itemId",
  validate(cartItemIdParamsSchema, "params"),
  validate(updateCartItemSchema),
  async (req, res, next) => {
    try {
      const params = req.validatedParams as { itemId: string };
      const cart = await cartService.updateItem(req.user!.id, params.itemId, req.body);
      res.status(200).json({ cart });
    } catch (error) {
      next(error);
    }
  },
);

cartRouter.delete(
  "/items/:itemId",
  validate(cartItemIdParamsSchema, "params"),
  async (req, res, next) => {
    try {
      const params = req.validatedParams as { itemId: string };
      const cart = await cartService.removeItem(req.user!.id, params.itemId);
      res.status(200).json({ cart });
    } catch (error) {
      next(error);
    }
  },
);
