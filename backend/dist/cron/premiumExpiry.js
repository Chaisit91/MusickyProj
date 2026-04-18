"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../lib/prisma");
// รันทุกวัน เที่ยงคืน (00:00)
node_cron_1.default.schedule("0 0 * * *", async () => {
    console.log("[Cron] Checking premium expiry...");
    try {
        const now = new Date();
        // หา user ที่ premium หมดอายุ
        const expired = await prisma_1.prisma.user.findMany({
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
        await prisma_1.prisma.user.updateMany({
            where: { id: { in: expired.map((u) => u.id) } },
            data: { isPremium: false, premiumExpiresAt: null },
        });
        // สร้าง notification สำหรับแต่ละ user
        await prisma_1.prisma.notification.createMany({
            data: expired.map((u) => ({
                userId: u.id,
                type: "PREMIUM_EXPIRING",
                title: "สมาชิก Premium หมดอายุแล้ว",
                body: "สมาชิก Premium ของคุณหมดอายุแล้ว สมัครใหม่เพื่อรับสิทธิ์พรีเมียมต่อ",
                isRead: false,
            })),
        });
        console.log(`[Cron] Expired ${expired.length} premium user(s).`);
    }
    catch (err) {
        console.error("[Cron] premiumExpiry error:", err);
    }
});
console.log("[Cron] premiumExpiry job registered.");
//# sourceMappingURL=premiumExpiry.js.map