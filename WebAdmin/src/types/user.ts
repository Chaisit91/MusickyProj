// TypeScript types สำหรับ User — id, name, email, role, isPremium, avatarUrl, createdAt, bannedAt
//
// หลักการทำงาน:
// 1. export interface User: id, name, email, role, isPremium, premiumExpiresAt, isBanned
// 2. ใช้โดย useUsers hook และ Usermanagement component

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  isPremium?: boolean;
  premiumExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  _count?: {
    playlists: number;
    likedSongs: number;
    downloads: number;
  };
}

export interface UserUpdateInput {
  name?: string;
  isActive?: boolean;
  role?: "USER" | "ADMIN";
}