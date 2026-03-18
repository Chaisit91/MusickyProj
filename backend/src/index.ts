import express from 'express';
import { prisma } from './lib/prisma';  // การเชื่อมต่อกับ Prisma
import cors from 'cors';  // ใช้ CORS middleware
import cookieParser from 'cookie-parser';  // ใช้ cookie-parser สำหรับจัดการคุกกี้
import authRouter from './modules/auth/authRouter';  // นำเข้า authRouter
import { authMiddleware } from './middleware/authMiddleware';  // นำเข้า authMiddleware
import { roleMiddleware } from './middleware/roleMiddleware';  // นำเข้า roleMiddleware
import { errorMiddleware } from './middleware/errorMiddleware';  // นำเข้า errorMiddleware

const app = express();
const port = process.env.PORT || 8080;

// ใช้ middleware สำหรับ CORS
app.use(cors());

// ใช้ express.json() เพื่อให้สามารถรับข้อมูลในรูปแบบ JSON ได้
app.use(express.json());

// ใช้ cookie-parser สำหรับจัดการคุกกี้
app.use(cookieParser());

// Route สำหรับการลงทะเบียนและล็อกอิน
app.use('/api/auth', authRouter);  // ใช้ authRouter สำหรับการทำงานเกี่ยวกับการเข้าสู่ระบบและการลงทะเบียน

// ตัวอย่าง Route ที่ต้องใช้การตรวจสอบ Token ด้วย authMiddleware
app.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Protected route accessed!' });
});

// ตัวอย่าง Route ที่ต้องใช้การตรวจสอบ Role ด้วย roleMiddleware
app.get('/admin', authMiddleware, roleMiddleware('ADMIN'), (req, res) => {
  res.status(200).json({ message: 'Welcome Admin!' });
});

// ใช้ errorMiddleware ที่จัดการข้อผิดพลาดทั้งหมดในระบบ
app.use(errorMiddleware);  // ใช้ errorMiddleware ที่เราสร้างไว้

// เริ่มต้นการเชื่อมต่อและทำงานของเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});