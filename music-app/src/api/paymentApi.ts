// API Premium — สมัครและต่ออายุ Premium subscription | ดึงประวัติการชำระเงิน
//
// หลักการทำงาน:
// 1. submitPaymentApi: POST /payments ด้วย multipart/form-data รองรับ slip upload (QR_CODE/BANK_TRANSFER)
// 2. getMyTransactionsApi: GET /payments/my → ประวัติการชำระเงินของ user คนนั้น
// 3. cancelPremiumApi: DELETE /payments/cancel → ยกเลิก premium, validateStatus <500 เพื่อรับ error detail กลับมาด้วย

import apiClient from "./apiClient";

export interface SubmitPaymentParams {
  method: "QR_CODE" | "BANK_TRANSFER";
  accountName?: string;
  accountNo?: string;
  slipUri?: string;
  slipMimeType?: string;
}

export interface PaymentResult {
  transactionId: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  isPremium: boolean;
  premiumExpiresAt: string;
}

export const submitPaymentApi = async (params: SubmitPaymentParams): Promise<PaymentResult> => {
  const formData = new FormData();
  formData.append("method", params.method);
  if (params.accountName) formData.append("accountName", params.accountName);
  if (params.accountNo) formData.append("accountNo", params.accountNo);
  if (params.slipUri) {
    const filename = params.slipUri.split("/").pop() ?? "slip.jpg";
    formData.append("slip", {
      uri: params.slipUri,
      name: filename,
      type: params.slipMimeType ?? "image/jpeg",
    } as any);
  }
  const { data } = await apiClient.post("/payments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return (data as { success: boolean; data: PaymentResult }).data;
};

export const getMyTransactionsApi = async () => {
  const { data } = await apiClient.get("/payments/my");
  return (data as { success: boolean; data: any[] }).data;
};

export interface CancelPremiumError {
  message: string;
  subscribedAt: string | null;
  premiumExpiresAt: string;
}

export const cancelPremiumApi = async (): Promise<{ success: true } | { success: false; data: CancelPremiumError }> => {
  const { data, status } = await apiClient.delete("/payments/cancel", {
    validateStatus: (s) => s < 500,
  });
  if (status === 200 && data?.success) return { success: true };
  return {
    success: false,
    data: {
      message: data?.message ?? "เกิดข้อผิดพลาด",
      subscribedAt: data?.subscribedAt ?? null,
      premiumExpiresAt: data?.premiumExpiresAt ?? null,
    },
  };
};
