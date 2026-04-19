// หน้าจัดการโฆษณา — table + modal CRUD: สร้าง/แก้ไข/ลบ ad, เลือกประเภท (SPLASH/AFTER_SONG/AFTER_MULTIPLE), upload image/video, toggle active, preview media | ใช้ useAds
//
// หลักการทำงาน:
// 1. useAds hook: โหลด ads list, CRUD, toggle active
// 2. แสดง table โฆษณา: ชื่อ, ประเภท (SPLASH/AFTER_SONG), impression count, status
// 3. modal สร้าง/แก้ไข: form มี image/video upload + duration + link URL
// 4. toggle switch: เปิด/ปิดโฆษณาได้โดยไม่ต้องลบ

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search, Plus, Pencil, Trash2, X, Users, LayoutList,
  Upload, Video, Image as ImageIcon, Play,
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useAds } from "../../hooks/useAds";
import { StatCard } from "../../components/common";
import { toDateInputValue, formatDate } from "../../utils/format";
import { adSchema, type AdFormValues } from "../../schema/adminSchema";

interface Ad {
  id: string;
  title: string;
  advertiser: string;
  adType: string;
  adDuration: number;
  imageUrl: string;
  linkUrl?: string;
  impressions: number;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

const AD_TYPE_LABEL: Record<string, string> = {
  SPLASH: "หลังจาก Login",
  AFTER_SONG: "ระหว่างเพลง (random 1-3 เพลง)",
};

type MediaType = "image" | "video" | null;

const getMediaType = (file: File): MediaType => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
};

const getMediaDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(Math.round(el.duration)); };
    el.onerror = () => { URL.revokeObjectURL(url); resolve(30); };
    el.src = url;
  });

const isVideoUrl = (url: string) =>
  url && (url.includes("/video/upload/") || /\.(mp4|webm|mov)(\?|$)/i.test(url));

