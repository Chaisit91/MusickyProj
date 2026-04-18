"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPremium = exports.getMyTransactions = exports.submitPayment = void 0;
const prisma_1 = require("../../lib/prisma");
const uploadImage_1 = require("../../utils/uploadImage");
const notificationRepository_1 = require("../notification/notificationRepository");
const submitPayment = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { method, accountName, accountNo } = req.body;
    // ─── ตรวจสอบว่า premium ยังไม่หมดอายุ ────────────────────────────────────
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true, premiumExpiresAt: true },
    });
    if ((existingUser === null || existingUser === void 0 ? void 0 : existingUser.isPremium) && existingUser.premiumExpiresAt && existingUser.premiumExpiresAt > new Date()) {
        res.status(409).json({
            success: false,
            message: "คุณมีแพ็กเกจ Premium ที่ใช้งานอยู่แล้ว",
            premiumExpiresAt: existingUser.premiumExpiresAt,
        });
        return;
    }
    if (!method || !["QR_CODE", "BANK_TRANSFER"].includes(method)) {
        res.status(400).json({ success: false, message: "method must be QR_CODE or BANK_TRANSFER" });
        return;
    }
    if (method === "BANK_TRANSFER") {
        if (!(accountName === null || accountName === void 0 ? void 0 : accountName.trim())) {
            res.status(400).json({ success: false, message: "accountName is required for bank transfer" });
            return;
        }
        if (!(accountNo === null || accountNo === void 0 ? void 0 : accountNo.trim())) {
            res.status(400).json({ success: false, message: "accountNo is required for bank transfer" });
            return;
        }
        if (!req.file) {
            res.status(400).json({ success: false, message: "Payment slip image is required for bank transfer" });
            return;
        }
    }
    // Upload slip ถ้ามี
    let slipUrl;
    if (req.file) {
        slipUrl = await (0, uploadImage_1.uploadImageToCloudinary)(req.file.buffer, "avatars");
    }
    // สร้าง transaction (PENDING ก่อน)
    const transaction = await prisma_1.prisma.paymentTransaction.create({
        data: {
            userId,
            method,
            amount: 149,
            status: "PENDING",
            accountName: accountName !== null && accountName !== void 0 ? accountName : null,
            accountNo: accountNo !== null && accountNo !== void 0 ? accountNo : null,
            slipUrl: slipUrl !== null && slipUrl !== void 0 ? slipUrl : null,
        },
    });
    // สร้าง notification แจ้งว่า pending
    await (0, notificationRepository_1.createNotification)({
        userId,
        type: "PAYMENT_PENDING",
        title: "รอยืนยันการชำระเงิน",
        body: "เราได้รับข้อมูลการชำระเงินของคุณแล้ว กำลังตรวจสอบ อาจใช้เวลา 5–15 นาที",
        amount: "฿149.00",
    });
    // Auto-approve (simulate) — อัปเดต transaction → SUCCESS + activate premium
    const premiumExpiresAt = new Date();
    premiumExpiresAt.setMonth(premiumExpiresAt.getMonth() + 1);
    await prisma_1.prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: "SUCCESS" },
    });
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: { isPremium: true, premiumExpiresAt },
    });
    // สร้าง notification แจ้งว่า success + premium activated
    await (0, notificationRepository_1.createNotification)({
        userId,
        type: "PAYMENT_SUCCESS",
        title: "ชำระเงินสำเร็จ",
        body: "สมัครแพ็กเกจ Premium รายเดือนเรียบร้อยแล้ว คุณสามารถใช้งานได้ทันที",
        amount: "฿149.00",
    });
    await (0, notificationRepository_1.createNotification)({
        userId,
        type: "PREMIUM_ACTIVATED",
        title: "ยินดีต้อนรับสู่ Premium!",
        body: `บัญชีของคุณได้รับการอัปเกรดเป็น Premium แล้ว ใช้งานได้ถึง ${premiumExpiresAt.toLocaleDateString("th-TH")}`,
    });
    res.json({
        success: true,
        data: {
            transactionId: transaction.id,
            status: "SUCCESS",
            isPremium: true,
            premiumExpiresAt,
        },
    });
};
exports.submitPayment = submitPayment;
const getMyTransactions = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const transactions = await prisma_1.prisma.paymentTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: transactions });
};
exports.getMyTransactions = getMyTransactions;
const cancelPremium = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true, premiumExpiresAt: true },
    });
    if (!(user === null || user === void 0 ? void 0 : user.isPremium)) {
        res.status(400).json({ success: false, message: "คุณไม่มีแพ็กเกจ Premium" });
        return;
    }
    const now = new Date();
    // ยังอยู่ในรอบบิล — แจ้งวันที่สมัครและวันครบรอบ
    if (user.premiumExpiresAt && user.premiumExpiresAt > now) {
        const lastPayment = await prisma_1.prisma.paymentTransaction.findFirst({
            where: { userId, status: "SUCCESS" },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
        });
        res.status(409).json({
            success: false,
            message: "ยังไม่ครบรอบบิล",
            subscribedAt: (lastPayment === null || lastPayment === void 0 ? void 0 : lastPayment.createdAt) ? lastPayment.createdAt.toISOString() : null,
            premiumExpiresAt: user.premiumExpiresAt ? user.premiumExpiresAt.toISOString() : null,
        });
        return;
    }
    // ครบรอบบิลแล้ว — ยกเลิกได้
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: { isPremium: false, premiumExpiresAt: null },
    });
    res.json({ success: true, message: "ยกเลิก Premium เรียบร้อยแล้ว" });
};
exports.cancelPremium = cancelPremium;
//# sourceMappingURL=paymentService.js.map