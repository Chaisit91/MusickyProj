import jwt from "jsonwebtoken";

interface TokenUser {
  id: string;
  role: string;
  email: string;
}

// sub = userId, เพิ่ม role และ email ไว้ใน payload
// roleMiddleware จะอ่าน role จาก token โดยตรง ไม่ต้อง query DB
export const generateAccessToken = (user: TokenUser): string => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "1h" }
  );
};

export const generateRefreshToken = (user: TokenUser): string => {
  return jwt.sign(
    { sub: user.id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "7d" }
  );
};