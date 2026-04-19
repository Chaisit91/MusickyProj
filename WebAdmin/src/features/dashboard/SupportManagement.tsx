// หน้าจัดการ Support tickets — แสดงรายการ ticket จาก users, ตอบกลับ, เปลี่ยน status (open/resolved)
//
// หลักการทำงาน:
// 1. GET /support → รายการ tickets ที่ user ส่งมา
// 2. admin reply: POST /support/:id/reply → ส่งข้อความตอบกลับ + trigger notification ฝั่ง user
// 3. filter ตาม status (open/closed)

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Send, RefreshCw, User, MessageSquare } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import api from "../../api/axios";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface Message { id: string; sender: "USER" | "ADMIN"; content: string; createdAt: string; }
interface Ticket {
  id: string; subject: string; status: TicketStatus;
  createdAt: string; updatedAt: string;
  user: { id: string; name: string; email: string };
  messages: Message[];
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
  OPEN:        { label: "รอดำเนินการ",    color: "#f59e0b" },
  IN_PROGRESS: { label: "กำลังดำเนินการ", color: "#3b82f6" },
  RESOLVED:    { label: "แก้ไขแล้ว",      color: "#22c55e" },
  CLOSED:      { label: "ปิด",             color: "#6b7280" },
};

const SupportManagementPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/support/admin");
      setTickets(res.data.data ?? []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  useEffect(() => {
    setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [selected?.messages?.length]);

  const selectTicket = async (ticket: Ticket) => {
    try {
      const res = await api.get(`/support/admin/${ticket.id}`);
      setSelected(res.data.data);
    } catch { setSelected(ticket); }
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    const content = reply.trim();
    setReply("");
    try {
      await api.post(`/support/admin/${selected.id}/reply`, { content });
      const res = await api.get(`/support/admin/${selected.id}`);
      const updated = res.data.data;
      setSelected(updated);
      setTickets((prev) => prev.map((t) => t.id === selected.id ? updated : t));
    } catch { setReply(content); }
    finally { setSending(false); }
  };

  const updateStatus = async (status: TicketStatus) => {
    if (!selected) return;
    try {
      await api.patch(`/support/admin/${selected.id}/status`, { status });
      const updated = { ...selected, status };
      setSelected(updated);
      setTickets((prev) => prev.map((t) => t.id === selected.id ? updated : t));
    } catch {}
  };

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    return t.user?.name?.toLowerCase().includes(q) || t.user?.email?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q);
  });

  const fmtTime = (d: string) => {
    if (!d) return "";
    if (d.includes(",")) return d.split(", ")[1]?.substring(0, 5) ?? "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };
  const getDateKey = (d: string) => {
    if (!d) return "";
    if (d.includes(",")) return d.split(", ")[0];
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toDateString();
  };
  const fmtDate = (d: string) => {
    if (!d) return "";
    if (d.includes(",")) return d.split(", ")[0];
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>

          {/* ── Left: User list ── */}
          <div className="w-80 bg-gray-800 flex flex-col border-r border-gray-700 flex-shrink-0">
            <div className="p-4 border-b border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-sm flex items-center gap-2">
                  <MessageSquare size={15} /> ข้อความ
                  <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">{filtered.length}</span>
                </span>
                <button onClick={loadTickets} className="text-gray-400 hover:text-white transition-colors p-1">
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && <div className="text-center py-8 text-gray-500 text-xs">กำลังโหลด...</div>}
              {!loading && filtered.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-xs">ไม่มีข้อความ</div>
              )}
              {filtered.map((ticket) => {
                const isSelected = selected?.id === ticket.id;
                const lastMsg = ticket.messages?.at(-1);
                const unread = lastMsg?.sender === "USER";
                return (
                  <button key={ticket.id} onClick={() => selectTicket(ticket)}
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-700/50 hover:bg-gray-700/60 transition-colors ${isSelected ? "bg-gray-700" : ""}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User size={16} className="text-violet-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-sm truncate ${unread ? "text-white font-semibold" : "text-gray-300 font-medium"}`}>
                            {ticket.user?.name}
                          </p>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{fmtDate(ticket.updatedAt)}</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mb-1 font-medium">{ticket.subject}</p>
                        {lastMsg && (
                          <p className={`text-xs truncate ${unread ? "text-gray-200" : "text-gray-500"}`}>
                            {lastMsg.sender === "ADMIN" ? "คุณ: " : ""}{lastMsg.content}
                          </p>
                        )}
                      </div>
                      {unread && !isSelected && (
                        <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: Chat ── */}
          {selected ? (
            <div className="flex-1 flex flex-col bg-gray-900 min-w-0">
              {/* Chat header */}
              <div className="px-5 py-3.5 border-b border-gray-700 flex items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-violet-600/30 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-violet-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{selected.user?.name}</p>
                    <p className="text-gray-400 text-xs truncate">{selected.subject}</p>
                  </div>
                </div>
                <select value={selected.status} onChange={(e) => updateStatus(e.target.value as TicketStatus)}
                  className="text-xs bg-gray-700 text-white border border-gray-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 flex-shrink-0">
                  {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {selected.messages?.map((msg, i) => {
                  const isAdmin = msg.sender === "ADMIN";
                  const prev = selected.messages?.[i - 1];
                  const showDate = !prev || getDateKey(msg.createdAt) !== getDateKey(prev.createdAt);
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="text-center py-3">
                          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                            {getDateKey(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isAdmin ? "justify-end" : "justify-start"} mb-1`}>
                        <div className={`max-w-md ${isAdmin ? "" : "flex gap-2 items-end"}`}>
                          {!isAdmin && (
                            <div className="w-6 h-6 rounded-full bg-violet-600/30 flex items-center justify-center flex-shrink-0 mb-1">
                              <User size={12} className="text-violet-300" />
                            </div>
                          )}
                          <div>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                              isAdmin
                                ? "bg-violet-600 text-white rounded-br-sm"
                                : "bg-gray-700 text-gray-100 rounded-bl-sm"
                            }`}>
                              {msg.content}
                            </div>
                            <p className={`text-xs text-gray-600 mt-1 ${isAdmin ? "text-right" : ""}`}>
                              {fmtTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={msgEndRef} />
              </div>

              {/* Reply input */}
              {selected.status !== "CLOSED" ? (
                <div className="p-4 border-t border-gray-700 flex-shrink-0">
                  <div className="flex gap-3 items-end">
                    <textarea
                      ref={textareaRef}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder={`ตอบกลับ ${selected.user?.name}...`}
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                      }}
                      className="flex-1 bg-gray-700 text-white text-sm rounded-2xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none border border-gray-600"
                    />
                    <button onClick={sendReply} disabled={!reply.trim() || sending}
                      className="w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0">
                      {sending ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5">Enter ส่ง · Shift+Enter ขึ้นบรรทัดใหม่</p>
                </div>
              ) : (
                <div className="p-4 border-t border-gray-700 text-center text-gray-500 text-sm">
                  Ticket นี้ปิดแล้ว
                  <button onClick={() => updateStatus("OPEN")} className="ml-2 text-violet-400 hover:text-violet-300 text-xs underline">เปิดอีกครั้ง</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <MessageSquare size={48} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">เลือก conversation เพื่อตอบกลับ</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportManagementPage;
