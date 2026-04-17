import { useEffect, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, XCircle, Eye, RefreshCw, Send, Filter, Search, Users, Globe } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import * as PaymentApi from "../../api/paymentApi";
import type { PaymentTransaction } from "../../api/paymentApi";
import { getAllUsersApi } from "../../api/userApi";
import { rejectSchema, broadcastSchema, type RejectFormValues, type BroadcastFormValues } from "../../schema/adminSchema";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING: { label: "รอยืนยัน", className: "bg-yellow-500/20 text-yellow-400" },
  SUCCESS: { label: "สำเร็จ", className: "bg-green-500/20 text-green-400" },
  FAILED: { label: "ปฏิเสธ", className: "bg-red-500/20 text-red-400" },
};

const METHOD_LABEL: Record<string, string> = {
  QR_CODE: "QR Code",
  BANK_TRANSFER: "โอนเงิน",
};

export default function PaymentManagementPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [slipModal, setSlipModal] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastMode, setBroadcastMode] = useState<"all" | "selected">("all");
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const rejectForm = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: "" },
  });
  const broadcastForm = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { title: "", body: "" },
  });

  const bTitle = useWatch({ control: broadcastForm.control, name: "title" });
  const bBody = useWatch({ control: broadcastForm.control, name: "body" });

  const limit = 20;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await PaymentApi.getAllTransactions({
        status: statusFilter || undefined,
        page,
        limit,
      });
      setTransactions(res.data);
      setTotal(res.pagination.total);
    } catch {
      showToast("โหลดข้อมูลไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await PaymentApi.approveTransaction(id);
      showToast("อนุมัติสำเร็จ");
      loadData();
    } catch {
      showToast("อนุมัติไม่สำเร็จ", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (data: RejectFormValues) => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      await PaymentApi.rejectTransaction(rejectModal.id, data.reason || "");
      showToast("ปฏิเสธสำเร็จ");
      setRejectModal(null);
      rejectForm.reset();
      loadData();
    } catch {
      showToast("ปฏิเสธไม่สำเร็จ", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openBroadcastModal = useCallback(async () => {
    setBroadcastModal(true);
    setBroadcastMode("all");
    setSelectedUserIds(new Set());
    setUserSearch("");
    if (allUsers.length === 0) {
      try {
        const res = await getAllUsersApi();
        setAllUsers(res.data.data ?? []);
      } catch { }
    }
  }, [allUsers.length]);

  const closeBroadcastModal = () => {
    setBroadcastModal(false);
    broadcastForm.reset();
    setSelectedUserIds(new Set());
    setUserSearch("");
  };

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBroadcast = async (data: BroadcastFormValues) => {
    if (broadcastMode === "selected" && selectedUserIds.size === 0) {
      showToast("กรุณาเลือกผู้ใช้อย่างน้อย 1 คน", "error");
      return;
    }
    setActionLoading(true);
    try {
      const userIds = broadcastMode === "selected" ? Array.from(selectedUserIds) : undefined;
      const res = await PaymentApi.broadcastNotification(data.title, data.body, userIds);
      showToast(res.message || "ส่งแจ้งเตือนสำเร็จ");
      closeBroadcastModal();
    } catch {
      showToast("ส่งแจ้งเตือนไม่สำเร็จ", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-8 bg-gray-500 flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">จัดการการชำระเงิน</h1>
              <p className="text-gray-400 text-sm mt-1">รายการธุรกรรมทั้งหมด ({total} รายการ)</p>
            </div>
            <button
              onClick={openBroadcastModal}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Send size={14} /> ส่งแจ้งเตือน Broadcast
            </button>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3">
            <Filter size={14} className="text-gray-400" />
            {["", "SUCCESS"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {s === "" ? "ทั้งหมด" : STATUS_LABEL[s]?.label}
              </button>
            ))}
            <button onClick={loadData} className="ml-auto text-gray-400 hover:text-white transition-colors">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Table */}
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs">
                  <th className="text-left px-4 py-3">ผู้ใช้</th>
                  <th className="text-left px-4 py-3">วิธีชำระ</th>
                  <th className="text-left px-4 py-3">จำนวน</th>
                  <th className="text-left px-4 py-3">สถานะ</th>
                  <th className="text-left px-4 py-3">วันที่</th>
                  <th className="text-left px-4 py-3">สลิป</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">กำลังโหลด...</td>
                  </tr>
                )}
                {!loading && transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">ไม่มีรายการ</td>
                  </tr>
                )}
                {transactions.map((tx) => {
                  const status = STATUS_LABEL[tx.status];
                  return (
                    <tr key={tx.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{tx.user.name}</p>
                        <p className="text-gray-500 text-xs">{tx.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{METHOD_LABEL[tx.method] ?? tx.method}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">฿{tx.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status?.className}`}>
                          {status?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {tx.createdAt ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {tx.slipUrl ? (
                          <button
                            onClick={() => setSlipModal(tx.slipUrl!)}
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors"
                          >
                            <Eye size={12} /> ดูสลิป
                          </button>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {tx.status === "PENDING" && (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleApprove(tx.id)}
                              disabled={actionLoading}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              <CheckCircle size={12} /> อนุมัติ
                            </button>
                            <button
                              onClick={() => setRejectModal({ id: tx.id })}
                              disabled={actionLoading}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              <XCircle size={12} /> ปฏิเสธ
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-40 hover:text-white text-sm"
              >
                ก่อนหน้า
              </button>
              <span className="text-gray-400 text-sm">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-40 hover:text-white text-sm"
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slip Modal */}
      {slipModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSlipModal(null)}>
          <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img src={slipModal} alt="slip" className="w-full rounded-xl object-contain max-h-[80vh]" />
            <button onClick={() => setSlipModal(null)} className="mt-4 w-full py-2 bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white">
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-4">ยืนยันการปฏิเสธ</h3>
            <form onSubmit={rejectForm.handleSubmit(handleReject)}>
              <textarea
                {...rejectForm.register("reason")}
                placeholder="เหตุผล (ไม่บังคับ)"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none outline-none border border-gray-600 focus:border-red-500"
                rows={3}
              />
              <div className="flex gap-3 mt-4">
                <button type="button"
                  onClick={() => { setRejectModal(null); rejectForm.reset(); }}
                  className="flex-1 py-2 bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button type="submit" disabled={actionLoading}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm text-white font-medium disabled:opacity-60"
                >
                  ยืนยันปฏิเสธ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {broadcastModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
              <h3 className="text-base font-semibold text-white">ส่งแจ้งเตือน</h3>
              {/* Mode Toggle */}
              <div className="flex bg-gray-700 rounded-lg p-1 gap-1">
                <button type="button"
                  onClick={() => setBroadcastMode("all")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${broadcastMode === "all" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
                  <Globe size={12} /> ทั้งหมด
                </button>
                <button type="button"
                  onClick={() => setBroadcastMode("selected")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${broadcastMode === "selected" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
                  <Users size={12} /> เลือกผู้ใช้
                </button>
              </div>
            </div>

            <form onSubmit={broadcastForm.handleSubmit(handleBroadcast)} className="flex flex-col flex-1 overflow-hidden">
              {/* Message inputs */}
              <div className="px-6 py-4 space-y-3 flex-shrink-0">
                <div>
                  <input
                    {...broadcastForm.register("title")}
                    placeholder="หัวข้อแจ้งเตือน"
                    className={`w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none border ${broadcastForm.formState.errors.title ? "border-red-500" : "border-gray-600 focus:border-purple-500"}`}
                  />
                  {broadcastForm.formState.errors.title && <p className="text-red-400 text-xs mt-1">⚠ {broadcastForm.formState.errors.title.message}</p>}
                </div>
                <div>
                  <textarea
                    {...broadcastForm.register("body")}
                    placeholder="เนื้อหาแจ้งเตือน"
                    className={`w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none outline-none border ${broadcastForm.formState.errors.body ? "border-red-500" : "border-gray-600 focus:border-purple-500"}`}
                    rows={3}
                  />
                  {broadcastForm.formState.errors.body && <p className="text-red-400 text-xs mt-1">⚠ {broadcastForm.formState.errors.body.message}</p>}
                </div>
              </div>

              {/* User selection */}
              {broadcastMode === "selected" && (
                <div className="px-6 pb-3 flex flex-col flex-1 overflow-hidden border-t border-gray-700">
                  <div className="py-3 flex-shrink-0">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อหรืออีเมล..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-lg pl-8 pr-3 py-2 text-sm outline-none border border-gray-600 focus:border-purple-500"
                      />
                    </div>
                    {selectedUserIds.size > 0 && (
                      <p className="text-purple-400 text-xs mt-2">เลือกแล้ว {selectedUserIds.size} คน</p>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1 space-y-1 min-h-0">
                    {allUsers
                      .filter((u) =>
                        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase())
                      )
                      .map((u) => (
                        <label key={u.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${selectedUserIds.has(u.id) ? "bg-purple-600/20 border border-purple-500/40" : "hover:bg-gray-700"}`}>
                          <input
                            type="checkbox"
                            checked={selectedUserIds.has(u.id)}
                            onChange={() => toggleUser(u.id)}
                            className="accent-purple-500 w-4 h-4 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{u.name}</p>
                            <p className="text-gray-400 text-xs truncate">{u.email}</p>
                          </div>
                        </label>
                      ))}
                    {allUsers.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">กำลังโหลด...</p>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-700 flex gap-3 flex-shrink-0">
                <button type="button" onClick={closeBroadcastModal}
                  className="flex-1 py-2 bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
                  ยกเลิก
                </button>
                <button type="submit"
                  disabled={actionLoading || !bTitle?.trim() || !bBody?.trim() || (broadcastMode === "selected" && selectedUserIds.size === 0)}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                  <Send size={13} />
                  {broadcastMode === "selected" ? `ส่ง ${selectedUserIds.size} คน` : "ส่งทุกคน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl z-50 ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
