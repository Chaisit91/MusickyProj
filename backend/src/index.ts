import express from 'express';
import authRouter from './modules/auth/authRouter';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Use the auth routes
app.use('/auth', authRouter);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});