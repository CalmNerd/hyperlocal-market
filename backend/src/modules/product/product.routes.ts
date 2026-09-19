import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { validate } from "../../middleware/errorHandler.js";
import {
  createProductSchema,
  productIdParamsSchema,
  updateProductSchema,
} from "./product.schemas.js";
import * as productService from "./product.service.js";

export const productRouter = Router();

productRouter.use(authenticate, requireRoles(Role.VENDOR));

productRouter.get("/", async (req, res, next) => {
  try {
    const products = await productService.listMyProducts(req.user!.id);
    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
});

productRouter.post("/", validate(createProductSchema), async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.user!.id, req.body);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

productRouter.patch(
  "/:id",
  validate(productIdParamsSchema, "params"),
  validate(updateProductSchema),
  async (req, res, next) => {
    try {
      const params = req.validatedParams as { id: string };
      const product = await productService.updateProduct(req.user!.id, params.id, req.body);
      res.status(200).json({ product });
    } catch (error) {
      next(error);
    }
  },
);

productRouter.delete("/:id", validate(productIdParamsSchema, "params"), async (req, res, next) => {
  try {
    const params = req.validatedParams as { id: string };
    await productService.deleteProduct(req.user!.id, params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
