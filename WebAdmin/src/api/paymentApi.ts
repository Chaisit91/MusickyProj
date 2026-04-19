// API รายการชำระเงิน (Admin) — getPayments, ดูประวัติ subscription ของ users

import api from "./axios";

export interface PaymentTransaction {
  id: string;
  userId: string;
  method: "QR_CODE" | "BANK_TRANSFER";
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  slipUrl: string | null;
  accountName: string | null;
  accountNo: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface TransactionListResponse {
  success: boolean;
  data: PaymentTransaction[];
  pagination: { total: number; page: number; limit: number };
}

export const getAllTransactions = (params?: { status?: string; page?: number; limit?: number }) =>
  api.get<TransactionListResponse>("/admin/payments", { params }).then((r) => r.data);

export const approveTransaction = (id: string) =>
  api.patch(`/admin/payments/${id}/approve`).then((r) => r.data);

export const rejectTransaction = (id: string, reason?: string) =>
  api.patch(`/admin/payments/${id}/reject`, { reason }).then((r) => r.data);

export const broadcastNotification = (title: string, body: string, userIds?: string[]) =>
  api.post("/admin/notifications/broadcast", { title, body, userIds }).then((r) => r.data);
