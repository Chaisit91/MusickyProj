import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './modules/auth/authRouter';  // ใช้ Router ของ Auth

dotenv.config();  // โหลด environment variables

const app = express();  // สร้าง instance ของ Express

// Middleware
app.use(cookieParser());  // ใช้ cookie-parser สำหรับจัดการ cookies
app.use(express.json());  // ให้ Express อ่าน JSON request body

// ตั้งค่า route สำหรับ Auth
app.use('/auth', authRouter);  // กำหนด route สำหรับ Login/Registration

// สร้าง route ทั่วไป
app.get('/', (req, res) => {
  res.send('Welcome to Musicky API!');
});

// ตั้งค่า Server ให้รับฟังที่ port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});