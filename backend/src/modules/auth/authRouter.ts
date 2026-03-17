import express from 'express';
import { register, login } from './authService';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;  // Expect role to be 'USER' or 'ADMIN'
  try {
    const token = await register(email, password, role);
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await login(email, password);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

export default router;