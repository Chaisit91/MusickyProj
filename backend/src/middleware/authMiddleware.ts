import jwt from 'jsonwebtoken';

// authMiddleware สำหรับตรวจสอบการยืนยันตัวตน (JWT)
export const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];  // รับ Token จาก Header

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
    req.user = decoded;  // ส่งข้อมูลผู้ใช้ไปยัง request เพื่อใช้ใน middleware ถัดไป
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};