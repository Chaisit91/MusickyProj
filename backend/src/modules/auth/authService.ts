import * as repo from "./authRepository"; // นำเข้า repo สำหรับติดต่อฐานข้อมูล
import { hashPassword, comparePassword } from "../../utils/password"; // ฟังก์ชันสำหรับแฮชรหัสผ่านและเปรียบเทียบรหัสผ่าน
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt"; // ฟังก์ชันสำหรับสร้าง JWT
import jwt from 'jsonwebtoken'; // นำเข้า jsonwebtoken สำหรับการยืนยัน JWT

// Register service
export const registerService = async (data: any, repo: any) => {
  // แปลงอีเมลให้เป็นตัวพิมพ์เล็กก่อนตรวจสอบ
  const email = data.email.toLowerCase();  // แปลงอีเมลให้เป็นตัวพิมพ์เล็ก

  // ตรวจสอบว่าอีเมลเป็น Gmail หรือไม่
  if (!email.includes('@gmail.com')) {
    throw new Error("Email must be a Gmail account");
  }

  // ตรวจสอบว่าอีเมลนี้มีอยู่ในฐานข้อมูลหรือไม่
  const exist = await repo.findByEmail(email);

  if (exist) {
    throw new Error("Email already exists");
  }

  // แฮชรหัสผ่าน
  const hashed = await hashPassword(data.password);

  // บันทึกผู้ใช้ใหม่ในฐานข้อมูล
  return repo.createUser({
    name: data.name,
    email: email,  // เก็บอีเมลที่แปลงเป็นตัวพิมพ์เล็ก
    password: hashed,
    role: "USER",  // กำหนด role เป็น "USER" โดยค่าเริ่มต้น
  });
};

// Login service
export const loginService = async (data: any, repo: any) => {
  // ตรวจสอบอีเมลในฐานข้อมูล
  const user = await repo.findByEmail(data.email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // เปรียบเทียบรหัสผ่านที่ป้อนกับรหัสผ่านที่เก็บไว้
  const valid = await comparePassword(data.password, user.password);

  if (!valid) throw new Error("Invalid credentials");

  // สร้าง access token และ refresh token
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // อัปเดต `lastLogin` หลังจากผู้ใช้เข้าสู่ระบบสำเร็จ
  await repo.updateLastLogin(user.id);

  return { accessToken, refreshToken };
};

// LOGOUT (อัปเดต isActive เป็น false)
export const logout = async (userIdFromUrl: string, token: string) => {
  const decoded: any = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
  const loggedInUserId = decoded.sub;

  // ตรวจสอบว่าผู้ใช้ที่พยายามล็อกเอาท์คือผู้ใช้ที่ล็อกอินอยู่หรือไม่
  if (userIdFromUrl !== loggedInUserId) {
    throw new Error("You can only log out your own account");
  }

  // อัปเดตสถานะ isActive ของผู้ใช้เป็น false
  await repo.deactivateUser(loggedInUserId);

  return { message: `Logged out successfully for user ID: ${userIdFromUrl}` };
};