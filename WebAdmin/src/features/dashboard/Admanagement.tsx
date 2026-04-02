import React, { useState, useRef } from "react";
import {
  Search, Plus, Pencil, Trash2, X, Users, LayoutList,
  Upload, Video, Image as ImageIcon,
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useAds } from "../../hooks/useAds";

interface Ad {
  id: string;
  title: string;
  advertiser: string;
  adType: string;
  adDuration: number;
  imageUrl: string;
  impressions: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

const AD_TYPE_LABEL: Record<string, string> = {
  SPLASH: "ตอนเปิดแอป",
  AFTER_SONG: "หลังจบ 1 เพลง",
  AFTER_MULTIPLE: "หลังจบหลายเพลง",
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-gray-800 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-0">
    <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-300">{icon}</div>
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-xl font-bold mt-0.5">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

const toDateInputValue = (val?: string | Date | null): string => {
  if (!val) return "";
  try {
    if (typeof val === "string" && val.includes("/")) {
      const [datePart] = val.split(" ");
      const [dd, mm, yyyy] = datePart.split("/");
      return `${parseInt(yyyy) - 543}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    return new Date(val).toISOString().split("T")[0];
  } catch { return ""; }
};

const formatDate = (d?: string | null): string => {
  if (!d) return "—";
  try {
    if (typeof d === "string" && d.includes("/")) return d.split(" ")[0];
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  } catch { return "—"; }
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
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(el.duration));
    };
    el.onerror = () => { URL.revokeObjectURL(url); resolve(30); };
    el.src = url;
  });

// ---- Ad Modal ----
const AdModal: React.FC<{
  mode: "add" | "edit";
  ad: Partial<Ad>;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}> = ({ mode, ad, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: ad.title || "",
    advertiser: ad.advertiser || "",
    adType: ad.adType || "SPLASH",
    adDuration: ad.adDuration ?? 30,
    isActive: ad.isActive ?? true,
    startDate: toDateInputValue(ad.startDate),
    endDate: toDateInputValue(ad.endDate),
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [durationDetected, setDurationDetected] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const type = getMediaType(file);
    if (!type) return;
    setMediaFile(file);
    setMediaType(type);
    setPreviewUrl(URL.createObjectURL(file));
    // คำนวณความยาวอัตโนมัติสำหรับ video
    if (type === "video") {
      const dur = await getMediaDuration(file);
      setForm((prev) => ({ ...prev, adDuration: dur }));
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

  const handleSave = async () => {
    if (!form.title.trim() || !form.advertiser.trim()) return;
    if (mode === "add" && !mediaFile) return; // add ต้องมีไฟล์
    setSaving(true);
    try {
      await onSave({
        ...form,
        adDuration: Number(form.adDuration),
        ...(mediaFile && { mediaFile }),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      onClose();
    } catch (err) {
      console.error("Save ad failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const isValid = form.title.trim() && form.advertiser.trim() && (mode === "edit" || mediaFile);
  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";
  const labelCls = "text-xs font-medium text-gray-500 mb-1.5 block";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <p className="font-semibold text-gray-900 text-sm">{mode === "add" ? "เพิ่มโฆษณาใหม่" : "แก้ไขโฆษณา"}</p>
          <button onClick={onClose} disabled={saving} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"><X size={16} /></button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {/* Media upload zone */}
          <div>
            <label className={labelCls}>
              ไฟล์โฆษณา * <span className="text-gray-300 font-normal">(รูปภาพ / MP4)</span>
            </label>

            {previewUrl ? (
              (() => {
                // ตรวจสอบประเภทสื่อ: ใช้ mediaType (ถ้าเพิ่งเลือกไฟล์) หรือ detect จาก URL (กรณี edit)
                const resolvedType: MediaType = mediaType
                  ?? (previewUrl.match(/\.(mp4|webm|mov)(\?|$)/i) || previewUrl.includes("/video/upload/") ? "video"
                    : "image");
                return (
                  <div className={`relative rounded-xl overflow-hidden mb-2 ${resolvedType === "image" ? "bg-gray-100" : "bg-gray-900"}`}>
                    {resolvedType === "image" ? (
                      <img src={previewUrl} alt="preview" className="w-full max-h-44 object-contain" />
                    ) : (
                      <video src={previewUrl} controls className="w-full max-h-44 object-contain" />
                    )}
                    <button onClick={clearMedia}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                      <X size={12} />
                    </button>
                    {mediaFile && (
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white text-xs truncate">{mediaFile.name}</p>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              /* Drop zone — แสดงเฉพาะเมื่อยังไม่มีไฟล์/URL */
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 py-7 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon size={16} className="text-gray-400" /></div>
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><Video size={16} className="text-gray-400" /></div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600"><span className="text-blue-500">คลิกเพื่อเลือกไฟล์</span> หรือลากมาวาง</p>
                  <p className="text-xs text-gray-400 mt-0.5">รองรับ JPG, PNG, MP4</p>
                </div>
                <Upload size={12} className="text-gray-400" />
              </div>
            )}
            {/* ปุ่มเปลี่ยนไฟล์ — แสดงเมื่อมี preview อยู่แล้ว */}
            {previewUrl && (
              <button onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-xs hover:border-gray-400 hover:text-gray-700 transition-colors">
                <Upload size={12} />{mode === "edit" ? "เปลี่ยนไฟล์โฆษณา (ถ้าต้องการ)" : "เปลี่ยนไฟล์"}
              </button>
            )}
            {mediaFile && (
              <button onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-xs hover:border-gray-400 hover:text-gray-700 transition-colors">
                <Upload size={12} />เปลี่ยนไฟล์
              </button>
            )}
            <input ref={fileInputRef} type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          </div>

          {/* ชื่อโฆษณา + ผู้ลงโฆษณา */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ชื่อโฆษณา *</label>
              <input type="text" placeholder="ชื่อโฆษณา" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ผู้ลงโฆษณา *</label>
              <input type="text" placeholder="ชื่อบริษัท" value={form.advertiser}
                onChange={(e) => setForm({ ...form, advertiser: e.target.value })} className={inputCls} />
            </div>
          </div>

          {/* ประเภทโฆษณา + ความยาว */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ประเภทโฆษณา</label>
              <select value={form.adType} onChange={(e) => setForm({ ...form, adType: e.target.value })} className={inputCls}>
                <option value="SPLASH">ตอนเปิดแอป</option>
                <option value="AFTER_SONG">หลังจบ 1 เพลง</option>
                <option value="AFTER_MULTIPLE">หลังจบหลายเพลง</option>
              </select>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-xs font-medium text-gray-500">ความยาว (วินาที)</label>
                {durationDetected && (
                  <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">ตรวจจับอัตโนมัติ</span>
                )}
              </div>
              <input type="number" min={0} value={form.adDuration}
                onChange={(e) => { setForm({ ...form, adDuration: Number(e.target.value) }); setDurationDetected(false); }}
                className={inputCls}
                readOnly={durationDetected}
              />
            </div>
          </div>

          {/* วันเริ่มต้น + วันสิ้นสุด */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>วันเริ่มต้น</label>
              <input type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>วันสิ้นสุด</label>
              <input type="date" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} />
            </div>
          </div>

          {/* สถานะ */}
          <div>
            <label className={labelCls}>สถานะ</label>
            <select value={form.isActive ? "true" : "false"}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })} className={inputCls}>
              <option value="true">ใช้งาน</option>
              <option value="false">หยุดชั่วคราว</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">ยกเลิก</button>
          <button onClick={handleSave} disabled={saving || !isValid}
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

// ---- Preview thumbnail in table ----
const AdThumbnail: React.FC<{ url: string }> = ({ url }) => {
  const isVideo = url && (url.includes("/video/upload/") || url.match(/\.(mp4|webm|mov)(\?|$)/i));
  return (
    <div className="w-8 h-8 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
      {url && !isVideo ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : isVideo ? (
        <Video size={12} className="text-blue-400" />
      ) : (
        <Video size={12} className="text-gray-500" />
      )}
    </div>
  );
};

// ---- Main Page ----
const AdManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editAd, setEditAd] = useState<Ad | null>(null);
  const [deleteAd, setDeleteAd] = useState<Ad | null>(null);
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
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">สถานะ</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs">ยอดแสดง</th>
                      <th className="text-center px-4 py-3 text-gray-400 font-medium text-xs">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filtered.map((ad: Ad) => (
                      <tr key={ad.id} className="hover:bg-gray-700/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <AdThumbnail url={ad.imageUrl} />
                            <div>
                              <p className="font-medium text-white text-sm">{ad.title}</p>
                              <p className="text-gray-400 text-xs mt-0.5">{ad.advertiser}</p>
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
                      <tr><td colSpan={7} className="text-center py-12 text-gray-500 text-sm">ไม่พบโฆษณา</td></tr>
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
    </div>
  );
};

export default AdManagementPage;
