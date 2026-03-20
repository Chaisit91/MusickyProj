import { Request, Response } from "express";
import * as AdminUserRepository from "./adminUserRepository";

export const getAllUsers = async (req: Request, res: Response) => {
  const { search, status } = req.query;
  const users = await AdminUserRepository.findAllUsers(
    search as string,
    status as string
  );
  res.json({ success: true, data: users });
};

export const getUserById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await AdminUserRepository.findUserById(id);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  res.json({ success: true, data: user });
};

export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminUserRepository.findUserById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  const { name, email, isActive } = req.body;
  const user = await AdminUserRepository.updateUser(id, { name, email, isActive });
  res.json({ success: true, data: user });
};

export const banUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminUserRepository.findUserById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  await AdminUserRepository.banUser(id);
  res.json({ success: true, message: "User banned" });
};

export const unbanUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminUserRepository.findUserById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  await AdminUserRepository.unbanUser(id);
  res.json({ success: true, message: "User unbanned" });
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminUserRepository.findUserById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  await AdminUserRepository.deleteUser(id);
  res.json({ success: true, message: "User deleted" });
};
