import * as repo from "./authRepository";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

// validation function
function validateRegister(data: any) {
  if (!data.email || typeof data.email !== "string") {
    throw new Error("Email must be string");
  }
  if (!data.email.includes("@")) {
    throw new Error("Invalid email format");
  }
  if (!data.name || typeof data.name !== "string") {
    throw new Error("Name required");
  }
  if (!data.password || data.password.length < 6) {
    throw new Error("Password must be at least 6 chars");
  }
}

function validateLogin(data: any) {
  if (!data.email || typeof data.email !== "string") {
    throw new Error("Email required");
  }
  if (!data.password) {
    throw new Error("Password required");
  }
}

// REGISTER
export const register = async (data: any) => {
  validateRegister(data);

  const exist = await repo.findByEmail(data.email);

  if (exist) {
    throw new Error("Email already exists");
  }

  const user = await repo.createUser(data);

  return {
    id: user.id,
    email: user.email,
  };
};

// LOGIN
export const login = async (data: any) => {
  validateLogin(data);

  const user = await repo.findByEmail(data.email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("User inactive");
  }

  // เปรียบเทียบรหัสผ่าน
  await repo.compareUserPassword(data.password, user.password);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // อัปเดต `lastLogin`
  await repo.updateLastLogin(user.id);

  return { accessToken, refreshToken };
};

// REFRESH TOKEN
export const refreshToken = async (req: any) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new Error("No refresh token");
  }

  const decoded: any = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);

  const user = await repo.findById(decoded.sub);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("User inactive");
  }

  return {
    accessToken: generateAccessToken(user),
  };
};

// LOGOUT (เฉพาะ user.id)
export const logout = async (userIdFromUrl: string, token: string) => {
  const decoded: any = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
  const loggedInUserId = decoded.sub;

  if (userIdFromUrl !== loggedInUserId) {
    throw new Error("You can only log out your own account");
  }

  return { message: `Logged out successfully for user ID: ${userIdFromUrl}` };
};