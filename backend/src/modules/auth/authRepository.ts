import { User } from './authModel';
import { Role } from '@prisma/client';  // นำเข้า Role enum จาก Prisma

export const findUserByEmail = async (email: string) => {
  const user = await User.findUnique({
    where: {
      email: email,
    },
  });
  return user;
};

export const createUser = async (email: string, password: string, role: Role) => {
  const user = await User.create({
    data: {
      email,
      password,
      role,  // ใช้ Role enum แทน string
    },
  });
  return user;
};