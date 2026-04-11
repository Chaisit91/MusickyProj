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
import userRouter from "./modules/user/userRouter";
import adsRouter from "./modules/ads/adsRouter";
import uploadRouter from "./modules/upload/uploadRouter"; // ✅ upload API
import playHistoryRouter from "./modules/playHistory/playHistoryRouter";
import artistFollowRouter from "./modules/artistFollow/artistFollowRouter";
import notificationRouter from "./modules/notification/notificationRouter";
import paymentRouter from "./modules/payment/paymentRouter";

// Admin Routers
import dashboardRouter from "./modules/admin/dashboard/dashboardRouter";
import adminUserRouter from "./modules/admin/users/adminUserRouter";
import adminSongRouter from "./modules/admin/songs/adminSongRouter";
import adminGenreRouter from "./modules/admin/genres/adminGenreRouter";
import adminAdsRouter from "./modules/admin/ads/adminAdsRouter";

// Middleware
import { errorMiddleware } from "./middleware/errorMiddleware";
import { thaiTimeMiddleware } from "./middleware/thaiTimeMiddleware";

const app = express();
const port = process.env.PORT || 8080;

// ── Global Middleware ──────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
}));
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
app.use("/api/users", userRouter);
app.use("/api/ads", adsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/play-history", playHistoryRouter);
app.use("/api/artist-follows", artistFollowRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/payments", paymentRouter);

// ── Admin Routes ──────────────────────────────────────────────
app.use("/api/admin/dashboard", dashboardRouter);
app.use("/api/admin/users", adminUserRouter);
app.use("/api/admin/songs", adminSongRouter);
app.use("/api/admin/genres", adminGenreRouter);
app.use("/api/admin/ads", adminAdsRouter);

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