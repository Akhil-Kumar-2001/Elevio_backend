import { Request, Response, NextFunction } from "express";

export const checkRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role) {
      return res.status(401).json({ message: "Unauthorized: No role assigned" });
    }

    if (req.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};
