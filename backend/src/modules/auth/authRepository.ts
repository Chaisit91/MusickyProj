import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/password";

// ฟังก์ชันหาผู้ใช้จากอีเมล์
export const findByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

// ฟังก์ชันหาผู้ใช้จาก ID
export const findById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

// ฟังก์ชันสร้างผู้ใช้ใหม่
export const createUser = async (data: any) => {
  const hashedPassword = await hashPassword(data.password); // เข้ารหัสรหัสผ่านก่อนบันทึก
  return prisma.user.create({
    data: {
      name: data.name,           // ฟิลด์ name
      email: data.email,         // ฟิลด์ email
      password: hashedPassword,  // ฟิลด์ password
      role: data.role || "USER", // ฟิลด์ role
      isActive: true,            // ฟิลด์ isActive ตั้งค่าเป็น true โดยค่าเริ่มต้น
    },
  });
};

// ฟังก์ชันอัปเดตการเข้าสู่ระบบครั้งล่าสุด (อัปเดต `lastLogin`)
export const updateLastLogin = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: {
      lastLogin: new Date(),  // อัปเดต `lastLogin` เป็นวันที่และเวลาปัจจุบัน
    },
  });
};

// ฟังก์ชันเปรียบเทียบรหัสผ่าน
export const compareUserPassword = async (password: string, storedPassword: string) => {
  const isValid = await comparePassword(password, storedPassword);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }
  return true;
};