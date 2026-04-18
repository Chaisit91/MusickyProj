import { Request, Response } from "express";
import * as AuthRepository from "./authRepository";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../../utils/uploadImage";

// ── Cookie config ที่ใช้ซ้ำทุกที่ ให้ path ตรงกันเสมอ ──────────
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
  path: "/",
};

const REFRESH_COOKIE_CLEAR_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, birthDate } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: "name, email and password are required" });
    return;
  }

  const emailLower = (email as string).toLowerCase();
  if (!emailLower.endsWith("@gmail.com")) {
    res.status(400).json({ success: false, message: "Only @gmail.com email is allowed" });
    return;
  }

  const existing = await AuthRepository.findUserByEmail(emailLower);
  if (existing) {
    res.status(409).json({ success: false, message: "Email already in use" });
    return;
  }

  const hashedPassword = await hashPassword(password as string);
  const user = await AuthRepository.createUser({
    name: name as string,
    email: emailLower,
    password: hashedPassword,
    birthDate: birthDate ? new Date(birthDate as string) : undefined,
  });

  // Auto-login after register — return tokens so client doesn't need an extra round-trip
  const accessToken = generateAccessToken({ id: user.id, role: user.role, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role, email: user.email });
  await AuthRepository.saveRefreshToken(user.id, refreshToken);

  res.status(201).json({
    success: true,
    message: "Register successful",
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: null,
        isPremium: false,
        premiumExpiresAt: null,
      },
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: "email and password are required" });
    return;
  }

  const emailLower = (email as string).toLowerCase();
  if (!emailLower.endsWith("@gmail.com")) {
    res.status(400).json({ success: false, message: "Only @gmail.com email is allowed" });
    return;
  }

  const user = await AuthRepository.findUserByEmail(emailLower);
  if (!user) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ success: false, message: "Account is disabled" });
    return;
  }

  const isMatch = await comparePassword(password as string, user.password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }

  await AuthRepository.updateLastLogin(user.id);

  // ── ตรวจสอบ Premium หมดอายุตอน login ────────────────────────
  if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
    const { prisma } = await import("../../lib/prisma");
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isPremium: false, premiumExpiresAt: null },
    });
    (user as any).isPremium = updated.isPremium;
    (user as any).premiumExpiresAt = updated.premiumExpiresAt;
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role, email: user.email });

  await AuthRepository.saveRefreshToken(user.id, refreshToken);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
        isPremium: user.isPremium ?? false,
        premiumExpiresAt: user.premiumExpiresAt ?? null,
      },
    },
  });
};

