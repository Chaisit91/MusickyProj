import express from 'express';
import { prisma } from './lib/prisma';
import cors from "cors"
import authRouter from "./modules/auth/authRouter"
const app = express();
const port = process.env.PORT || 8080;

import cookieParser from "cookie-parser"


app.use(cors());
app.use(express.json());
app.use(cookieParser())

// test git
app.use("/api/auth", authRouter)

app.listen(port, () => {
    console.log(`Server is running on http:localhost:${port}`);
});