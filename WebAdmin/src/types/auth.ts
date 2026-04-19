// TypeScript types สำหรับ auth — AdminUser, LoginRequest, LoginResponse, TokenPayload
//
// หลักการทำงาน:
// 1. export interface AdminUser: id, name, email, role
// 2. export interface LoginResponse: accessToken, user
// 3. ใช้โดย auth.store.ts และ useAuth hook

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}