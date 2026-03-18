import { prisma } from '../lib/prisma';

export const roleMiddleware = (requiredRole: string) => {
  return async (req: any, res: any, next: any) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,  // ไม่ต้องแปลงเป็น number ถ้า id เป็น string หรือ UUID
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: No user" });
    }

    if (user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden: You are not an admin" });
    }

    next();
  };
};