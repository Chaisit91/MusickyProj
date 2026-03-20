import React, { useState } from "react";
import { Search, Plus, Pencil, Trash2, Music, X } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────

type Genre = "ทั้งหมด" | "Pop" | "Rock" | "Electronic" | "Ambient" | "Jazz" | "Hip-Hop";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: string;
  year: number;
  plays: number;
  tags: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_SONGS: Song[] = [
  { id: 1, title: "Summer Vibes", artist: "The Waves", album: "Sunny Days", genre: "Pop", duration: "3:45", year: 2024, plays: 128000, tags: ["chill", "summer"] },
  { id: 2, title: "Midnight Drive", artist: "Urban Reels", album: "Night Riders", genre: "Electronic", duration: "4:12", year: 2025, plays: 95000, tags: ["night", "drive"] },
  { id: 3, title: "City Lights", artist: "Metro Sound", album: "Urban Life", genre: "Pop", duration: "3:28", year: 2024, plays: 87000, tags: ["city"] },
  { id: 4, title: "Ocean Waves", artist: "Nature Sounds", album: "Peaceful", genre: "Ambient", duration: "5:15", year: 2023, plays: 76000, tags: ["relax", "nature"] },
  { id: 5, title: "Mountain High", artist: "Adventure", album: "Heights", genre: "Rock", duration: "4:30", year: 2025, plays: 65000, tags: ["rock", "epic"] },
];

const GENRES: Genre[] = ["ทั้งหมด", "Pop", "Rock", "Electronic", "Ambient", "Jazz", "Hip-Hop"];

// ─── Empty Form ───────────────────────────────────────────────────────────────

const emptyForm = (): Omit<Song, "id"> => ({
  title: "",
  artist: "",
  album: "",
  genre: "",
  duration: "",
  year: new Date().getFullYear(),
  plays: 0,
  tags: [],
});

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

// ─── Song Modal ───────────────────────────────────────────────────────────────

interface SongModalProps {
  mode: "add" | "edit";
  song: Omit<Song, "id"> & { id?: number };
  onClose: () => void;
  onSave: (song: Omit<Song, "id"> & { id?: number }) => void;
}

