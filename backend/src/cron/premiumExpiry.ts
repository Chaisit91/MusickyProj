import cron from "node-cron";
import { prisma } from "../lib/prisma";

// รันทุกวัน เที่ยงคืน (00:00)
cron.schedule("0 0 * * *", async () => {
  console.log("[Cron] Checking premium expiry...");
  try {
    const now = new Date();

    // หา user ที่ premium หมดอายุ
    const expired = await prisma.user.findMany({
      where: {
        isPremium: true,
        premiumExpiresAt: { lte: now },
      },
      select: { id: true, name: true, premiumExpiresAt: true },
    });

    if (expired.length === 0) {
      console.log("[Cron] No expired premium users.");
      return;
    }

    // อัปเดตเป็น free
    await prisma.user.updateMany({
      where: { id: { in: expired.map((u) => u.id) } },
      data: { isPremium: false, premiumExpiresAt: null },
    });

    // สร้าง notification สำหรับแต่ละ user
    await prisma.notification.createMany({
      data: expired.map((u) => ({
        userId: u.id,
        type: "PREMIUM_EXPIRING" as const,
        title: "สมาชิก Premium หมดอายุแล้ว",
        body: "สมาชิก Premium ของคุณหมดอายุแล้ว สมัครใหม่เพื่อรับสิทธิ์พรีเมียมต่อ",
        isRead: false,
      })),
    });

    console.log(`[Cron] Expired ${expired.length} premium user(s).`);
  } catch (err) {
    console.error("[Cron] premiumExpiry error:", err);
  }
});

console.log("[Cron] premiumExpiry job registered.");
