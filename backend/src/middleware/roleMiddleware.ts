import { prisma } from '../lib/prisma';  // ใช้ Prisma client สำหรับการเชื่อมต่อฐานข้อมูล

// roleMiddleware สำหรับตรวจสอบ role ของผู้ใช้
export const roleMiddleware = (requiredRole: string) => {
  return async (req: any, res: any, next: any) => {
    // ตรวจสอบว่า authMiddleware ได้ตั้งค่า req.user.id หรือไม่
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    // ดึงข้อมูลผู้ใช้จาก ID ที่เก็บใน request (หลังจากผ่าน authMiddleware)
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,  // ใช้ id จาก request ที่ผ่านการตรวจสอบ JWT
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });  // ถ้าไม่พบผู้ใช้ ส่งกลับ 401
    }

    // ตรวจสอบว่า user มี role ตรงกับที่กำหนดหรือไม่
    if (user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden: You are not an admin" });  // ถ้าไม่ตรงส่งกลับ 403
    }

    next();  // ถ้า user มี role ที่ถูกต้อง ให้ไปยัง middleware ถัดไป
  };
};