const SongModal: React.FC<SongModalProps> = ({ mode, song, onClose, onSave }) => {
  const [form, setForm] = useState({ ...song });
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const handleSave = () => {
    if (!form.title || !form.artist) return;
    onSave(form);
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
            {mode === "add" ? "เพิ่มเพลงใหม่" : "แก้ไขเพลง"}
          </p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* ชื่อเพลง + ศิลปิน */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ชื่อเพลง *</label>
              <input
                type="text"
                placeholder="กรอกชื่อเพลง"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ศิลปิน *</label>
              <input
                type="text"
                placeholder="กรอกชื่อศิลปิน"
                value={form.artist}
                onChange={(e) => setForm({ ...form, artist: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* อัลบั้ม + ความยาว */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">อัลบั้ม</label>
              <input
                type="text"
                placeholder="กรอกชื่ออัลบั้ม"
                value={form.album}
                onChange={(e) => setForm({ ...form, album: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ความยาว</label>
              <input
                type="text"
                placeholder="3:45"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* ปีที่วางจำหน่าย + หมวดหมู่ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ปีที่วางจำหน่าย</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">หมวดหมู่</label>
              <select
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
              >
                <option value="">เลือกหมวดหมู่</option>
                {["Pop", "Rock", "Electronic", "Ambient", "Jazz", "Hip-Hop"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* แท็ก */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">แท็ก</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="พิมพ์แท็ก"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <button
                onClick={addTag}
                className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-gray-700">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {saved ? (
            <span className="text-xs text-green-600 font-medium">✓ บันทึกเรียบร้อยแล้ว</span>
          ) : <span />}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteModalProps {
  song: Song;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ song, onClose, onConfirm }) => (
  <div
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div className="px-6 py-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <p className="font-semibold text-gray-900 text-sm">ลบเพลงนี้?</p>
        <p className="text-gray-500 text-xs mt-1">
          "{song.title}" โดย {song.artist} จะถูกลบออกจากระบบ
        </p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          ยกเลิก
        </button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">
          ลบเพลง
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const SongManagementPage: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<Genre>("ทั้งหมด");

  const [addModal, setAddModal] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [deleteSong, setDeleteSong] = useState<Song | null>(null);

  const totalSongs = songs.length;
  const totalPlays = songs.reduce((sum, s) => sum + s.plays, 0);
  const uniqueGenres = [...new Set(songs.map((s) => s.genre))].length;
  const totalAlbums = [...new Set(songs.map((s) => s.album))].length;

  const filtered = songs.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q);
    const matchGenre = genreFilter === "ทั้งหมด" || s.genre === genreFilter;
    return matchSearch && matchGenre;
  });

  const genreCounts: Partial<Record<Genre, number>> = {};
  GENRES.forEach((g) => {
    genreCounts[g] = g === "ทั้งหมด" ? songs.length : songs.filter((s) => s.genre === g).length;
  });

  const handleAddSave = (form: Omit<Song, "id"> & { id?: number }) => {
    const newSong: Song = { ...form, id: Date.now() } as Song;
    setSongs((prev) => [newSong, ...prev]);
  };

  const handleEditSave = (form: Omit<Song, "id"> & { id?: number }) => {
    setSongs((prev) => prev.map((s) => (s.id === form.id ? (form as Song) : s)));
  };

  const handleDelete = () => {
    if (!deleteSong) return;
    setSongs((prev) => prev.filter((s) => s.id !== deleteSong.id));
    setDeleteSong(null);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 bg-gray-500 p-6 space-y-5">
          <div className="flex-1 bg-gray-500 p-6 space-y-5">

            {/* Page Header */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => setAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-950 transition-colors"
              >
                <Plus size={15} />
                เพิ่มเพลง
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="เพลงทั้งหมด" value={totalSongs} icon={<Music size={16} />} />
              <StatCard label="เล่นทั้งหมด" value={totalPlays} icon={<Music size={16} />} />
              <StatCard label="หมวดหมู่" value={uniqueGenres} icon={<Music size={16} />} />
              <StatCard label="อัลบั้มทั้งหมด" value={totalAlbums} icon={<Music size={16} />} />
            </div>

            {/* Table Card */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              {/* Toolbar */}
              <div className="px-5 py-4 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาเพลง..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-gray-900"
                  />
                </div>

                {/* Genre Filter */}
                <div className="flex gap-2 flex-wrap">
                  {GENRES.map((g) => {
                    const count = genreCounts[g] ?? 0;
                    if (g !== "ทั้งหมด" && count === 0) return null;
                    return (
                      <button
                        key={g}
                        onClick={() => setGenreFilter(g)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          genreFilter === g
                            ? "bg-white text-gray-900"
                            : "text-gray-400 hover:text-white hover:bg-gray-700"
                        }`}
                      >
                        {g} {count > 0 && `(${count})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left px-5 py-3 text-gray-400 font-medium text-xs tracking-wide">เพลง</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">อัลบั้ม</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">หมวดหมู่</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">ความยาว</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">ปี</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">การเล่น</th>
                      <th className="text-center px-4 py-3 text-gray-400 font-medium text-xs tracking-wide">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filtered.map((song) => (
                      <tr key={song.id} className="hover:bg-gray-700/40 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <Music size={14} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm">{song.title}</p>
                              <p className="text-gray-400 text-xs mt-0.5">{song.artist}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-300 text-sm">{song.album}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded-md text-xs">
                            {song.genre}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-300 text-sm">{song.duration}</td>
                        <td className="px-4 py-3.5 text-gray-300 text-sm">{song.year}</td>
                        <td className="px-4 py-3.5 text-right text-gray-300 text-sm font-medium">
                          {song.plays.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditSong(song)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteSong(song)}
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
                          ไม่พบเพลงที่ตรงกับเงื่อนไข
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

      {/* Add Modal */}
      {addModal && (
        <SongModal
          mode="add"
          song={emptyForm()}
          onClose={() => setAddModal(false)}
          onSave={(form) => { handleAddSave(form); }}
        />
      )}

      {/* Edit Modal */}
      {editSong && (
        <SongModal
          mode="edit"
          song={editSong}
          onClose={() => setEditSong(null)}
          onSave={(form) => { handleEditSave(form); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteSong && (
        <DeleteModal
          song={deleteSong}
          onClose={() => setDeleteSong(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default SongManagementPage;