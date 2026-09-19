import cors from "cors";
import express from "express";
import { getCorsOrigins } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { productRouter } from "./modules/product/product.routes.js";
import { shopRouter } from "./modules/shop/shop.routes.js";
import { vendorRouter } from "./modules/vendor/vendor.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: getCorsOrigins(),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/vendor", vendorRouter);
  app.use("/api/vendor/products", productRouter);
  app.use("/api/shops", shopRouter);

  app.use(errorHandler);

  return app;
}
