import express from 'express';
import { register, login, refreshAccessToken } from './authService';

const router = express.Router();

// Route สำหรับการลงทะเบียน (Register)
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const token = await register(email, password, role);
    res.status(201).json({ token });
  } catch (error: any) {  // ระบุประเภทของ error ให้เป็น `any`
    res.status(400).json({ message: error.message });
  }
});

// Route สำหรับการเข้าสู่ระบบ (Login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await login(email, password);
    res.status(200).json({ token });
  } catch (error: any) {  // ระบุประเภทของ error ให้เป็น `any`
    res.status(401).json({ message: error.message });
  }
});

// Route สำหรับการรีเฟรช Access Token
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;  // ดึง refresh token จาก cookie
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const newAccessToken = await refreshAccessToken(refreshToken);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error: any) {  // ระบุประเภทของ error ให้เป็น `any`
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

export default router;