// ── OTP store (in-memory, expires 5 min) ─────────────────────
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email?.trim()) {
    res.status(400).json({ success: false, message: "email is required" });
    return;
  }

  const user = await AuthRepository.findUserByEmail((email as string).toLowerCase());
  // ไม่บอกว่า email มีอยู่หรือไม่ (security)
  if (!user) {
    res.json({ success: true, message: "If the email exists, a reset code has been sent." });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(user.email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  // Production: ส่ง OTP ทาง email
  // Demo: ส่งกลับใน response ให้ user เห็น
  res.json({
    success: true,
    message: "Reset code generated",
    data: { otp }, // remove in production
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email?.trim() || !otp?.trim() || !newPassword?.trim()) {
    res.status(400).json({ success: false, message: "email, otp and newPassword are required" });
    return;
  }

  const emailLower = (email as string).toLowerCase();
  const entry = otpStore.get(emailLower);

  if (!entry || entry.otp !== otp || Date.now() > entry.expiresAt) {
    res.status(400).json({ success: false, message: "Invalid or expired reset code" });
    return;
  }

  if ((newPassword as string).length < 8) {
    res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    return;
  }

  const hashedPassword = await hashPassword(newPassword as string);
  await (await import("../../lib/prisma")).prisma.user.update({
    where: { email: emailLower },
    data: { password: hashedPassword },
  });

  otpStore.delete(emailLower);

  res.json({ success: true, message: "Password reset successfully" });
};

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: "email and password are required" });
    return;
  }

  const emailLower = (email as string).toLowerCase();
  if (!emailLower.endsWith("@gmail.com")) {
    res.status(400).json({ success: false, message: "Only @gmail.com email is allowed" });
    return;
  }

  const user = await AuthRepository.findUserByEmail(emailLower);
  if (!user) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }

  if (user.role !== "ADMIN") {
    res.status(403).json({ success: false, message: "Access denied: Admins only" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ success: false, message: "Account is disabled" });
    return;
  }

  const isMatch = await comparePassword(password as string, user.password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }

  await AuthRepository.updateLastLogin(user.id);

  const accessToken = generateAccessToken({ id: user.id, role: user.role, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role, email: user.email });

  await AuthRepository.saveRefreshToken(user.id, refreshToken);

  //  refreshToken → HttpOnly Cookie (JS อ่านไม่ได้)
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  //  ส่งแค่ accessToken + user ใน body (ไม่ส่ง refreshToken)
  res.json({
    success: true,
    data: {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
};

export const refresh = async (req: Request, res: Response) => {
  // WebAdmin ส่งผ่าน Cookie, mobile app ส่งผ่าน body
  const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;

  if (!refreshToken) {
    res.status(400).json({ success: false, message: "refreshToken is required" });
    return;
  }

  const tokenRecord = await AuthRepository.findRefreshToken(refreshToken as string);
  if (!tokenRecord) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
    return;
  }

  if (tokenRecord.expiresAt < new Date()) {
    await AuthRepository.deleteRefreshToken(refreshToken as string);
    //  clear cookie ถ้า token หมดอายุ
    res.clearCookie("refreshToken", REFRESH_COOKIE_CLEAR_OPTIONS);
    res.status(401).json({ success: false, message: "Refresh token expired, please login again" });
    return;
  }

  if (!tokenRecord.user.isActive) {
    res.status(403).json({ success: false, message: "Account is disabled" });
    return;
  }

  //  Refresh Token Rotation — ลบเก่า ออกใหม่
  await AuthRepository.deleteRefreshToken(refreshToken as string);

  const newAccessToken = generateAccessToken({
    id: tokenRecord.user.id,
    role: tokenRecord.user.role,
    email: tokenRecord.user.email,
  });
  const newRefreshToken = generateRefreshToken({
    id: tokenRecord.user.id,
    role: tokenRecord.user.role,
    email: tokenRecord.user.email,
  });

  await AuthRepository.saveRefreshToken(tokenRecord.user.id, newRefreshToken);

  res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: tokenRecord.user.id,
        name: tokenRecord.user.name,
        email: tokenRecord.user.email,
        role: tokenRecord.user.role,
      },
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  //  อ่าน refreshToken จาก Cookie
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    //  ลบ token นี้ออกจาก DB
    await AuthRepository.deleteRefreshToken(refreshToken as string);
  } else {
    // ไม่มี cookie  ลบทั้งหมดของ user นี้
    await AuthRepository.deleteAllRefreshTokensByUser(userId);
  }

  //  clear cookie ออกจาก browser ทันที → refreshToken หายไปเลย
  res.clearCookie("refreshToken", REFRESH_COOKIE_CLEAR_OPTIONS);

  res.json({ success: true, message: "Logged out successfully" });
};

export const logoutAll = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  //  ลบ refreshToken ทุกอันของ user นี้ออกจาก DB
  await AuthRepository.deleteAllRefreshTokensByUser(userId);

  //  clear cookie บน browser ที่กำลังใช้งานอยู่
  res.clearCookie("refreshToken", REFRESH_COOKIE_CLEAR_OPTIONS);

  res.json({ success: true, message: "Logged out from all devices" });
};

type GoogleUserShape = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
};

