import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Plus, Pencil, Trash2, Mic, X, Upload, ImageIcon } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useArtists } from "../../hooks/useArtists";
import { StatCard } from "../../components/common";
import { artistSchema, type ArtistFormValues } from "../../schema/adminSchema";

interface Artist {
  id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  createdAt: string;
}


const ArtistModal: React.FC<{
  mode: "add" | "edit";
  artist: Partial<Artist>;
  onClose: () => void;
  onSave: (data: { name: string; bio?: string; imageUrl?: string; imageFile?: File }) => Promise<void>;
}> = ({ mode, artist, onClose, onSave }) => {
  const [imagePreview, setImagePreview] = useState(artist.imageUrl || "");
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArtistFormValues>({
    resolver: zodResolver(artistSchema),
    defaultValues: { name: artist.name || "", bio: artist.bio || "", imageUrl: "" },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(undefined);
  };

  const onSubmit = async (data: ArtistFormValues) => {
    setSaving(true);
    try {
      await onSave({
        name: data.name,
        bio: data.bio || undefined,
        imageUrl: imageFile ? undefined : (imagePreview || undefined),
        imageFile,
      });
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900 text-sm">{mode === "add" ? "เพิ่มศิลปินใหม่" : "แก้ไขศิลปิน"}</p>
          <button onClick={onClose} disabled={saving} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">
            {/* Image Upload */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">รูปภาพศิลปิน</label>
              {imagePreview && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden mb-2 bg-gray-100">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" onError={handleRemoveImage} />
                  <button type="button" onClick={handleRemoveImage} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                    <X size={10} />
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-xs hover:border-gray-400 hover:text-gray-700 transition-colors mb-2 disabled:opacity-50">
                <Upload size={13} />อัปโหลดรูปภาพ
              </button>
              {!imageFile && (
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
                  <ImageIcon size={13} className="text-gray-400 flex-shrink-0" />
                  <input type="text" placeholder="หรือวาง URL รูปภาพ" value={imagePreview}
                    onChange={(e) => { setImagePreview(e.target.value); setImageFile(undefined); }}
                    className="flex-1 text-sm text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent" />
                </div>
              )}
              {imageFile && <p className="text-xs text-blue-500 mt-1">✓ เลือกไฟล์: {imageFile.name}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ชื่อศิลปิน *</label>
              <input type="text" placeholder="เช่น BTS, Taylor Swift"
                {...register("name")}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${errors.name ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-400"}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">⚠ {errors.name.message}</p>}
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ประวัติย่อ</label>
              <textarea placeholder="คำอธิบายสั้นๆ เกี่ยวกับศิลปิน"
                {...register("bio")} rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">ยกเลิก</button>
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
              ) : "บันทึกศิลปิน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal: React.FC<{ artist: Artist; onClose: () => void; onConfirm: () => void }> = ({ artist, onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div className="px-6 py-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3"><Trash2 size={18} className="text-red-500" /></div>
        <p className="font-semibold text-gray-900 text-sm">ลบศิลปินนี้?</p>
        <p className="text-gray-500 text-xs mt-1">"{artist.name}" จะถูกลบออกจากระบบ ข้อมูลที่เกี่ยวข้องอาจได้รับผลกระทบ</p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">ลบศิลปิน</button>
      </div>
    </div>
  </div>
);

const ArtistCard: React.FC<{ artist: Artist; onEdit: (a: Artist) => void; onDelete: (a: Artist) => void }> = ({ artist, onEdit, onDelete }) => (
  <div className="bg-gray-800 rounded-xl overflow-hidden group relative isolate">
    {/* Image — fixed aspect ratio so all cards are uniform */}
    <div className="relative w-full aspect-square overflow-hidden bg-gray-700">
      {artist.imageUrl ? (
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Mic size={36} className="text-gray-500" />
        </div>
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={() => onEdit(artist)}
          className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors">
          <Pencil size={12} />
        </button>
        <button
          onClick={() => onDelete(artist)}
          className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-red-400 hover:bg-red-500/40 transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
    </div>

    {/* Info */}
    <div className="px-3 py-2.5">
      <p className="text-white font-semibold text-sm truncate">{artist.name}</p>
      <p className="text-gray-400 text-xs mt-0.5 truncate">{artist.bio || "—"}</p>
    </div>
  </div>
);

const ArtistManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editArtist, setEditArtist] = useState<Artist | null>(null);
  const [deleteArtist, setDeleteArtist] = useState<Artist | null>(null);
  const { artists, loading, error, createArtist, updateArtist, deleteArtist: deleteArtistApi } = useArtists();

  const filtered = artists.filter((a: Artist) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.bio || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteArtist) return;
    await deleteArtistApi(deleteArtist.id);
    setDeleteArtist(null);
  };

  const handleEditSave = async (data: any) => {
    if (!editArtist) return;
    await updateArtist(editArtist.id, data);
    setEditArtist(null);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 bg-gray-500 p-6 space-y-5">
          {error && <div className="bg-red-900 text-red-300 p-3 rounded-lg text-sm">{error}</div>}
          {loading && <div className="text-center py-4 text-gray-300 text-sm">กำลังโหลด...</div>}

          <div className="flex items-center justify-between">
            <div />
            <button onClick={() => setAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-950 transition-colors">
              <Plus size={15} />เพิ่มศิลปิน
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard label="ศิลปินทั้งหมด" value={artists.length} icon={<Mic size={16} />} />
            <StatCard label="ผลการค้นหา" value={filtered.length} icon={<Search size={16} />} />
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="ค้นหาศิลปิน..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-500" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((artist: Artist) => (
              <ArtistCard key={artist.id} artist={artist} onEdit={setEditArtist} onDelete={setDeleteArtist} />
            ))}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400 text-sm">ไม่พบศิลปิน</div>
            )}
          </div>
        </div>
      </div>

      {addModal && (
        <ArtistModal mode="add" artist={{}} onClose={() => setAddModal(false)} onSave={createArtist} />
      )}
      {editArtist && (
        <ArtistModal mode="edit" artist={editArtist} onClose={() => setEditArtist(null)} onSave={handleEditSave} />
      )}
      {deleteArtist && (
        <DeleteModal artist={deleteArtist} onClose={() => setDeleteArtist(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
};

export default ArtistManagementPage;
