import bcrypt from 'bcryptjs';  // นำเข้า bcryptjs
import jwt from 'jsonwebtoken';  // นำเข้า jsonwebtoken
import { findUserByEmail, createUser } from './authRepository';
import { Role } from '@prisma/client';  // นำเข้า Role enum จาก Prisma

export const register = async (email: string, password: string, role: Role) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the new user
  const user = await createUser(email, hashedPassword, role);

  // Create a JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'default_secret',  // Set JWT Secret
    { expiresIn: '1h' }
  );

  return token;
};

export const login = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'default_secret',  // Set JWT Secret
    { expiresIn: '1h' }
  );

  return token;
};