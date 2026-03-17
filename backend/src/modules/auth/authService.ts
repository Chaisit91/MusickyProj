import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findUserByEmail, createUser } from './authRepository';
import { Role } from '@prisma/client';  // นำเข้า Role enum จาก Prisma

dotenv.config();

// ฟังก์ชันสำหรับการลงทะเบียน (Register)
export const register = async (email: string, password: string, role: Role) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // เข้ารหัสรหัสผ่านก่อนบันทึก
  const hashedPassword = await bcrypt.hash(password, 10);

  // สร้าง User ใหม่
  const user = await createUser(email, hashedPassword, role);

  // สร้าง JWT Token (หมดอายุใน 365 วัน)
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '365d' }  // Access Token expires in 365 days
  );

  return token;
};

// ฟังก์ชันสำหรับการเข้าสู่ระบบ (Login)
export const login = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '365d' }  // Access Token expires in 365 days
  );

  return token;
};

// ฟังก์ชันรีเฟรช Access Token
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'default_secret');

    // ตรวจสอบว่า decoded เป็น JwtPayload หรือไม่
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      const user = await findUserByEmail(decoded.userId);  // ดึงข้อมูล user จาก decoded.userId
      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '365d' }  // Access Token expires in 365 days
      );

      return newAccessToken;
    } else {
      throw new Error('Invalid or expired refresh token');
    }
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};