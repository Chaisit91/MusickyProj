"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Routers
const authRouter_1 = __importDefault(require("./modules/auth/authRouter"));
const artistRouter_1 = __importDefault(require("./modules/artist/artistRouter"));
const genreRouter_1 = __importDefault(require("./modules/genre/genreRouter"));
const albumRouter_1 = __importDefault(require("./modules/album/albumRouter"));
const songRouter_1 = __importDefault(require("./modules/song/songRouter"));
const likedSongRouter_1 = __importDefault(require("./modules/likedSong/likedSongRouter"));
const playlistRouter_1 = __importDefault(require("./modules/playlist/playlistRouter"));
const downloadRouter_1 = __importDefault(require("./modules/download/downloadRouter"));
const queueRouter_1 = __importDefault(require("./modules/queue/queueRouter"));
const searchRouter_1 = __importDefault(require("./modules/search/searchRouter"));
const userRouter_1 = __importDefault(require("./modules/user/userRouter"));
const adsRouter_1 = __importDefault(require("./modules/ads/adsRouter"));
// Admin Routers
const dashboardRouter_1 = __importDefault(require("./modules/admin/dashboard/dashboardRouter"));
const adminUserRouter_1 = __importDefault(require("./modules/admin/users/adminUserRouter"));
const adminSongRouter_1 = __importDefault(require("./modules/admin/songs/adminSongRouter"));
const adminGenreRouter_1 = __importDefault(require("./modules/admin/genres/adminGenreRouter"));
const adminAdsRouter_1 = __importDefault(require("./modules/admin/ads/adminAdsRouter"));
// Middleware
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const thaiTimeMiddleware_1 = require("./middleware/thaiTimeMiddleware");
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// ── Global Middleware ──────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(thaiTimeMiddleware_1.thaiTimeMiddleware);
// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRouter_1.default);
app.use("/api/artists", artistRouter_1.default);
app.use("/api/genres", genreRouter_1.default);
app.use("/api/albums", albumRouter_1.default);
app.use("/api/songs", songRouter_1.default);
app.use("/api/liked-songs", likedSongRouter_1.default);
app.use("/api/playlists", playlistRouter_1.default);
app.use("/api/downloads", downloadRouter_1.default);
app.use("/api/queue", queueRouter_1.default);
app.use("/api/search", searchRouter_1.default);
app.use("/api/users", userRouter_1.default);
app.use("/api/ads", adsRouter_1.default);
// ── Admin Routes ──────────────────────────────────────────────
app.use("/api/admin/dashboard", dashboardRouter_1.default);
app.use("/api/admin/users", adminUserRouter_1.default);
app.use("/api/admin/songs", adminSongRouter_1.default);
app.use("/api/admin/genres", adminGenreRouter_1.default);
app.use("/api/admin/ads", adminAdsRouter_1.default);
// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});
// ── Global Error Handler ──────────────────────────────────────
app.use(errorMiddleware_1.errorMiddleware);
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
exports.default = app;
//# sourceMappingURL=index.js.map