// ---- Media Preview Modal (คลิก thumbnail เพื่อดูเต็ม) ----
const MediaPreviewModal: React.FC<{ url: string; title: string; onClose: () => void }> = ({ url, title, onClose }) => {
  const isVid = isVideoUrl(url);
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X size={16} />
        </button>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          {isVid ? (
            <video
              src={url}
              controls
              autoPlay
              className="w-full max-h-[70vh] object-contain"
            />
          ) : (
            <img
              src={url}
              alt={title}
              className="w-full max-h-[70vh] object-contain"
            />
          )}
          <div className="px-4 py-3 border-t border-gray-700">
            <p className="text-white text-sm font-medium">{title}</p>
            <p className="text-gray-400 text-xs mt-0.5">{isVid ? "คลิปวิดีโอโฆษณา" : "รูปภาพโฆษณา"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Ad Modal ----
const AdModal: React.FC<{
  mode: "add" | "edit";
  ad: Partial<Ad>;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}> = ({ mode, ad, onClose, onSave }) => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(ad.imageUrl || "");
  const isExistingVideo = mode === "edit" && ad.imageUrl && isVideoUrl(ad.imageUrl);
  const [durationDetected, setDurationDetected] = useState(!!isExistingVideo && (ad.adDuration ?? 0) > 0);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdFormValues>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      title: ad.title || "",
      advertiser: ad.advertiser || "",
      adType: (ad.adType as "SPLASH" | "AFTER_SONG") || "SPLASH",
      adDuration: ad.adDuration ?? 30,
      linkUrl: ad.linkUrl || "",
      isActive: ad.isActive ?? true,
      priority: ad.priority ?? 1,
      startDate: toDateInputValue(ad.startDate),
      endDate: toDateInputValue(ad.endDate),
    },
  });

  const handleFile = async (file: File) => {
    const type = getMediaType(file);
    if (!type) return;
    setMediaFile(file);
    setMediaType(type);
    setPreviewUrl(URL.createObjectURL(file));
    setMediaError(false);
    if (type === "video") {
      const dur = await getMediaDuration(file);
      setValue("adDuration", dur);
      setDurationDetected(true);
    } else {
      setDurationDetected(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearMedia = () => {
    if (previewUrl && mediaFile) URL.revokeObjectURL(previewUrl);
    setMediaFile(null);
    setMediaType(null);
    setPreviewUrl(ad.imageUrl || "");
    setDurationDetected(false);
  };

  const onSubmit = async (data: AdFormValues) => {
    if (mode === "add" && !mediaFile && !previewUrl) {
      setMediaError(true);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...data,
        ...(mediaFile && { mediaFile }),
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      });
      onClose();
    } catch (err) {
      console.error("Save ad failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const showMediaError = mediaError && mode === "add" && !mediaFile && !previewUrl;

  const inputCls = (hasError?: boolean) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all bg-white ${
      hasError
        ? "border-red-400 focus:ring-red-500/20 focus:border-red-400"
        : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-400"
    }`;
  const labelCls = "text-xs font-medium text-gray-500 mb-1.5 block";

  // ตรวจประเภทสื่อของ preview URL ที่มีอยู่ (กรณี edit)
  const resolvedMediaType: MediaType = mediaType
    ?? (previewUrl && isVideoUrl(previewUrl) ? "video" : previewUrl ? "image" : null);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <p className="font-semibold text-gray-900 text-sm">{mode === "add" ? "เพิ่มโฆษณาใหม่" : "แก้ไขโฆษณา"}</p>
          <button type="button" onClick={onClose} disabled={saving} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

            {/* Media upload zone */}
            <div>
              <label className={labelCls}>
                ไฟล์โฆษณา {mode === "add" && <span className="text-red-400">*</span>}{" "}
                <span className="text-gray-300 font-normal">(รูปภาพ / MP4)</span>
              </label>

              {previewUrl ? (
                <div className={`rounded-xl overflow-hidden mb-2 border-2 transition-all ${showMediaError ? "border-red-400" : "border-transparent"} ${resolvedMediaType === "image" ? "bg-gray-100" : "bg-gray-900"}`}>
                  {resolvedMediaType === "image" ? (
                    <img src={previewUrl} alt="preview" className="w-full max-h-52 object-contain" />
                  ) : (
                    <video src={previewUrl} controls className="w-full max-h-52 object-contain" />
                  )}
                  <div className="flex items-center justify-between px-3 py-2 bg-black/40">
                    <div className="flex items-center gap-2">
                      {resolvedMediaType === "video" ? (
                        <Video size={12} className="text-blue-400" />
                      ) : (
                        <ImageIcon size={12} className="text-gray-400" />
                      )}
                      <span className="text-white text-xs truncate max-w-[200px]">
                        {mediaFile ? mediaFile.name : (resolvedMediaType === "video" ? "คลิปวิดีโอโฆษณา" : "รูปภาพโฆษณา")}
                      </span>
                      {mediaFile && <span className="text-green-400 text-xs">✓ เพิ่มแล้ว</span>}
                      {!mediaFile && mode === "edit" && <span className="text-gray-400 text-xs">ไฟล์เดิม</span>}
                    </div>
                    <button type="button" onClick={clearMedia}
                      className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors flex-shrink-0">
                      <X size={10} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 py-7 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    showMediaError ? "border-red-400 bg-red-50"
                    : dragOver ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${showMediaError ? "bg-red-100" : "bg-gray-100"}`}>
                      <ImageIcon size={16} className={showMediaError ? "text-red-400" : "text-gray-400"} />
                    </div>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${showMediaError ? "bg-red-100" : "bg-gray-100"}`}>
                      <Video size={16} className={showMediaError ? "text-red-400" : "text-gray-400"} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${showMediaError ? "text-red-600" : "text-gray-600"}`}>
                      <span className={showMediaError ? "text-red-500" : "text-blue-500"}>คลิกเพื่อเลือกไฟล์</span> หรือลากมาวาง
                    </p>
                    <p className={`text-xs mt-0.5 ${showMediaError ? "text-red-400" : "text-gray-400"}`}>รองรับ JPG, PNG, MP4</p>
                  </div>
                  <Upload size={12} className={showMediaError ? "text-red-400" : "text-gray-400"} />
                </div>
              )}

              {showMediaError && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠</span> กรุณาเพิ่มไฟล์โฆษณาก่อนบันทึก
                </p>
              )}

              {previewUrl && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-xs hover:border-gray-400 hover:text-gray-700 transition-colors">
                  <Upload size={12} />{mode === "edit" ? "เปลี่ยนไฟล์โฆษณา (ถ้าต้องการ)" : "เปลี่ยนไฟล์"}
                </button>
              )}

              <input ref={fileInputRef} type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
            </div>

            {/* ชื่อโฆษณา + ผู้ลงโฆษณา */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>ชื่อโฆษณา <span className="text-red-400">*</span></label>
                <input type="text" placeholder="ชื่อโฆษณา" {...register("title")} className={inputCls(!!errors.title)} />
                {errors.title && <p className="text-red-500 text-xs mt-1">⚠ {errors.title.message}</p>}
              </div>
              <div>
                <label className={labelCls}>ผู้ลงโฆษณา <span className="text-red-400">*</span></label>
                <input type="text" placeholder="ชื่อบริษัท" {...register("advertiser")} className={inputCls(!!errors.advertiser)} />
                {errors.advertiser && <p className="text-red-500 text-xs mt-1">⚠ {errors.advertiser.message}</p>}
              </div>
            </div>

            {/* URL ปลายทาง */}
            <div>
              <label className={labelCls}>URL เมื่อกดโฆษณา <span className="text-gray-300 font-normal">(ไม่บังคับ)</span></label>
              <input type="url" placeholder="https://example.com" {...register("linkUrl")} className={inputCls(!!errors.linkUrl)} />
              {errors.linkUrl && <p className="text-red-500 text-xs mt-1">⚠ {errors.linkUrl.message}</p>}
              <p className="text-xs text-gray-400 mt-1">ผู้ใช้สามารถกดที่โฆษณาเพื่อเปิด URL นี้ได้</p>
            </div>

            {/* ประเภทโฆษณา + วินาทีก่อนข้าม */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>ประเภทโฆษณา</label>
                <select {...register("adType")} className={inputCls()}>
                  <option value="SPLASH">หลังจาก Login</option>
                  <option value="AFTER_SONG">ระหว่างเพลง (random 1-3 เพลง)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  วินาทีก่อนข้ามได้{" "}
                  {durationDetected && <span className="text-green-500 font-normal">(คำนวณจากวิดีโอ)</span>}
                </label>
                <div className="relative">
                  <input type="number" min={1} max={300}
                    {...register("adDuration", { valueAsNumber: true })} className={inputCls(!!errors.adDuration)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">วิ</span>
                </div>
              </div>
            </div>

            {/* Priority slider */}
            <div>
              <label className={labelCls}>
                ความสำคัญ (Priority)
                <span className="text-gray-400 font-normal ml-1">— ยิ่งสูง ยิ่งมีโอกาสถูกเลือกมากกว่า</span>
              </label>
              <div className="flex items-center gap-3">
                <input type="range" min={1} max={10} step={1}
                  {...register("priority", { valueAsNumber: true })} className="flex-1 accent-violet-600" />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-0.5 px-0.5">
                <span>ต่ำ (1)</span><span>ปกติ (5)</span><span>สูงสุด (10)</span>
              </div>
            </div>

            {/* วันเริ่มต้น + วันสิ้นสุด */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>วันเริ่มต้น</label>
                <input type="date" {...register("startDate")} className={inputCls()} />
              </div>
              <div>
                <label className={labelCls}>วันสิ้นสุด</label>
                <input type="date" {...register("endDate")} className={inputCls()} />
              </div>
            </div>

            {/* สถานะ */}
            <div>
              <label className={labelCls}>สถานะ</label>
              <select {...register("isActive", { setValueAs: (v) => v === "true" || v === true })} className={inputCls()}>
                <option value="true">ใช้งาน</option>
                <option value="false">หยุดชั่วคราว</option>
              </select>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 flex-shrink-0">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">ยกเลิก</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 min-w-[100px]">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  กำลังบันทึก...
                </span>
              ) : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---- Delete Modal ----
const DeleteModal: React.FC<{ ad: Ad; onClose: () => void; onConfirm: () => void }> = ({ ad, onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div className="px-6 py-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3"><Trash2 size={18} className="text-red-500" /></div>
        <p className="font-semibold text-gray-900 text-sm">ลบโฆษณานี้?</p>
        <p className="text-gray-500 text-xs mt-1">"{ad.title}" จะถูกลบออกจากระบบถาวร</p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
        <button onClick={onConfirm}
          className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">ลบโฆษณา</button>
      </div>
    </div>
  </div>
);

// ---- Thumbnail คลิกได้ในตาราง ----
const AdThumbnail: React.FC<{ url: string; title: string; onPreview: () => void }> = ({ url, title, onPreview }) => {
  const isVid = isVideoUrl(url);
  return (
    <button
      onClick={onPreview}
      title="คลิกเพื่อดูตัวอย่าง"
      className="w-14 h-10 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden relative group hover:ring-2 hover:ring-blue-400 transition-all"
    >
      {url && !isVid ? (
        <>
          <img src={url} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Play size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </>
      ) : isVid ? (
        <>
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <Video size={14} className="text-blue-400" />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Play size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </>
      ) : (
        <ImageIcon size={14} className="text-gray-500" />
      )}
    </button>
  );
};

// ---- Main Page ----
const AdManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editAd, setEditAd] = useState<Ad | null>(null);
  const [deleteAd, setDeleteAd] = useState<Ad | null>(null);
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);
  const { ads, stats, loading, error, createAds, updateAds, toggleAds, deleteAds } = useAds();

  const filtered = ads.filter((a: Ad) => {
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || (a.advertiser || "").toLowerCase().includes(q);
  });

  const handleDelete = async () => {
    if (!deleteAd) return;
    await deleteAds(deleteAd.id);
    setDeleteAd(null);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 bg-gray-500 p-6 space-y-5">
          <div className="flex-1 bg-gray-500 p-6 space-y-5">
            {error && <div className="bg-red-900 text-red-300 p-3 rounded-lg text-sm">{error}</div>}
            {loading && <div className="text-center py-4 text-gray-300 text-sm">กำลังโหลด...</div>}

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-white text-lg font-bold">จัดการโฆษณา</h1>
                <p className="text-gray-300 text-xs mt-0.5">ดูแลและจัดการโฆษณาทั้งหมดในระบบ</p>
              </div>
              <button onClick={() => setAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-950 transition-colors">
                <Plus size={15} />เพิ่มโฆษณาใหม่
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="โฆษณาทั้งหมด" value={stats?.totalAds ?? ads.length} icon={<LayoutList size={16} />} />
              <StatCard label="โฆษณาที่ใช้งาน" value={stats?.activeAds ?? ads.filter((a: Ad) => a.isActive).length} icon={<Users size={16} />} />
              <StatCard label="ยอดแสดงทั้งหมด" value={stats?.totalImpressions ?? 0} icon={<Users size={16} />} />
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="ค้นหาโฆษณา..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 transition-all" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left px-5 py-3 text-gray-400 font-medium text-xs">ชื่อโฆษณา</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">ประเภท</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">ความยาว</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">ช่วงเวลา</th>
                      <th className="text-center px-4 py-3 text-gray-400 font-medium text-xs">Priority</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">สถานะ</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs">ยอดแสดง</th>
                      <th className="text-center px-4 py-3 text-gray-400 font-medium text-xs">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filtered.map((ad: Ad) => (
                      <tr key={ad.id} className="hover:bg-gray-700/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <AdThumbnail
                              url={ad.imageUrl}
                              title={ad.title}
                              onPreview={() => setPreviewAd(ad)}
                            />
                            <div>
                              <p className="font-medium text-white text-sm">{ad.title}</p>
                              <p className="text-gray-400 text-xs mt-0.5">{ad.advertiser}</p>
                              {/* Badge ประเภทสื่อ */}
                              <span className={`inline-flex items-center gap-1 text-xs mt-0.5 ${isVideoUrl(ad.imageUrl) ? "text-blue-400" : "text-gray-500"}`}>
                                {isVideoUrl(ad.imageUrl) ? <><Video size={10} />คลิปวิดีโอ</> : <><ImageIcon size={10} />รูปภาพ</>}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded-md text-xs">
                            {AD_TYPE_LABEL[ad.adType] || ad.adType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-300 text-sm">{ad.adDuration} วินาที</td>
                        <td className="px-4 py-3.5">
                          <p className="text-gray-300 text-xs">{formatDate(ad.startDate)}</p>
                          <p className="text-gray-500 text-xs">– {formatDate(ad.endDate)}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${
                            (ad.priority ?? 1) >= 8 ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : (ad.priority ?? 1) >= 5 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "bg-gray-700 text-gray-400 border border-gray-600"
                          }`}>
                            {ad.priority ?? 1}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${ad.isActive ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"}`}>
                            {ad.isActive ? "ใช้งาน" : "หยุดชั่วคราว"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-white text-xs font-medium">
                          {ad.impressions.toLocaleString()} ครั้ง
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => toggleAds(ad.id)}
                              className={`px-2 py-1 rounded text-xs transition-colors ${ad.isActive ? "text-yellow-400 hover:bg-yellow-500/10" : "text-green-400 hover:bg-green-500/10"}`}>
                              {ad.isActive ? "ปิด" : "เปิด"}
                            </button>
                            <button onClick={() => setEditAd(ad)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteAd(ad)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && filtered.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-12 text-gray-500 text-sm">ไม่พบโฆษณา</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {addModal && (
        <AdModal mode="add" ad={{ adType: "SPLASH", adDuration: 30, isActive: true }}
          onClose={() => setAddModal(false)} onSave={createAds} />
      )}
      {editAd && (
        <AdModal mode="edit" ad={editAd}
          onClose={() => setEditAd(null)}
          onSave={async (data) => { await updateAds(editAd.id, data); setEditAd(null); }} />
      )}
      {deleteAd && (
        <DeleteModal ad={deleteAd} onClose={() => setDeleteAd(null)} onConfirm={handleDelete} />
      )}
      {previewAd && (
        <MediaPreviewModal
          url={previewAd.imageUrl}
          title={previewAd.title}
          onClose={() => setPreviewAd(null)}
        />
      )}
    </div>
  );
};

export default AdManagementPage;
