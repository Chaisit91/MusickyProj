import { User } from './authModel';

export const findUserByEmail = async (email: string) => {
  const user = await User.findUnique({
    where: {
      email: email,
    },
  });
  return user;
};

export const createUser = async (email: string, password: string, role: string) => {
  const user = await User.create({
    data: {
      email,
      password,
      role,
    },
  });
  return user;
};