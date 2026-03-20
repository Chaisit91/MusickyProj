import { Request, Response } from "express";
import * as UserRepository from "./userRepository";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await UserRepository.findAllUsers();
  res.json({ success: true, data: users });
};

export const getUserById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await UserRepository.findUserById(id);
  if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
  res.json({ success: true, data: user });
};

export const banUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await UserRepository.banUser(id);
  res.json({ success: true, message: "User banned" });
};

export const unbanUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await UserRepository.unbanUser(id);
  res.json({ success: true, message: "User unbanned" });
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await UserRepository.deleteUser(id);
  res.json({ success: true, message: "User deleted" });
};
