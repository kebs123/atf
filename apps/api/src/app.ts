import express from "express";
import cors from "cors";
import helmet from "helmet";
import { requestId } from "./middleware/requestId";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestId);

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
