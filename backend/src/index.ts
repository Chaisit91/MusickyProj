import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

// Routers
import authRouter from "./modules/auth/authRouter";
import artistRouter from "./modules/artist/artistRouter";
import genreRouter from "./modules/genre/genreRouter";
import albumRouter from "./modules/album/albumRouter";
import songRouter from "./modules/song/songRouter";
import likedSongRouter from "./modules/likedSong/likedSongRouter";
import playlistRouter from "./modules/playlist/playlistRouter";
import downloadRouter from "./modules/download/downloadRouter";
import queueRouter from "./modules/queue/queueRouter";
import searchRouter from "./modules/search/searchRouter";
import { thaiTimeMiddleware } from "./middleware/thaiTimeMiddleware";

// Middleware
import { errorMiddleware } from "./middleware/errorMiddleware";

const app = express();
const port = process.env.PORT || 8080;

// ── Global Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(thaiTimeMiddleware); 

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/artists", artistRouter);
app.use("/api/genres", genreRouter);
app.use("/api/albums", albumRouter);
app.use("/api/songs", songRouter);
app.use("/api/liked-songs", likedSongRouter);
app.use("/api/playlists", playlistRouter);
app.use("/api/downloads", downloadRouter);
app.use("/api/queue", queueRouter);
app.use("/api/search", searchRouter);

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorMiddleware);

// ── Start Server ──────────────────────────────────────────────
const server = app.listen(port, () => {
  console.log(`🎵 Musicky API running on http://localhost:${port}`);
});

// ── Process Error Handlers ────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
  server.close(() => process.exit(1));
});

export default app;
