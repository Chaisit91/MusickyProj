import { z } from "zod";

// ── Shared fields ──────────────────────────────────────────────
const nameField = z.string().min(1, "กรุณากรอกชื่อ").max(100, "ชื่อยาวเกิน 100 ตัวอักษร");
// Zod v4: z.url() เป็น standalone, ใช้ union แทน .or()
const urlField = z.union([z.url({ error: "URL ไม่ถูกต้อง" }), z.literal("")]).optional();

// ── Auth ───────────────────────────────────────────────────────
export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอก Email")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "รูปแบบ Email ไม่ถูกต้อง")
    .regex(/@gmail\.com$/i, "Email ต้องเป็น @gmail.com เท่านั้น"),
  password: z.string().min(6, "Password ต้องมีอย่างน้อย 6 ตัวอักษร"),
});
export type AdminLoginForm = z.infer<typeof adminLoginSchema>;

// ── Artist ─────────────────────────────────────────────────────
export const artistSchema = z.object({
  name: nameField,
  bio: z.string().max(500, "ประวัติยาวเกิน 500 ตัวอักษร").optional(),
  imageUrl: urlField,
});
export type ArtistFormValues = z.infer<typeof artistSchema>;

// ── Album ──────────────────────────────────────────────────────
export const albumSchema = z.object({
  title: nameField,
  artistId: z.string().min(1, "กรุณาเลือกศิลปิน"),
  releaseDate: z.string().min(1, "กรุณาเลือกวันที่วางจำหน่าย"),
  coverUrl: urlField,
});
export type AlbumFormValues = z.infer<typeof albumSchema>;

// ── Genre ──────────────────────────────────────────────────────
export const genreSchema = z.object({
  name: nameField,
  description: z.string().max(300, "คำอธิบายยาวเกิน 300 ตัวอักษร").optional(),
  color: z.string().optional(),
  imageUrl: urlField,
});
export type GenreFormValues = z.infer<typeof genreSchema>;

// ── Song ───────────────────────────────────────────────────────
export const songSchema = z.object({
  title: nameField,
  artistId: z.string().min(1, "กรุณาเลือกศิลปิน"),
  albumId: z.string().min(1, "กรุณาเลือกอัลบั้ม"),
  genreId: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  duration: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  lyrics: z.string().optional(),
  filePath: z.string().optional(),
});
export type SongFormValues = z.infer<typeof songSchema>;

// ── User Edit ─────────────────────────────────────────────────
export const userEditSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
  isActive: z.enum(["active", "banned"]),
});
export type UserEditFormValues = z.infer<typeof userEditSchema>;

// ── Ad ────────────────────────────────────────────────────────
export const adSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อโฆษณา").max(100),
  advertiser: z.string().min(1, "กรุณากรอกชื่อผู้โฆษณา").max(100),
  adType: z.enum(["SPLASH", "AFTER_SONG"]),
  adDuration: z.number().int().min(1, "ระยะเวลาต้องมากกว่า 0"),
  linkUrl: z.union([z.url({ error: "URL ไม่ถูกต้อง" }), z.literal("")]).optional(),
  isActive: z.boolean(),
  priority: z.number().int().min(1).max(10),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type AdFormValues = z.infer<typeof adSchema>;

// ── Payment Reject ────────────────────────────────────────────
export const rejectSchema = z.object({
  reason: z.string().max(300, "เหตุผลยาวเกิน 300 ตัวอักษร").optional(),
});
export type RejectFormValues = z.infer<typeof rejectSchema>;

// ── Broadcast Notification ────────────────────────────────────
export const broadcastSchema = z.object({
  title: z.string().min(1, "กรุณากรอกหัวข้อ").max(100),
  body: z.string().min(1, "กรุณากรอกเนื้อหา").max(500),
});
export type BroadcastFormValues = z.infer<typeof broadcastSchema>;
