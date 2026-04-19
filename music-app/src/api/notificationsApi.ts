// API การแจ้งเตือน — ดึงรายการ, mark all read, ลบ notification
//
// หลักการทำงาน:
// 1. getNotificationsApi: GET /notifications → รายการ notification ทั้งหมดของ user
// 2. markReadApi: PATCH /notifications/:id/read → mark notification เดียวว่าอ่านแล้ว
// 3. markAllReadApi: PATCH /notifications/read-all → mark ทั้งหมดว่าอ่านแล้วในครั้งเดียว

import apiClient from "./apiClient";

export interface AppNotification {
  id: string;
  userId: string;
  type: "PAYMENT_SUCCESS" | "PAYMENT_PENDING" | "PAYMENT_FAILED" | "PREMIUM_ACTIVATED" | "PREMIUM_EXPIRING" | "SUPPORT_REPLY";
  title: string;
  body: string;
  amount?: string | null;
  isRead: boolean;
  createdAt: string;
}

export const getNotificationsApi = async (): Promise<AppNotification[]> => {
  const { data } = await apiClient.get("/notifications");
  return (data as { success: boolean; data: AppNotification[] }).data;
};

export const markReadApi = async (id: string): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`);
};

export const markAllReadApi = async (): Promise<void> => {
  await apiClient.patch("/notifications/read-all");
};
