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

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
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