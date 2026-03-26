import React, { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Music, X } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useSongs } from "../../hooks/useSongs";
import type { Song } from "../../types/song";
import api from "../../api/axios";

const StatCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-gray-800 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-0">
    {icon && <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-300">{icon}</div>}
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-xl font-bold mt-0.5">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

const SongModal: React.FC<{ mode: "add" | "edit"; song: any; onClose: () => void; onSave: (data: any) => void }> = ({ mode, song, onClose, onSave }) => {
  const [form, setForm] = useState({ ...song });
  const [saved, setSaved] = useState(false);
  const [artists, setArtists] = useState<{ id: string; name: string }[]>([]);
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([]);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/artists"),
      api.get("/albums"),
      api.get("/genres"),
    ]).then(([artistsRes, albumsRes, genresRes]) => {
      setArtists(artistsRes.data.data);
      setAlbums(albumsRes.data.data);
      setGenres(genresRes.data.data);
    }).catch(() => {});
  }, []);

  const handleSave = () => {
    if (!form.title || !form.filePath || !form.artistId || !form.albumId || !form.genreId) return;
    onSave(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";
  const labelCls = "text-xs font-medium text-gray-500 mb-1.5 block";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <p className="font-semibold text-gray-900 text-sm">{mode === "add" ? "เพิ่มเพลงใหม่" : "แก้ไขเพลง"}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {/* ชื่อเพลง + File Path */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ชื่อเพลง *</label>
              <input type="text" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>File Path *</label>
              <input type="text" placeholder="songs/filename.mp3" value={form.filePath || ""} onChange={(e) => setForm({ ...form, filePath: e.target.value })} className={inputCls} />
            </div>
          </div>

          {/* ศิลปิน */}
          <div>
            <label className={labelCls}>ศิลปิน *</label>
            <select value={form.artistId || form.artist?.id || ""} onChange={(e) => setForm({ ...form, artistId: e.target.value })} className={inputCls}>
              <option value="">เลือกศิลปิน</option>
              {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* อัลบั้ม */}
          <div>
            <label className={labelCls}>อัลบั้ม *</label>
            <select value={form.albumId || form.album?.id || ""} onChange={(e) => setForm({ ...form, albumId: e.target.value })} className={inputCls}>
              <option value="">เลือกอัลบั้ม</option>
              {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>

          {/* หมวดหมู่ */}
          <div>
            <label className={labelCls}>หมวดหมู่ *</label>
            <select value={form.genreId || form.genre?.id || ""} onChange={(e) => setForm({ ...form, genreId: e.target.value })} className={inputCls}>
              <option value="">เลือกหมวดหมู่</option>
              {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          {/* ความยาว + ปี */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ความยาว (วินาที)</label>
              <input type="number" value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ปีที่ลงเพลง</label>
              <input type="number" value={form.year || new Date().getFullYear()} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>

          {/* เนื้อเพลง */}
          <div>
            <label className={labelCls}>เนื้อเพลง</label>
            <textarea value={form.lyrics || ""} onChange={(e) => setForm({ ...form, lyrics: e.target.value })} rows={3}
              placeholder="เนื้อเพลง (ถ้ามี)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          {saved ? <span className="text-xs text-green-600 font-medium">✓ บันทึกเรียบร้อยแล้ว</span> : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium">บันทึก</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteModal: React.FC<{ song: Song; onClose: () => void; onConfirm: () => void }> = ({ song, onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div className="px-6 py-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3"><Trash2 size={18} className="text-red-500" /></div>
        <p className="font-semibold text-gray-900 text-sm">ลบเพลงนี้?</p>
        <p className="text-gray-500 text-xs mt-1">"{song.title}" จะถูกลบออกจากระบบ</p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">ลบเพลง</button>
      </div>
    </div>
  </div>
);

const formatDuration = (sec?: number) => {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SongManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [deleteSong, setDeleteSong] = useState<Song | null>(null);
  const { songs, stats, loading, error, createSong, updateSong, deleteSong: deleteSongApi } = useSongs(search);

  const handleDelete = async () => { if (!deleteSong) return; await deleteSongApi(deleteSong.id); setDeleteSong(null); };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 bg-gray-500 p-6 space-y-5">
          <div className="flex-1 bg-gray-500 p-6 space-y-5">
            {error && <div className="bg-red-900 text-red-300 p-3 rounded-lg text-sm">{error}</div>}
            {loading && <div className="text-center py-4 text-gray-300 text-sm">กำลังโหลด...</div>}
            <div className="flex items-center justify-end">
              <button onClick={() => setAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-950 transition-colors">
                <Plus size={15} />เพิ่มเพลง
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="เพลงทั้งหมด" value={stats?.totalSongs ?? songs.length} icon={<Music size={16} />} />
              <StatCard label="เล่นทั้งหมด" value={stats?.totalPlays ?? 0} icon={<Music size={16} />} />
              <StatCard label="เฉลี่ยการเล่น" value={stats?.avgPlays ?? 0} icon={<Music size={16} />} />
              <StatCard label="หมวดหมู่" value={[...new Set(songs.map((s: Song) => s.genre?.name))].length} icon={<Music size={16} />} />
            </div>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="ค้นหาเพลง..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 transition-all" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left px-5 py-3 text-gray-400 font-medium text-xs">เพลง</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">อัลบั้ม</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">หมวดหมู่</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">ความยาว</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">ปี</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs">การเล่น</th>
                      <th className="text-center px-4 py-3 text-gray-400 font-medium text-xs">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {songs.map((song: Song) => (
                      <tr key={song.id} className="hover:bg-gray-700/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0"><Music size={14} className="text-gray-400" /></div>
                            <div>
                              <p className="font-medium text-white text-sm">{song.title}</p>
                              <p className="text-gray-400 text-xs mt-0.5">{song.artist?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-300 text-sm">{song.album?.title}</td>
                        <td className="px-4 py-3.5"><span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded-md text-xs">{song.genre?.name}</span></td>
                        <td className="px-4 py-3.5 text-gray-300 text-sm">{formatDuration(song.duration)}</td>
                        <td className="px-4 py-3.5 text-gray-300 text-sm">{song.year ?? "—"}</td>
                        <td className="px-4 py-3.5 text-right text-gray-300 text-sm font-medium">{song.playCount.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setEditSong(song)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteSong(song)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && songs.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-gray-500 text-sm">ไม่พบเพลง</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {addModal && <SongModal mode="add" song={{ title: "", filePath: "", artistId: "", albumId: "", genreId: "", duration: 0, year: new Date().getFullYear() }} onClose={() => setAddModal(false)} onSave={createSong} />}
      {editSong && <SongModal mode="edit" song={editSong} onClose={() => setEditSong(null)} onSave={(data) => { updateSong(data.id, data); setEditSong(null); }} />}
      {deleteSong && <DeleteModal song={deleteSong} onClose={() => setDeleteSong(null)} onConfirm={handleDelete} />}
    </div>
  );
};

export default SongManagementPage;