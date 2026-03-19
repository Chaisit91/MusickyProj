import { Request, Response, NextFunction } from "express";

// อ่าน role จาก req.user ที่ authMiddleware decode ไว้แล้ว
// ไม่ต้อง query DB ซ้ำทุก request
export const roleMiddleware = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized: No user found" });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
      return;
    }

    next();
  };
};
