"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayGrowth = exports.getUserGrowth = exports.getTopSongs = exports.getRecentActivities = exports.getDashboardStats = void 0;
const prisma_1 = require("../../../lib/prisma");
const getDashboardStats = async () => {
    var _a, _b;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalUsers, totalSongs, totalPlaysAgg, totalArtists, totalPremium, monthlyRevenue] = await Promise.all([
        prisma_1.prisma.user.count({ where: { role: "USER" } }),
        prisma_1.prisma.song.count(),
        prisma_1.prisma.song.aggregate({ _sum: { playCount: true } }),
        prisma_1.prisma.artist.count(),
        prisma_1.prisma.user.count({ where: { isPremium: true, premiumExpiresAt: { gt: now } } }),
        prisma_1.prisma.paymentTransaction.aggregate({
            where: { status: "SUCCESS", createdAt: { gte: startOfMonth } },
            _sum: { amount: true },
        }),
    ]);
    const totalPlays = (_a = totalPlaysAgg._sum.playCount) !== null && _a !== void 0 ? _a : 0;
    const revenue = (_b = monthlyRevenue._sum.amount) !== null && _b !== void 0 ? _b : 0;
    const conversionRate = totalUsers > 0 ? ((totalPremium / totalUsers) * 100).toFixed(1) : "0.0";
    return { totalUsers, totalSongs, totalPlays, totalArtists, totalPremium, monthlyRevenue: revenue, conversionRate };
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
            timestamp: u.createdAt.toISOString(),
        })),
        ...recentPlaylists.map(p => ({
            type: "NEW_PLAYLIST",
            message: `${p.user.name} สร้าง playlist "${p.name}"`,
            timestamp: p.createdAt.toISOString(),
        })),
        ...recentLikedSongs.map(l => ({
            type: "LIKED_SONG",
            message: `${l.user.name} ถูกใจเพลง "${l.song.title}"`,
            timestamp: l.createdAt.toISOString(),
        })),
        ...recentDownloads.map(d => ({
            type: "DOWNLOAD",
            message: `${d.user.name} ดาวน์โหลดเพลง "${d.song.title}"`,
            timestamp: d.downloadedAt.toISOString(),
        })),
    ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    return activities;
};
exports.getRecentActivities = getRecentActivities;
const getTopSongs = async () => {
    const songs = await prisma_1.prisma.song.findMany({
        where: { playCount: { gt: 0 } },
        orderBy: { playCount: "desc" },
        take: 5,
        include: { artist: true, album: true, genre: true },
    });
    return songs;
};
exports.getTopSongs = getTopSongs;
const getUserGrowth = async () => {
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
    const results = await Promise.all(months.map(({ year, month }) => prisma_1.prisma.user.count({
        where: {
            createdAt: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
            },
        },
    })));
    return months.map(({ year, month }, i) => ({
        label: `${month < 10 ? "0" + month : month}/${String(year).slice(2)}`,
        count: results[i],
    }));
};
exports.getUserGrowth = getUserGrowth;
const getPlayGrowth = async () => {
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
    const results = await Promise.all(months.map(({ year, month }) => prisma_1.prisma.playHistory.count({
        where: {
            playedAt: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
            },
        },
    })));
    return months.map(({ year, month }, i) => ({
        label: `${month < 10 ? "0" + month : month}/${String(year).slice(2)}`,
        count: results[i],
    }));
};
exports.getPlayGrowth = getPlayGrowth;
//# sourceMappingURL=dashboardRepository.js.map