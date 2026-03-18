import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/password";

// ฟังก์ชันหาผู้ใช้จากอีเมล์
export const findByEmail = async (email: string) => {
  const emailLower = email.toLowerCase(); // แปลงอีเมลให้เป็นตัวพิมพ์เล็ก
  return prisma.user.findUnique({
    where: { email: emailLower }, // ค้นหาผู้ใช้ตามอีเมลที่แปลงแล้ว
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
  const email = data.email.toLowerCase(); // แปลงอีเมลเป็นตัวพิมพ์เล็ก
  const hashedPassword = await hashPassword(data.password); // เข้ารหัสรหัสผ่านก่อนบันทึก

  return prisma.user.create({
    data: {
      name: data.name,           // ฟิลด์ name
      email: email,              // ฟิลด์ email (แปลงเป็นตัวพิมพ์เล็ก)
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
  const isValid = await comparePassword(password, storedPassword); // ใช้ comparePassword เปรียบเทียบรหัสผ่าน
  if (!isValid) {
    throw new Error("Invalid credentials");  // ถ้ารหัสผ่านไม่ถูกต้องจะโยนข้อผิดพลาด
  }
  return true;
};

// ฟังก์ชันอัปเดตสถานะ isActive ของผู้ใช้เป็น false
export const deactivateUser = async (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
};