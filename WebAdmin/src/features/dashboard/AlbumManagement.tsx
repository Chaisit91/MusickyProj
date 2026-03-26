import React, { useState, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Disc, X, Upload, ImageIcon, ChevronDown } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useAlbums } from "../../hooks/useAlbums";
import { useArtists } from "../../hooks/useArtists";

interface Album {
  id: string;
  title: string;
  artistId: string;
  releaseDate: string;
  coverUrl?: string;
  artist?: { id: string; name: string; imageUrl?: string };
}

interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
}

const StatCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-gray-800 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-0">
    {icon && <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-300">{icon}</div>}
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-xl font-bold mt-0.5">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

const AlbumModal: React.FC<{
  mode: "add" | "edit";
  album: Partial<Album>;
  artists: Artist[];
  onClose: () => void;
  onSave: (data: { title: string; artistId: string; releaseDate: string; coverUrl?: string; coverFile?: File }) => Promise<void>;
}> = ({ mode, album, artists, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: album.title || "",
    artistId: album.artistId || "",
    releaseDate: album.releaseDate ? album.releaseDate.split("T")[0] : "",
  });
  const [imagePreview, setImagePreview] = useState(album.coverUrl || "");
  const [coverFile, setCoverFile] = useState<File | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setCoverFile(undefined);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.artistId || !form.releaseDate) return;
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        artistId: form.artistId,
        releaseDate: new Date(form.releaseDate).toISOString(),
        coverUrl: coverFile ? undefined : (imagePreview || undefined),
        coverFile,
      });
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const isValid = form.title.trim() && form.artistId && form.releaseDate;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900 text-sm">{mode === "add" ? "เพิ่มอัลบั้มใหม่" : "แก้ไขอัลบั้ม"}</p>
          <button onClick={onClose} disabled={saving} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Cover Image */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">ปกอัลบั้ม</label>
            {imagePreview && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden mb-2 bg-gray-100">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" onError={handleRemoveImage} />
                <button onClick={handleRemoveImage} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                  <X size={10} />
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button onClick={() => fileInputRef.current?.click()} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-xs hover:border-gray-400 hover:text-gray-700 transition-colors mb-2 disabled:opacity-50">
              <Upload size={13} />อัปโหลดปกอัลบั้ม
            </button>
            {!coverFile && (
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
                <ImageIcon size={13} className="text-gray-400 flex-shrink-0" />
                <input type="text" placeholder="หรือวาง URL รูปภาพ" value={imagePreview}
                  onChange={(e) => { setImagePreview(e.target.value); setCoverFile(undefined); }}
                  className="flex-1 text-sm text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent" />
              </div>
            )}
            {coverFile && <p className="text-xs text-blue-500 mt-1">✓ เลือกไฟล์: {coverFile.name}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">ชื่ออัลบั้ม *</label>
            <input type="text" placeholder="เช่น Dynamite, Folklore" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
          </div>

          {/* Artist Dropdown */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">ศิลปิน *</label>
            <div className="relative">
              <select value={form.artistId} onChange={(e) => setForm({ ...form, artistId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white">
                <option value="">-- เลือกศิลปิน --</option>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Release Date */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">วันที่วางจำหน่าย *</label>
            <input type="date" value={form.releaseDate}
              onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">ยกเลิก</button>
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
            ) : "บันทึกอัลบั้ม"}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal: React.FC<{ album: Album; onClose: () => void; onConfirm: () => void }> = ({ album, onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div className="px-6 py-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3"><Trash2 size={18} className="text-red-500" /></div>
        <p className="font-semibold text-gray-900 text-sm">ลบอัลบั้มนี้?</p>
        <p className="text-gray-500 text-xs mt-1">"{album.title}" จะถูกลบออกจากระบบ</p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">ลบอัลบั้ม</button>
      </div>
    </div>
  </div>
);

const AlbumCard: React.FC<{ album: Album; onEdit: (a: Album) => void; onDelete: (a: Album) => void }> = ({ album, onEdit, onDelete }) => (
  <div className="bg-gray-800 rounded-xl overflow-hidden group relative">
    <div className="relative h-36 overflow-hidden">
      {album.coverUrl ? (
        <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-700">
          <Disc size={32} className="text-gray-500" />
        </div>
      )}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(album)} className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"><Pencil size={13} /></button>
        <button onClick={() => onDelete(album)} className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"><Trash2 size={13} /></button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
        <p className="text-white font-bold text-sm drop-shadow truncate">{album.title}</p>
      </div>
    </div>
    <div className="px-3 py-2.5">
      <p className="text-gray-300 text-xs truncate">{album.artist?.name || "—"}</p>
      <p className="text-gray-500 text-xs mt-0.5">{album.releaseDate ? new Date(album.releaseDate).getFullYear() : "—"}</p>
    </div>
  </div>
);

const AlbumManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterArtistId, setFilterArtistId] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editAlbum, setEditAlbum] = useState<Album | null>(null);
  const [deleteAlbum, setDeleteAlbum] = useState<Album | null>(null);
  const { albums, loading, error, createAlbum, updateAlbum, deleteAlbum: deleteAlbumApi } = useAlbums();
  const { artists } = useArtists();

  const filtered = albums.filter((a: Album) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.artist?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchArtist = !filterArtistId || a.artistId === filterArtistId;
    return matchSearch && matchArtist;
  });

  const handleDelete = async () => {
    if (!deleteAlbum) return;
    await deleteAlbumApi(deleteAlbum.id);
    setDeleteAlbum(null);
  };

  const handleEditSave = async (data: any) => {
    if (!editAlbum) return;
    await updateAlbum(editAlbum.id, data);
    setEditAlbum(null);
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
              <Plus size={15} />เพิ่มอัลบั้ม
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard label="อัลบั้มทั้งหมด" value={albums.length} icon={<Disc size={16} />} />
            <StatCard label="ผลการค้นหา" value={filtered.length} icon={<Search size={16} />} />
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="ค้นหาอัลบั้ม..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-500" />
            </div>
            <div className="relative">
              <select value={filterArtistId} onChange={(e) => setFilterArtistId(e.target.value)}
                className="pl-3 pr-8 py-2 text-sm bg-white rounded-lg focus:outline-none text-gray-900 appearance-none">
                <option value="">ศิลปินทั้งหมด</option>
                {artists.map((a: Artist) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((album: Album) => (
              <AlbumCard key={album.id} album={album} onEdit={setEditAlbum} onDelete={setDeleteAlbum} />
            ))}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400 text-sm">ไม่พบอัลบั้ม</div>
            )}
          </div>
        </div>
      </div>

      {addModal && (
        <AlbumModal mode="add" album={{}} artists={artists} onClose={() => setAddModal(false)} onSave={createAlbum} />
      )}
      {editAlbum && (
        <AlbumModal mode="edit" album={editAlbum} artists={artists} onClose={() => setEditAlbum(null)} onSave={handleEditSave} />
      )}
      {deleteAlbum && (
        <DeleteModal album={deleteAlbum} onClose={() => setDeleteAlbum(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
};

export default AlbumManagementPage;
