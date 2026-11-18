"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopSongs = exports.getRecentActivities = exports.getDashboardStats = void 0;
const prisma_1 = require("../../../lib/prisma");
const getDashboardStats = async () => {
    var _a;
    const [totalUsers, totalSongs, totalPlaysAgg, totalArtists] = await Promise.all([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.song.count(),
        prisma_1.prisma.song.aggregate({ _sum: { playCount: true } }),
        prisma_1.prisma.artist.count(),
    ]);
    return {
        totalUsers,
        totalSongs,
        totalPlays: (_a = totalPlaysAgg._sum.playCount) !== null && _a !== void 0 ? _a : 0,
        totalArtists,
    };
};
exports.getDashboardStats = getDashboardStats;
const getRecentActivities = async () => {
    const [recentUsers, recentPlaylists, recentLikedSongs, recentDownloads] = await Promise.all([
        prisma_1.prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, name: true, createdAt: true },
        }),
        prisma_1.prisma.playlist.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { user: { select: { name: true } } },
        }),
        prisma_1.prisma.likedSong.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                user: { select: { name: true } },
                song: { select: { title: true } },
            },
        }),
        prisma_1.prisma.download.findMany({
            orderBy: { downloadedAt: "desc" },
            take: 5,
            include: {
                user: { select: { name: true } },
                song: { select: { title: true } },
            },
        }),
    ]);
    const activities = [
        ...recentUsers.map(u => ({
            type: "NEW_USER",
            message: `${u.name} สมัครสมาชิก`,
            createdAt: u.createdAt,
        })),
        ...recentPlaylists.map(p => ({
            type: "NEW_PLAYLIST",
            message: `${p.user.name} สร้าง playlist "${p.name}"`,
            createdAt: p.createdAt,
        })),
        ...recentLikedSongs.map(l => ({
            type: "LIKED_SONG",
            message: `${l.user.name} ถูกใจเพลง "${l.song.title}"`,
            createdAt: l.createdAt,
        })),
        ...recentDownloads.map(d => ({
            type: "DOWNLOAD",
            message: `${d.user.name} ดาวน์โหลดเพลง "${d.song.title}"`,
            createdAt: d.downloadedAt,
        })),
    ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
    return activities;
};
exports.getRecentActivities = getRecentActivities;
const getTopSongs = async () => {
    return prisma_1.prisma.song.findMany({
        orderBy: { playCount: "desc" },
        take: 5,
        include: { artist: true, album: true, genre: true },
    });
};
exports.getTopSongs = getTopSongs;
//# sourceMappingURL=dashboardRepository.js.map