export interface UserUpdateInput {
  name?: string;
  isActive?: boolean;
  role?: "USER" | "ADMIN";
}