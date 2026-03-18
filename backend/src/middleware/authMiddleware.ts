import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthPayload extends JwtPayload {
  id?: string | number;
  userId?: string | number;
  role?: string;
  email?: string;
}

export const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  // ตรวจสอบว่า Authorization header ถูกส่งมาหรือไม่
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ตรวจสอบและ decode token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as AuthPayload;

    // เลือก 'id' หรือ 'userId' หรือ 'sub' ถ้ามีใน decoded payload
    const userId = decoded.id || decoded.userId || decoded.sub;

    // ถ้าไม่พบ 'userId' หรือ 'id' ใน decoded payload
    if (!userId) {
      console.error("Decoded token does not contain userId or id:", decoded);
      return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
    }

    // เพิ่มข้อมูล user ลงใน req.user
    req.user = {
      id: userId,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    // แสดงข้อผิดพลาดในกรณีที่ token ไม่ถูกต้อง
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};