import React, { useState, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Music, X, Upload, ImageIcon } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Genre {
  id: number;
  name: string;
  description: string;
  image: string;
  color: string;
  songCount: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_GENRES: Genre[] = [
  { id: 1, name: "Pop", description: "Popular mainstream music", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop", color: "#ef4444", songCount: 2540 },
  { id: 2, name: "Rock", description: "Rock and alternative music", image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=200&fit=crop", color: "#8b5cf6", songCount: 1823 },
  { id: 3, name: "Jazz", description: "Jazz and smooth music", image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=200&fit=crop", color: "#f59e0b", songCount: 846 },
  { id: 4, name: "Classical", description: "Classical and orchestral music", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=200&fit=crop", color: "#6366f1", songCount: 682 },
  { id: 5, name: "Hip-Hop", description: "Hip hop and rap music", image: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=400&h=200&fit=crop", color: "#ec4899", songCount: 1534 },
  { id: 6, name: "Electronic", description: "Electronic and EDM music", image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=200&fit=crop", color: "#06b6d4", songCount: 1289 },
  { id: 7, name: "R&B", description: "R&B and soul music", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=200&fit=crop", color: "#f97316", songCount: 695 },
  { id: 8, name: "Country", description: "Country and folk music", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=200&fit=crop", color: "#84cc16", songCount: 543 },
  { id: 9, name: "Indie", description: "Independent music", image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&h=200&fit=crop", color: "#14b8a6", songCount: 1724 },
  { id: 10, name: "Alternative", description: "Alternative music styles", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=200&fit=crop", color: "#64748b", songCount: 892 },
];

const COLOR_PALETTE = [
  "#ef4444", "#f97316", "#eab308", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  "#8b5cf6", "#ec4899", "#64748b", "#374151",
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-gray-800 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-0">
    {icon && (
      <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-300">
        {icon}
      </div>
    )}
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-xl font-bold mt-0.5">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  </div>
);

// ─── Genre Modal ──────────────────────────────────────────────────────────────

interface GenreModalProps {
  mode: "add" | "edit";
  genre: Partial<Genre> & { id?: number };
  onClose: () => void;
  onSave: (genre: Partial<Genre> & { id?: number }) => void;
}

const emptyGenre = (): Partial<Genre> => ({
  name: "",
  description: "",
  image: "",
  color: "#3b82f6",
  songCount: 0,
});

const GenreModal: React.FC<GenreModalProps> = ({ mode, genre, onClose, onSave }) => {
  const [form, setForm] = useState({ ...genre });
  const [imageUrl, setImageUrl] = useState(genre.image || "");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setImageUrl(url);
      setForm({ ...form, image: url });
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setForm({ ...form, image: url });
  };

  const handleSave = () => {
    if (!form.name) return;
    onSave({ ...form, image: imageUrl });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900 text-sm">
            {mode === "add" ? "เพิ่มหมวดหมู่ใหม่" : "แก้ไขหมวดหมู่"}
          </p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* รูปภาพ */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">รูปภาพ</label>

            {/* Preview */}
            {imageUrl && (
              <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-gray-100">
                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" onError={() => setImageUrl("")} />
                <button
                  onClick={() => { setImageUrl(""); setForm({ ...form, image: "" }); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
            )}

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-xs hover:border-gray-400 hover:text-gray-700 transition-colors mb-2"
            >
              <Upload size={13} />
              อัปโหลดรูปภาพ
            </button>

            {/* URL input */}
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
              <ImageIcon size={13} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="หรือวาง URL รูปภาพ"
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="flex-1 text-sm text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* ชื่อหมวดหมู่ */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">ชื่อหมวดหมู่ *</label>
            <input
              type="text"
              placeholder="เช่น Pop, Rock"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          {/* คำอธิบาย */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">คำอธิบาย</label>
            <input
              type="text"
              placeholder="คำอธิบายสั้นๆ"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          {/* สีประจำหมวดหมู่ */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">สีประจำหมวดหมู่</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                  style={{
                    backgroundColor: c,
                    outline: form.color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                >
                  {form.color === c && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {saved ? (
            <span className="text-xs text-green-600 font-medium">✓ บันทึกเรียบร้อยแล้ว</span>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium"
            >
              บันทึกหมวดหมู่
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteModalProps {
  genre: Genre;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ genre, onClose, onConfirm }) => (
  <div
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div className="px-6 py-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <p className="font-semibold text-gray-900 text-sm">ลบหมวดหมู่นี้?</p>
        <p className="text-gray-500 text-xs mt-1">
          "{genre.name}" และข้อมูลที่เกี่ยวข้องจะถูกลบออกจากระบบ
        </p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          ยกเลิก
        </button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">
          ลบหมวดหมู่
        </button>
      </div>
    </div>
  </div>
);

// ─── Genre Card ───────────────────────────────────────────────────────────────

interface GenreCardProps {
  genre: Genre;
  onEdit: (g: Genre) => void;
  onDelete: (g: Genre) => void;
}

const GenreCard: React.FC<GenreCardProps> = ({ genre, onEdit, onDelete }) => (
  <div className="bg-gray-800 rounded-xl overflow-hidden group relative">
    {/* Image */}
    <div className="relative h-32 overflow-hidden">
      {genre.image ? (
        <img
          src={genre.image}
          alt={genre.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: genre.color + "33" }}>
          <Music size={28} style={{ color: genre.color }} />
        </div>
      )}
      {/* Color accent overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: `linear-gradient(to top, ${genre.color}, transparent)` }}
      />
      {/* Actions overlay */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(genre)}
          className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(genre)}
          className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
      {/* Genre name on image */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
        <p className="text-white font-bold text-sm drop-shadow">{genre.name}</p>
      </div>
    </div>

    {/* Body */}
    <div className="px-3 py-2.5">
      <p className="text-gray-400 text-xs truncate">{genre.description || "—"}</p>
      <div className="flex items-center gap-1.5 mt-1.5">
        <Music size={11} className="text-gray-500" />
        <span className="text-gray-400 text-xs">{genre.songCount.toLocaleString()} เพลง</span>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const GenreManagementPage: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>(INITIAL_GENRES);
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editGenre, setEditGenre] = useState<Genre | null>(null);
  const [deleteGenre, setDeleteGenre] = useState<Genre | null>(null);

  const totalSongs = genres.reduce((sum, g) => sum + g.songCount, 0);

  const filtered = genres.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSave = (form: Partial<Genre> & { id?: number }) => {
    const newGenre: Genre = {
      id: Date.now(),
      name: form.name || "",
      description: form.description || "",
      image: form.image || "",
      color: form.color || "#3b82f6",
      songCount: form.songCount || 0,
    };
    setGenres((prev) => [newGenre, ...prev]);
  };

  const handleEditSave = (form: Partial<Genre> & { id?: number }) => {
    setGenres((prev) =>
      prev.map((g) => (g.id === form.id ? { ...g, ...form } as Genre : g))
    );
  };

  const handleDelete = () => {
    if (!deleteGenre) return;
    setGenres((prev) => prev.filter((g) => g.id !== deleteGenre.id));
    setDeleteGenre(null);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 bg-gray-500 p-6 space-y-5">
          <div className="flex-1 bg-gray-500 p-6 space-y-5">

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
              </div>
              <button
                onClick={() => setAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-950 transition-colors"
              >
                <Plus size={15} />
                เพิ่มหมวดหมู่
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="หมวดหมู่ทั้งหมด" value={genres.length} icon={<Music size={16} />} />
              <StatCard label="เพลงทั้งหมด" value={totalSongs} icon={<Music size={16} />} />
              <StatCard label="เฉลี่ยต่อหมวดหมู่" value={Math.round(totalSongs / (genres.length || 1))} icon={<Music size={16} />} />
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาหมวดหมู่..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-blacks placeholder-gray-500"
              />
            </div>

            {/* Genre Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((genre) => (
                <GenreCard
                  key={genre.id}
                  genre={genre}
                  onEdit={setEditGenre}
                  onDelete={setDeleteGenre}
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-500 text-sm">
                  ไม่พบหมวดหมู่ที่ตรงกับเงื่อนไข
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Add Modal */}
      {addModal && (
        <GenreModal
          mode="add"
          genre={emptyGenre()}
          onClose={() => setAddModal(false)}
          onSave={handleAddSave}
        />
      )}

      {/* Edit Modal */}
      {editGenre && (
        <GenreModal
          mode="edit"
          genre={editGenre}
          onClose={() => setEditGenre(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteGenre && (
        <DeleteModal
          genre={deleteGenre}
          onClose={() => setDeleteGenre(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default GenreManagementPage;