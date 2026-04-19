import { Request, Response } from "express";
import * as UserRepository from "./userRepository";
import { prisma } from "../../lib/prisma";

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

export const getMyPreferences = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  let pref = await prisma.userPreference.findUnique({ where: { userId } });
  if (!pref) {
    pref = await prisma.userPreference.create({
      data: { userId },
    });
  }
  res.json({ success: true, data: pref });
};

export const updateMyPreferences = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { autoPlay, showLyrics } = req.body;
  const pref = await prisma.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      ...(autoPlay !== undefined && { autoPlay }),
      ...(showLyrics !== undefined && { showLyrics }),
    },
    update: {
      ...(autoPlay !== undefined && { autoPlay }),
      ...(showLyrics !== undefined && { showLyrics }),
    },
  });
  res.json({ success: true, data: pref });
};
