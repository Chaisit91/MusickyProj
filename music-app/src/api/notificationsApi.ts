import apiClient from "./apiClient";

export interface AppNotification {
  id: string;
  userId: string;
  type: "PAYMENT_SUCCESS" | "PAYMENT_PENDING" | "PAYMENT_FAILED" | "PREMIUM_ACTIVATED" | "PREMIUM_EXPIRING";
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
