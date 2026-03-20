import React, { useState, useRef } from "react";
import { Search, Plus, Pencil, Trash2, X, Target, Users, MousePointerClick, LayoutList, Upload, Video, Play } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdStatus = "ใช้งาน" | "หยุดชั่วคราว" | "สิ้นสุดแล้ว" | "รอดำเนินการ";
type AdType = "โฆษณา" | "แบนเนอร์" | "วิดีโอ" | "สปอนเซอร์";
type AdPlatform = "ทั้งหมด" | "เดสก์ท็อป" | "มือถือ" | "แอป";

interface Ad {
  id: number;
  title: string;
  advertiser: string;
  type: AdType;
  platform: AdPlatform | string;
  duration: number;
  budget: number;
  startDate: string;
  endDate: string;
  status: AdStatus;
  impressions: number;
  clicks: number;
  ctr: number;
  videoUrl?: string;
  videoName?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_ADS: Ad[] = [
  {
    id: 1,
    title: "โปรโมชั่นดนตรีไทย X",
    advertiser: "TechCorp",
    type: "โฆษณา",
    platform: "เดสก์ท็อป",
    duration: 15,
    budget: 50000,
    startDate: "1 พ.ย. 2025",
    endDate: "31 ธ.ค. 2025",
    status: "ใช้งาน",
    impressions: 125000,
    clicks: 8005,
    ctr: 6.4,
  },
  {
    id: 2,
    title: "แคมเปญดนตรีปีใหม่ 2026",
    advertiser: "Fashion Brand",
    type: "แบนเนอร์",
    platform: "มือถือ",
    duration: 30,
    budget: 75000,
    startDate: "1 ธ.ค. 2025",
    endDate: "5 ก.พ. 2026",
    status: "ใช้งาน",
    impressions: 89000,
    clicks: 5032,
    ctr: 5.65,
  },
  {
    id: 3,
    title: "โปรโมชั่นพรีเมียมซัมเมอร์",
    advertiser: "LifeStyle Co.",
    type: "วิดีโอ",
    platform: "แอป",
    duration: 20,
    budget: 30000,
    startDate: "15 พ.ย. 2025",
    endDate: "25 ก.ย. 2026",
    status: "ใช้งาน",
    impressions: 87000,
    clicks: 4352,
    ctr: 5.0,
  },
  {
    id: 4,
    title: "อัปเกรดแพ็กเกจพรีเมียม",
    advertiser: "Music App Media",
    type: "สปอนเซอร์",
    platform: "เดสก์ท็อป",
    duration: 10,
    budget: 120000,
    startDate: "1 ม.ค. 2026",
    endDate: "31 ม.ค. 2026",
    status: "ใช้งาน",
    impressions: 210000,
    clicks: 18500,
    ctr: 8.81,
  },
  {
    id: 5,
    title: "แคมเปญสปอนเซอร์ศิลปินใหม่",
    advertiser: "SoundWave Records",
    type: "โฆษณา",
    platform: "มือถือ",
    duration: 25,
    budget: 45000,
    startDate: "5 ม.ค. 2026",
    endDate: "15 ก.พ. 2026",
    status: "หยุดชั่วคราว",
    impressions: 45000,
    clicks: 2100,
    ctr: 4.67,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<AdStatus, string> = {
  ใช้งาน: "bg-green-500/15 text-green-400 border border-green-500/30",
  หยุดชั่วคราว: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  สิ้นสุดแล้ว: "bg-gray-500/15 text-gray-400 border border-gray-500/30",
  รอดำเนินการ: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
};

const emptyAd = (): Omit<Ad, "id"> => ({
  title: "",
  advertiser: "",
  type: "โฆษณา",
  platform: "เดสก์ท็อป",
  duration: 15,
  budget: 0,
  startDate: "",
  endDate: "",
  status: "รอดำเนินการ",
  impressions: 0,
  clicks: 0,
  ctr: 0,
});

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-gray-800 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-0">
    <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-300">
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-xl font-bold mt-0.5">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: AdStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_MAP[status]}`}>
    {status}
  </span>
);

// ─── Ad Modal ─────────────────────────────────────────────────────────────────

interface AdModalProps {
  mode: "add" | "edit";
  ad: Partial<Ad> & { id?: number };
  onClose: () => void;
  onSave: (ad: Partial<Ad> & { id?: number }) => void;
}

const AdModal: React.FC<AdModalProps> = ({ mode, ad, onClose, onSave }) => {
  const [form, setForm] = useState({ ...ad });
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith("video/")) return;
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, videoUrl: url, videoName: file.name, duration: prev.duration }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleVideoFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleVideoFile(file);
  };

  const removeVideo = () => {
    setForm((prev) => ({ ...prev, videoUrl: undefined, videoName: undefined }));
  };

  const handleSave = () => {
    if (!form.title || !form.advertiser) return;
    onSave(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";
  const labelCls = "text-xs font-medium text-gray-500 mb-1.5 block";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <p className="font-semibold text-gray-900 text-sm">
            {mode === "add" ? "เพิ่มโฆษณาใหม่" : "แก้ไขโฆษณา"}
          </p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {/* ── วิดีโอโฆษณา ── */}
          <div>
            <label className={labelCls}>วิดีโอโฆษณา</label>

            {form.videoUrl ? (
              /* Video preview */
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                  src={form.videoUrl}
                  controls
                  className="w-full max-h-44 object-contain"
                />
                <button
                  onClick={removeVideo}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X size={12} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-xs truncate">{form.videoName}</p>
                </div>
              </div>
            ) : (
              /* Drop zone */
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 py-7 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Video size={18} className="text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">
                    <span className="text-blue-500">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">MP4, MOV, AVI, WebM (สูงสุด 500MB)</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Upload size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">รองรับทุกรูปแบบวิดีโอ</span>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* ชื่อโฆษณา + ผู้ลงโฆษณา */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ชื่อโฆษณา *</label>
              <input type="text" placeholder="เช่น แคมเปญปีใหม่ 2026" value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ผู้ลงโฆษณา *</label>
              <input type="text" placeholder="ชื่อบริษัท" value={form.advertiser || ""}
                onChange={(e) => setForm({ ...form, advertiser: e.target.value })} className={inputCls} />
            </div>
          </div>

          {/* ประเภทโฆษณา + ความยาว */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ประเภทโฆษณา</label>
              <select value={form.type || "โฆษณา"} onChange={(e) => setForm({ ...form, type: e.target.value as AdType })}
                className={inputCls}>
                {(["โฆษณา", "แบนเนอร์", "วิดีโอ", "สปอนเซอร์"] as AdType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>ความยาว (วินาที)</label>
              <input type="number" min={0} value={form.duration ?? 15}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>

          {/* แพลตฟอร์ม + สถานะ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>แพลตฟอร์ม</label>
              <select value={form.platform || "เดสก์ท็อป"} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className={inputCls}>
                {["เดสก์ท็อป", "มือถือ", "แอป"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>สถานะ</label>
              <select value={form.status || "รอดำเนินการ"} onChange={(e) => setForm({ ...form, status: e.target.value as AdStatus })}
                className={inputCls}>
                {(["ใช้งาน", "หยุดชั่วคราว", "สิ้นสุดแล้ว", "รอดำเนินการ"] as AdStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* งบประมาณ */}
          <div>
            <label className={labelCls}>งบประมาณ (บาท)</label>
            <input type="number" min={0} placeholder="0" value={form.budget ?? ""}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} className={inputCls} />
          </div>

          {/* วันเริ่มต้น + วันที่สิ้นสุด */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>วันเริ่มต้น</label>
              <input type="text" placeholder="เช่น 1 ม.ค. 2026" value={form.startDate || ""}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>วันที่สิ้นสุด</label>
              <input type="text" placeholder="เช่น 31 ม.ค. 2026" value={form.endDate || ""}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          {saved
            ? <span className="text-xs text-green-600 font-medium">✓ บันทึกเรียบร้อยแล้ว</span>
            : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium">
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteModalProps {
  ad: Ad;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ ad, onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div className="px-6 py-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <p className="font-semibold text-gray-900 text-sm">ลบโฆษณานี้?</p>
        <p className="text-gray-500 text-xs mt-1">"{ad.title}" จะถูกลบออกจากระบบถาวร</p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">ลบโฆษณา</button>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdManagementPage: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>(INITIAL_ADS);
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editAd, setEditAd] = useState<Ad | null>(null);
  const [deleteAd, setDeleteAd] = useState<Ad | null>(null);

  const totalAds = ads.length;
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
  const avgCtr = ads.length > 0
    ? (ads.reduce((s, a) => s + a.ctr, 0) / ads.length).toFixed(2)
    : "0.00";

  const filtered = ads.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.advertiser.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q)
    );
  });

  const handleAddSave = (form: Partial<Ad> & { id?: number }) => {
    const newAd: Ad = { ...emptyAd(), ...form, id: Date.now() } as Ad;
    setAds((prev) => [newAd, ...prev]);
  };

  const handleEditSave = (form: Partial<Ad> & { id?: number }) => {
    setAds((prev) => prev.map((a) => (a.id === form.id ? { ...a, ...form } as Ad : a)));
  };

  const handleDelete = () => {
    if (!deleteAd) return;
    setAds((prev) => prev.filter((a) => a.id !== deleteAd.id));
    setDeleteAd(null);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 bg-gray-500 p-6 space-y-5">
          <div className="flex-1 bg-gray-500 p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-white text-lg font-bold">จัดการโฆษณา</h1>
                <p className="text-gray-300 text-xs mt-0.5">ดูแลและจัดการโฆษณาทั้งหมดในระบบ</p>
              </div>
              <button
                onClick={() => setAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-950 transition-colors"
              >
                <Plus size={15} />
                เพิ่มโฆษณาใหม่
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="โฆษณาทั้งหมด" value={totalAds} icon={<LayoutList size={16} />} />
              <StatCard label="การแสดงผลทั้งหมด" value={totalImpressions} icon={<Users size={16} />} />
              <StatCard label="คลิกทั้งหมด" value={totalClicks} icon={<MousePointerClick size={16} />} />
              <StatCard label="CTR เฉลี่ย" value={`${avgCtr}%`} icon={<Target size={16} />} />
            </div>

            {/* Table Card */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              {/* Search */}
              <div className="px-5 py-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาโฆษณา..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 transition-all"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left px-5 py-3 text-gray-400 font-medium text-xs tracking-wide">ชื่อโฆษณา</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">ประเภท</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">ระยะเวลา</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">ช่วงเวลา</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">สถานะ</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">ผลลัพธ์</th>
                      <th className="text-center px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filtered.map((ad) => (
                      <tr key={ad.id} className="hover:bg-gray-700/40 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${ad.videoUrl ? "bg-blue-500/20" : "bg-gray-700"}`}>
                              {ad.videoUrl
                                ? <Play size={12} className="text-blue-400 ml-0.5" />
                                : <Video size={12} className="text-gray-500" />}
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm">{ad.title}</p>
                              <p className="text-gray-400 text-xs mt-0.5">{ad.advertiser}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded-md text-xs">
                            {ad.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-300 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded bg-gray-700 flex items-center justify-center text-gray-400">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
                                <path d="M5 3v2l1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                              </svg>
                            </span>
                            {ad.duration} วินาที
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-gray-300 text-xs">{ad.startDate}</p>
                          <p className="text-gray-500 text-xs">– {ad.endDate}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={ad.status} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <p className="text-white text-xs font-medium">{ad.impressions.toLocaleString()} ครั้ง</p>
                          <p className="text-gray-400 text-xs">{ad.clicks.toLocaleString()} คลิก</p>
                          <p className="text-gray-400 text-xs">{ad.ctr.toFixed(2)}% CTR</p>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditAd(ad)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteAd(ad)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-500 text-sm">
                          ไม่พบโฆษณาที่ตรงกับเงื่อนไข
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {addModal && (
        <AdModal mode="add" ad={emptyAd()} onClose={() => setAddModal(false)} onSave={handleAddSave} />
      )}
      {editAd && (
        <AdModal mode="edit" ad={editAd} onClose={() => setEditAd(null)} onSave={handleEditSave} />
      )}
      {deleteAd && (
        <DeleteModal ad={deleteAd} onClose={() => setDeleteAd(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
};

export default AdManagementPage;