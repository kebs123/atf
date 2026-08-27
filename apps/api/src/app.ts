import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { requestId } from "./middleware/requestId";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  // Behind a tunnel or reverse proxy every request arrives from 127.0.0.1; without this
  // the per-IP rate limits in middleware/rateLimit.ts become one shared bucket.
  if (env.trustProxy > 0) {
    app.set("trust proxy", env.trustProxy);
  }

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestId);

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api", apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
