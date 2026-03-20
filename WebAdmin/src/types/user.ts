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

export interface UserUpdateInput {
  name?: string;
  isActive?: boolean;
  role?: "USER" | "ADMIN";
}