import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthPayload extends JwtPayload {
  sub?: string;
  role?: string;
  email?: string;
}

// เพิ่ม user type ใน Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}

// ต้อง login — ถ้าไม่มี token ตีกลับ 401/403 ทันที
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(403).json({ success: false, message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as AuthPayload;

    const userId = decoded.sub;

    if (!userId) {
      res.status(401).json({ success: false, message: "Invalid token payload" });
      return;
    }

    req.user = {
      id: userId,
      role: decoded.role ?? "USER",
      email: decoded.email ?? "",
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

// Optional login — ถ้ามี token ก็ decode ใส่ req.user แต่ถ้าไม่มีก็ผ่านได้
// ใช้กับ search — ทุกคนค้นหาได้ แต่ถ้า login จะบันทึก history ด้วย
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as AuthPayload;

    const userId = decoded.sub;

    if (userId) {
      req.user = {
        id: userId,
        role: decoded.role ?? "USER",
        email: decoded.email ?? "",
      };
    }
  } catch {
    // token ไม่ valid — ไม่ต้องตีกลับ แค่ข้ามไป
  }

  next();
};