export const googleLogin = async (req: Request, res: Response) => {
  const { accessToken, name } = req.body;

  if (!accessToken) {
    res.status(400).json({ success: false, message: "accessToken is required" });
    return;
  }

  // ── ดึงข้อมูล user จาก Google API ──────────────────────────────
  let googleProfile: { sub: string; email: string; name: string; picture?: string };
  try {
    const resp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!resp.ok) {
      res.status(401).json({ success: false, message: "Invalid Google access token" });
      return;
    }
    googleProfile = (await resp.json()) as typeof googleProfile;
  } catch {
    res.status(500).json({ success: false, message: "Failed to verify Google token" });
    return;
  }

  const { sub: googleId, email, name: googleName, picture } = googleProfile;

  let user: GoogleUserShape | null = null;

  // ── ค้นหา user ด้วย googleId ────────────────────────────────────
  const byGoogleId = await AuthRepository.findUserByGoogleId(googleId);
  if (byGoogleId) {
    user = { id: byGoogleId.id, name: byGoogleId.name, email: byGoogleId.email, role: byGoogleId.role, avatarUrl: byGoogleId.avatarUrl ?? null };
  }

  // ── ค้นหา user ด้วย email (กรณีสมัครด้วย email/password มาก่อน) ──
  if (!user) {
    const emailUser = await AuthRepository.findUserByEmail(email);
    if (emailUser) {
      const linked = await AuthRepository.linkGoogleId(emailUser.id, googleId, picture);
      user = { id: linked.id, name: linked.name, email: linked.email, role: linked.role, avatarUrl: linked.avatarUrl ?? null };
    }
  }

  // ── ถ้ายังไม่มี user → ต้องตั้งชื่อก่อน ─────────────────────────
  if (!user) {
    if (!name || !(name as string).trim()) {
      res.json({
        success: true,
        requiresName: true,
        googleData: {
          googleId,
          email,
          suggestedName: googleName,
          avatarUrl: picture ?? null,
          accessToken,
        },
      });
      return;
    }

    const created = await AuthRepository.createGoogleUser({
      name: (name as string).trim(),
      email,
      googleId,
      avatarUrl: picture,
    });
    user = { id: created.id, name: created.name, email: created.email, role: created.role, avatarUrl: created.avatarUrl ?? null };
  }

  // ── ออก tokens ──────────────────────────────────────────────────
  await AuthRepository.updateLastLogin(user.id);
  const newAccessToken = generateAccessToken({ id: user.id, role: user.role, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role, email: user.email });
  await AuthRepository.saveRefreshToken(user.id, refreshToken);

  res.json({
    success: true,
    requiresName: false,
    data: {
      accessToken: newAccessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    },
  });
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name } = req.body;

  const current = await AuthRepository.findUserById(userId);
  if (!current) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  let avatarUrl: string | undefined;
  if (req.file) {
    // ลบรูปเก่าออกก่อน (ถ้ามี)
    if (current.avatarUrl) {
      await deleteImageFromCloudinary(current.avatarUrl);
    }
    avatarUrl = await uploadImageToCloudinary(req.file.buffer, "avatars");
  }

  const updated = await AuthRepository.updateUserProfile(userId, {
    ...(name ? { name: name as string } : {}),
    ...(avatarUrl ? { avatarUrl } : {}),
  });

  res.json({ success: true, data: updated });
};

export const getMe = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  let user = await AuthRepository.findUserById(userId);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  // ── ตรวจสอบ Premium หมดอายุ ──────────────────────────────────
  if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
    const { prisma } = await import("../../lib/prisma");
    user = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: false, premiumExpiresAt: null },
    });

    // แจ้งเตือนว่า premium หมดอายุ
    const { createNotification } = await import("../notification/notificationRepository");
    await createNotification({
      userId,
      type: "PREMIUM_EXPIRING",
      title: "แพ็กเกจ Premium หมดอายุแล้ว",
      body: "แพ็กเกจ Premium ของคุณหมดอายุแล้ว สมัครใหม่เพื่อใช้งานต่อได้เลย",
    });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl ?? null,
      isPremium: user.isPremium ?? false,
      premiumExpiresAt: user.premiumExpiresAt ?? null,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
};