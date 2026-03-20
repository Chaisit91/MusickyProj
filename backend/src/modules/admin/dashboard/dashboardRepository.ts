import { prisma } from "../../../lib/prisma";

export const getDashboardStats = async () => {
  const [totalUsers, totalSongs, totalPlaysAgg, totalArtists] = await Promise.all([
    prisma.user.count(),
    prisma.song.count(),
    prisma.song.aggregate({ _sum: { playCount: true } }),
    prisma.artist.count(),
  ]);
  return {
    totalUsers,
    totalSongs,
    totalPlays: totalPlaysAgg._sum.playCount ?? 0,
    totalArtists,
  };
};

export const getRecentActivities = async () => {
  const [recentUsers, recentPlaylists, recentLikedSongs, recentDownloads] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.playlist.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true } } },
    }),
    prisma.likedSong.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        song: { select: { title: true } },
      },
    }),
    prisma.download.findMany({
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

export const getTopSongs = async () => {
  return prisma.song.findMany({
    orderBy: { playCount: "desc" },
    take: 5,
    include: { artist: true, album: true, genre: true },
  });
};
