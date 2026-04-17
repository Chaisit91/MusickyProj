"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastNotification = exports.rejectTransaction = exports.approveTransaction = exports.getAllTransactions = void 0;
const prisma_1 = require("../../../lib/prisma");
const notificationRepository_1 = require("../../notification/notificationRepository");
// GET /api/admin/payments — ดูรายการ transaction ทั้งหมด
const getAllTransactions = async (req, res) => {
    var _a, _b;
    const status = req.query.status;
    const page = (_a = req.query.page) !== null && _a !== void 0 ? _a : "1";
    const limit = (_b = req.query.limit) !== null && _b !== void 0 ? _b : "20";
    const skip = (Number(page) - 1) * Number(limit);
    const where = status ? { status: status } : {};
    const [transactions, total] = await Promise.all([
        prisma_1.prisma.paymentTransaction.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: Number(limit),
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        }),
        prisma_1.prisma.paymentTransaction.count({ where }),
    ]);
    res.json({
        success: true,
        data: transactions,
        pagination: { total, page: Number(page), limit: Number(limit) },
    });
};
exports.getAllTransactions = getAllTransactions;
// PATCH /api/admin/payments/:id/approve — อนุมัติ
const approveTransaction = async (req, res) => {
    const id = req.params.id;
    const tx = await prisma_1.prisma.paymentTransaction.findUnique({
        where: { id },
        include: { user: true },
    });
    if (!tx) {
        res.status(404).json({ success: false, message: "Transaction not found" });
        return;
    }
    if (tx.status !== "PENDING") {
        res.status(400).json({ success: false, message: "Transaction is not pending" });
        return;
    }
    const premiumExpiresAt = new Date();
    premiumExpiresAt.setMonth(premiumExpiresAt.getMonth() + 1);
    await prisma_1.prisma.paymentTransaction.update({
        where: { id },
        data: { status: "SUCCESS" },
    });
    await prisma_1.prisma.user.update({
        where: { id: tx.userId },
        data: { isPremium: true, premiumExpiresAt },
    });
    await (0, notificationRepository_1.createNotification)({
        userId: tx.userId,
        type: "PAYMENT_SUCCESS",
        title: "ชำระเงินสำเร็จ",
        body: "ผู้ดูแลระบบยืนยันการชำระเงินของคุณแล้ว บัญชีได้รับการอัปเกรดเป็น Premium",
        amount: `฿${tx.amount.toFixed(2)}`,
    });
    await (0, notificationRepository_1.createNotification)({
        userId: tx.userId,
        type: "PREMIUM_ACTIVATED",
        title: "ยินดีต้อนรับสู่ Premium!",
        body: `สิทธิ์ Premium ของคุณใช้งานได้ถึง ${premiumExpiresAt.toLocaleDateString("th-TH")}`,
    });
    res.json({ success: true, message: "Approved" });
};
exports.approveTransaction = approveTransaction;
// PATCH /api/admin/payments/:id/reject — ปฏิเสธ
const rejectTransaction = async (req, res) => {
    const id = req.params.id;
    const { reason } = req.body;
    const tx = await prisma_1.prisma.paymentTransaction.findUnique({ where: { id } });
    if (!tx) {
        res.status(404).json({ success: false, message: "Transaction not found" });
        return;
    }
    if (tx.status !== "PENDING") {
        res.status(400).json({ success: false, message: "Transaction is not pending" });
        return;
    }
    await prisma_1.prisma.paymentTransaction.update({
        where: { id },
        data: { status: "FAILED" },
    });
    await (0, notificationRepository_1.createNotification)({
        userId: tx.userId,
        type: "PAYMENT_FAILED",
        title: "การชำระเงินไม่สำเร็จ",
        body: (reason === null || reason === void 0 ? void 0 : reason.trim()) || "การชำระเงินถูกปฏิเสธ กรุณาติดต่อเราหากคุณคิดว่านี่คือข้อผิดพลาด",
        amount: `฿${tx.amount.toFixed(2)}`,
    });
    res.json({ success: true, message: "Rejected" });
};
exports.rejectTransaction = rejectTransaction;
// POST /api/admin/notifications/broadcast — ส่งแจ้งเตือน (ทั้งหมด หรือเฉพาะ userIds)
const broadcastNotification = async (req, res) => {
    const { title, body, type = "PAYMENT_PENDING", userIds } = req.body;
    if (!(title === null || title === void 0 ? void 0 : title.trim()) || !(body === null || body === void 0 ? void 0 : body.trim())) {
        res.status(400).json({ success: false, message: "title and body are required" });
        return;
    }
    const where = Array.isArray(userIds) && userIds.length > 0
        ? { id: { in: userIds } }
        : {};
    const users = await prisma_1.prisma.user.findMany({ where, select: { id: true } });
    await prisma_1.prisma.notification.createMany({
        data: users.map((u) => ({
            userId: u.id,
            type: type,
            title: title.trim(),
            body: body.trim(),
            isRead: false,
        })),
    });
    res.json({ success: true, message: `ส่งแจ้งเตือนสำเร็จ ${users.length} คน` });
};
exports.broadcastNotification = broadcastNotification;
//# sourceMappingURL=adminPaymentService.js.map