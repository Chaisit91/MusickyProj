import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Plus, Pencil, Trash2, Music, X, Upload, ImageIcon, Play, Pause } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useGenres } from "../../hooks/useGenres";
import { genreSchema, type GenreFormValues } from "../../schema/adminSchema";
import api from "../../api/axios";
import { MiniPlayer } from "../../components/common";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { formatDuration } from "../../utils/format";

interface Genre {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  _count?: { songs: number };
}

const COLOR_PALETTE = ["#ef4444","#f97316","#eab308","#84cc16","#22c55e","#14b8a6","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#64748b","#374151"];

const StatCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-gray-800 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-0">
    {icon && <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-300">{icon}</div>}
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-xl font-bold mt-0.5">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

const GenreModal: React.FC<{
  mode: "add" | "edit";
  genre: Partial<Genre>;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string;
    color?: string;
    imageUrl?: string;
    imageFile?: File;
    removeImage?: boolean;
  }) => Promise<void>;
}> = ({ mode, genre, onClose, onSave }) => {
  const [imagePreview, setImagePreview] = useState(genre.imageUrl || "");
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState(genre.color || "#3b82f6");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenreFormValues>({
    resolver: zodResolver(genreSchema),
    defaultValues: { name: genre.name || "", description: genre.description || "", color: genre.color || "#3b82f6", imageUrl: "" },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(undefined);
    setRemoveImage(true);
  };

  const onSubmit = async (data: GenreFormValues) => {
    setSaving(true);
    try {
      await onSave({
        name: data.name,
        description: data.description,
        color: selectedColor,
        imageUrl: imageFile || removeImage ? undefined : (imagePreview || undefined),
        imageFile,
        removeImage,
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
          <p className="font-semibold text-gray-900 text-sm">{mode === "add" ? "เพิ่มหมวดหมู่ใหม่" : "แก้ไขหมวดหมู่"}</p>
          <button type="button" onClick={onClose} disabled={saving} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">รูปภาพ</label>
              {imagePreview && (
                <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-gray-100">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" onError={handleRemoveImage} />
                  <button type="button" onClick={handleRemoveImage}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                    <X size={10} />
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-xs hover:border-gray-400 hover:text-gray-700 transition-colors mb-2 disabled:opacity-50">
                <Upload size={13} />อัปโหลดรูปภาพ
              </button>
              {!imageFile && !removeImage && (
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
                  <ImageIcon size={13} className="text-gray-400 flex-shrink-0" />
                  <input type="text" placeholder="หรือวาง URL รูปภาพ" value={imagePreview}
                    onChange={(e) => { setImagePreview(e.target.value); setRemoveImage(false); }}
                    className="flex-1 text-sm text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent" />
                </div>
              )}
              {imageFile && <p className="text-xs text-blue-500 mt-1">✓ เลือกไฟล์: {imageFile.name}</p>}
              {removeImage && !imageFile && <p className="text-xs text-red-400 mt-1">✕ จะลบรูปภาพออก</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ชื่อหมวดหมู่ *</label>
              <input type="text" placeholder="เช่น Pop, Rock"
                {...register("name")}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${errors.name ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-400"}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">⚠ {errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">คำอธิบาย</label>
              <input type="text" placeholder="คำอธิบายสั้นๆ"
                {...register("description")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">สีประจำหมวดหมู่</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button type="button" key={c} onClick={() => setSelectedColor(c)}
                    className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                    style={{ backgroundColor: c, outline: selectedColor === c ? `3px solid ${c}` : "none", outlineOffset: "2px" }}>
                    {selectedColor === c && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                ))}
              </div>
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
              ) : "บันทึกหมวดหมู่"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal: React.FC<{ genre: Genre; onClose: () => void; onConfirm: () => void }> = ({ genre, onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div className="px-6 py-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3"><Trash2 size={18} className="text-red-500" /></div>
        <p className="font-semibold text-gray-900 text-sm">ลบหมวดหมู่นี้?</p>
        <p className="text-gray-500 text-xs mt-1">"{genre.name}" และเพลงที่เกี่ยวข้องจะถูกลบออกจากระบบ</p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">ลบหมวดหมู่</button>
      </div>
    </div>
  </div>
);

interface GenreSong {
  id: string;
  title: string;
  filePath: string;
  coverUrl?: string;
  duration?: number;
  playCount: number;
  artist?: { name: string };
  album?: { title: string };
}

const GenreSongsModal: React.FC<{ genre: Genre; onClose: () => void }> = ({ genre, onClose }) => {
  const [songs, setSongs] = React.useState<GenreSong[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { current, isPlaying, progress, duration, volume, play, stop, seek, setVolume } = useAudioPlayer();

  React.useEffect(() => {
    api.get(`/admin/songs?genreId=${genre.id}&limit=200`)
      .then((res) => setSongs(res.data.data ?? []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, [genre.id]);

  const handleClose = () => { stop(); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: (genre.color || "#3b82f6") + "33" }}>
            {genre.imageUrl
              ? <img src={genre.imageUrl} alt={genre.name} className="w-full h-full object-cover" />
              : <Music size={20} style={{ color: genre.color || "#3b82f6" }} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{genre.name}</p>
            <p className="text-gray-400 text-xs">{genre._count?.songs ?? 0} เพลง</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
        </div>

        {/* Song list */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">กำลังโหลด...</div>
          ) : songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Music size={32} className="mb-2 opacity-40" />
              <p className="text-sm">ยังไม่มีเพลงในหมวดหมู่นี้</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400">#</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400">ชื่อเพลง</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-400">ศิลปิน</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-400">ความยาว</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-400">ยอดเล่น</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song, idx) => {
                  const isThisPlaying = current?.id === song.id && isPlaying;
                  const hasAudio = !!song.filePath;
                  return (
                    <tr key={song.id}
                      className={`border-b border-gray-50 transition-colors ${hasAudio ? "cursor-pointer hover:bg-gray-50" : ""} ${current?.id === song.id ? "bg-green-50" : ""}`}
                      onClick={() => hasAudio && play({ id: song.id, title: song.title, coverUrl: song.coverUrl, filePath: song.filePath })}>
                      <td className="px-5 py-3 text-gray-400 text-sm w-8">
                        {current?.id === song.id
                          ? (isThisPlaying ? <Pause size={13} className="text-green-500" /> : <Play size={13} className="text-green-500" />)
                          : <span>{idx + 1}</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0 group/cover">
                            {song.coverUrl
                              ? <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Music size={12} className="text-gray-400" /></div>
                            }
                            {hasAudio && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
                                {isThisPlaying ? <Pause size={10} className="text-white" /> : <Play size={10} className="text-white ml-0.5" />}
                              </div>
                            )}
                          </div>
                          <span className={`text-sm font-medium truncate max-w-[150px] ${current?.id === song.id ? "text-green-600" : "text-gray-900"}`}>{song.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-400 truncate max-w-[100px]">{song.artist?.name || "—"}</td>
                      <td className="px-5 py-3 text-sm text-gray-500 text-right">{formatDuration(song.duration)}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 text-right">{song.playCount.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-gray-100 text-xs text-gray-400">
          {songs.length} เพลง
        </div>

        {current && (
          <MiniPlayer
            current={current}
            isPlaying={isPlaying}
            progress={progress}
            duration={duration}
            volume={volume}
            onToggle={() => play(current)}
            onStop={stop}
            onSeek={seek}
            onVolumeChange={setVolume}
          />
        )}
      </div>
    </div>
  );
};

const GenreCard: React.FC<{ genre: Genre; onEdit: (g: Genre) => void; onDelete: (g: Genre) => void; onViewSongs: (g: Genre) => void }> = ({ genre, onEdit, onDelete, onViewSongs }) => (
  <div className="bg-gray-800 rounded-xl overflow-hidden group relative cursor-pointer" onClick={() => onViewSongs(genre)}>
    <div className="relative h-32 overflow-hidden">
      {genre.imageUrl ? (
        <img src={genre.imageUrl} alt={genre.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: (genre.color || "#3b82f6") + "33" }}>
          <Music size={28} style={{ color: genre.color || "#3b82f6" }} />
        </div>
      )}
      <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(to top, ${genre.color || "#3b82f6"}, transparent)` }} />
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onEdit(genre)} className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"><Pencil size={13} /></button>
        <button onClick={() => onDelete(genre)} className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"><Trash2 size={13} /></button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
        <p className="text-white font-bold text-sm drop-shadow">{genre.name}</p>
      </div>
    </div>
    <div className="px-3 py-2.5">
      <p className="text-gray-400 text-xs truncate">{genre.description || "—"}</p>
      <div className="flex items-center gap-1.5 mt-1.5">
        <Music size={11} className="text-gray-500" />
        <span className="text-gray-400 text-xs">{(genre._count?.songs ?? 0).toLocaleString()} เพลง</span>
      </div>
    </div>
  </div>
);

const GenreManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editGenre, setEditGenre] = useState<Genre | null>(null);
  const [deleteGenre, setDeleteGenre] = useState<Genre | null>(null);
  const [viewSongsGenre, setViewSongsGenre] = useState<Genre | null>(null);
  const { genres, stats, loading, error, createGenre, updateGenre, deleteGenre: deleteGenreApi } = useGenres();

  const filtered = genres.filter((g: Genre) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteGenre) return;
    await deleteGenreApi(deleteGenre.id);
    setDeleteGenre(null);
  };

  const handleEditSave = async (data: any) => {
    if (!editGenre) return;
    await updateGenre(editGenre.id, data);
    setEditGenre(null);
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
              <div />
              <button onClick={() => setAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-950 transition-colors">
                <Plus size={15} />เพิ่มหมวดหมู่
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="หมวดหมู่ทั้งหมด" value={stats?.totalGenres ?? genres.length} icon={<Music size={16} />} />
              <StatCard label="เพลงทั้งหมด" value={stats?.totalSongs ?? 0} icon={<Music size={16} />} />
              <StatCard label="เฉลี่ยต่อหมวดหมู่" value={stats?.avgSongsPerGenre ?? 0} icon={<Music size={16} />} />
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="ค้นหาหมวดหมู่..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-500" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((genre: Genre) => (
                <GenreCard key={genre.id} genre={genre} onEdit={setEditGenre} onDelete={setDeleteGenre} onViewSongs={setViewSongsGenre} />
              ))}
              {!loading && filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-500 text-sm">ไม่พบหมวดหมู่</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {addModal && (
        <GenreModal
          mode="add"
          genre={{ color: "#3b82f6" }}
          onClose={() => setAddModal(false)}
          onSave={createGenre}
        />
      )}
      {editGenre && (
        <GenreModal
          mode="edit"
          genre={editGenre}
          onClose={() => setEditGenre(null)}
          onSave={handleEditSave}
        />
      )}
      {deleteGenre && (
        <DeleteModal
          genre={deleteGenre}
          onClose={() => setDeleteGenre(null)}
          onConfirm={handleDelete}
        />
      )}
      {viewSongsGenre && (
        <GenreSongsModal genre={viewSongsGenre} onClose={() => setViewSongsGenre(null)} />
      )}
    </div>
  );
};

export default GenreManagementPage;