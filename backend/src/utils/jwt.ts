import jwt from "jsonwebtoken";

// สร้าง accessToken
export const generateAccessToken = (user: any) => {
  return jwt.sign(
    { sub: user.id }, 
    process.env.ACCESS_TOKEN_SECRET as string,  // ใช้คีย์จาก .env
    { expiresIn: "1h" }
  );
};

// สร้าง refreshToken
export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { sub: user.id }, 
    process.env.REFRESH_TOKEN_SECRET as string,  // ใช้คีย์จาก .env
    { expiresIn: "7d" }
  );
};