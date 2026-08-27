import { Router } from "express";
import * as authService from "../services/authService";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const user = await authService.register({
    companyName: String(req.body?.companyName ?? ""),
    country: String(req.body?.country ?? ""),
    email: String(req.body?.email ?? ""),
    password: String(req.body?.password ?? ""),
  });
  res.status(201).json({ user });
});

authRouter.post("/login", async (req, res) => {
  const result = await authService.login({
    email: String(req.body?.email ?? ""),
    password: String(req.body?.password ?? ""),
  });
  res.json(result);
});

authRouter.post("/logout", requireAuth, (_req, res) => {
  res.status(204).send();
});
