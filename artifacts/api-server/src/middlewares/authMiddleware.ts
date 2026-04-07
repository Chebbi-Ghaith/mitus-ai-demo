import type { Request, Response, NextFunction } from "express";

export function isAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}
