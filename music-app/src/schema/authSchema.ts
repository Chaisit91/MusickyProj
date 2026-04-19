// Zod validation schema สำหรับ form auth — loginSchema, registerSchema, forgotEmailSchema, resetPasswordSchema | export types สำหรับใช้กับ react-hook-form
//
// หลักการทำงาน:
// 1. กำหนด reusable field schemas: nameField, emailField (@gmail.com only), passwordField
// 2. registerSchema: รวมทุก field + refine ตรวจ password === confirmPassword
// 3. loginSchema: email + password เท่านั้น
// 4. export type ด้วย z.infer เพื่อใช้กับ react-hook-form โดยไม่ต้องกำหนด type แยก
// 5. schema อื่น: playlistSchema, setUsernameSchema, editProfileSchema, helpSupportSchema

import { z } from "zod";

// ─── Reusable Field Schemas ───────────────────────────────────────────────────
export const nameField            = z.string().min(2, "Name must be at least 2 characters");
export const emailField           = z.email("Invalid email").refine((v) => v.endsWith("@gmail.com"), "Only @gmail.com");
export const passwordField        = z.string().min(6, "Password must be at least 6 characters");
export const confirmPasswordField = z.string().min(1, "Please confirm your password");

// ─── Register Schema ──────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name:            nameField,
  email:           emailField,
  password:        passwordField,
  confirmPassword: confirmPasswordField,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ─── Login Schema ─────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    emailField,
  password: passwordField,
});

// ─── Playlist Schema ──────────────────────────────────────────────────────────
export const playlistTitleField = z.string().min(1, "Playlist name is required").max(50, "Max 50 characters");
export const playlistSchema = z.object({
  title: playlistTitleField,
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotEmailSchema = z.object({
  email: emailField,
});
export type ForgotEmailForm = z.infer<typeof forgotEmailSchema>;

export const resetPasswordSchema = z.object({
  otp: z.string().min(6, "OTP ต้องมี 6 หลัก").max(6, "OTP ต้องมี 6 หลัก"),
  newPassword: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

// ─── Set Username ─────────────────────────────────────────────────────────────
export const setUsernameSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(50, "ชื่อยาวเกิน 50 ตัวอักษร"),
});
export type SetUsernameForm = z.infer<typeof setUsernameSchema>;

// ─── Edit Profile ─────────────────────────────────────────────────────────────
export const editProfileSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(50, "ชื่อยาวเกิน 50 ตัวอักษร"),
});
export type EditProfileForm = z.infer<typeof editProfileSchema>;

// ─── Help & Support ───────────────────────────────────────────────────────────
export const helpSupportSchema = z.object({
  description: z.string().min(10, "กรุณาอธิบายปัญหาอย่างน้อย 10 ตัวอักษร").max(1000),
  contactEmail: z.string().min(1, "กรุณากรอกอีเมล").regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "รูปแบบอีเมลไม่ถูกต้อง"),
});
export type HelpSupportForm = z.infer<typeof helpSupportSchema>;

