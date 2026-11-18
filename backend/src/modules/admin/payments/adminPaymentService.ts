import { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { createNotification } from "../../notification/notificationRepository";

// GET /api/admin/payments — ดูรายการ transaction ทั้งหมด
export const getAllTransactions = async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const page = req.query.page as string ?? "1";
  const limit = req.query.limit as string ?? "20";
  const skip = (Number(page) - 1) * Number(limit);

  const where = status ? { status: status as any } : {};

  const [transactions, total] = await Promise.all([
    prisma.paymentTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.paymentTransaction.count({ where }),
  ]);

  res.json({
    success: true,
    data: transactions,
    pagination: { total, page: Number(page), limit: Number(limit) },
  });
};

// PATCH /api/admin/payments/:id/approve — อนุมัติ
export const approveTransaction = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const tx = await prisma.paymentTransaction.findUnique({
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

  await prisma.paymentTransaction.update({
    where: { id },
    data: { status: "SUCCESS" },
  });

  await prisma.user.update({
    where: { id: tx.userId },
    data: { isPremium: true, premiumExpiresAt },
  });

  await createNotification({
    userId: tx.userId,
    type: "PAYMENT_SUCCESS",
    title: "ชำระเงินสำเร็จ",
    body: "ผู้ดูแลระบบยืนยันการชำระเงินของคุณแล้ว บัญชีได้รับการอัปเกรดเป็น Premium",
    amount: `฿${tx.amount.toFixed(2)}`,
  });

  await createNotification({
    userId: tx.userId,
    type: "PREMIUM_ACTIVATED",
    title: "ยินดีต้อนรับสู่ Premium!",
    body: `สิทธิ์ Premium ของคุณใช้งานได้ถึง ${premiumExpiresAt.toLocaleDateString("th-TH")}`,
  });

  res.json({ success: true, message: "Approved" });
};

// PATCH /api/admin/payments/:id/reject — ปฏิเสธ
export const rejectTransaction = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { reason } = req.body;

  const tx = await prisma.paymentTransaction.findUnique({ where: { id } });

  if (!tx) {
    res.status(404).json({ success: false, message: "Transaction not found" });
    return;
  }

  if (tx.status !== "PENDING") {
    res.status(400).json({ success: false, message: "Transaction is not pending" });
    return;
  }

  await prisma.paymentTransaction.update({
    where: { id },
    data: { status: "FAILED" },
  });

  await createNotification({
    userId: tx.userId,
    type: "PAYMENT_FAILED",
    title: "การชำระเงินไม่สำเร็จ",
    body: reason?.trim() || "การชำระเงินถูกปฏิเสธ กรุณาติดต่อเราหากคุณคิดว่านี่คือข้อผิดพลาด",
    amount: `฿${tx.amount.toFixed(2)}`,
  });

  res.json({ success: true, message: "Rejected" });
};

// POST /api/admin/notifications/broadcast — ส่งแจ้งเตือนให้ user ทุกคน
export const broadcastNotification = async (req: Request, res: Response) => {
  const { title, body, type = "PAYMENT_PENDING" } = req.body;

  if (!title?.trim() || !body?.trim()) {
    res.status(400).json({ success: false, message: "title and body are required" });
    return;
  }

  const users = await prisma.user.findMany({ select: { id: true } });

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: type as any,
      title: title.trim(),
      body: body.trim(),
      isRead: false,
    })),
  });

  res.json({ success: true, message: `Broadcast sent to ${users.length} users.` });
};
