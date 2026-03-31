import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Music, X, Upload, Link, ImagePlus, Loader2 } from "lucide-react";
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

type AudioTab = "upload" | "url";

const SongModal: React.FC<{
  mode: "add" | "edit";
  song: Song | null;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
}> = ({ mode, song, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: song?.title || "",
    artistId: song?.artistId || song?.artist?.id || "",
    albumId: song?.albumId || song?.album?.id || "",
    genreId: song?.genreId || song?.genre?.id || "",
    duration: song?.duration ?? "",
    year: song?.year ?? new Date().getFullYear(),
    lyrics: song?.lyrics || "",
  });

  // Audio source tabs
  const [audioTab, setAudioTab] = useState<AudioTab>(song?.filePath ? "url" : "upload");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState(song?.filePath || "");

  // Cover image
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(song?.coverUrl || null);
  const [deleteCover, setDeleteCover] = useState(false);

  const [artists, setArtists] = useState<{ id: string; name: string }[]>([]);
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([]);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);

  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      api.get("/artists"),
      api.get("/albums"),
      api.get("/genres"),
    ]).then(([aRes, alRes, gRes]) => {
      setArtists(aRes.data.data);
      setAlbums(alRes.data.data);
      setGenres(gRes.data.data);
    }).catch(() => {});
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    // Auto-detect duration from the selected MP3
    const audio = new window.Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      setForm((prev) => ({ ...prev, duration: String(Math.round(audio.duration)) }));
      URL.revokeObjectURL(audio.src);
    };
  };

  const handleSave = async () => {
    setError(null);
    if (!form.title || !form.artistId || !form.albumId || !form.genreId) {
      setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบ (ชื่อเพลง, ศิลปิน, อัลบั้ม, หมวดหมู่)");
      return;
    }
    if (mode === "add") {
      if (audioTab === "upload" && !audioFile) { setError("กรุณาเลือกไฟล์ MP3"); return; }
      if (audioTab === "url" && !filePath.trim()) { setError("กรุณากรอก URL เพลง"); return; }
    }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("artistId", form.artistId);
    fd.append("albumId", form.albumId);
    fd.append("genreId", form.genreId);
    if (form.duration) fd.append("duration", String(form.duration));
    if (form.year) fd.append("year", String(form.year));
    if (form.lyrics) fd.append("lyrics", form.lyrics);

    if (audioTab === "upload" && audioFile) fd.append("audioFile", audioFile);
    else if (audioTab === "url" && filePath.trim()) fd.append("filePath", filePath.trim());

    if (coverFile) fd.append("coverImage", coverFile);
    if (deleteCover) fd.append("deleteCover", "true");

    setUploading(true);
    try {
      await onSave(fd);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
    } catch (e: any) {
      setError(e.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setUploading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";
  const labelCls = "text-xs font-medium text-gray-500 mb-1.5 block";
  const tabBtn = (tab: AudioTab, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => setAudioTab(tab)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${audioTab === tab ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}
    >
      {icon}{label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => { if (!uploading && e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <p className="font-semibold text-gray-900 text-sm">{mode === "add" ? "เพิ่มเพลงใหม่" : "แก้ไขเพลง"}</p>
          <button onClick={onClose} disabled={uploading} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-40"><X size={16} /></button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

          {/* Cover Image Upload */}
          <div>
            <label className={labelCls}>รูปปกเพลง</label>
            <div
              onClick={() => !uploading && coverInputRef.current?.click()}
              className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all overflow-hidden group"
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-medium flex items-center gap-1"><ImagePlus size={14} /> เปลี่ยนรูป</p>
                  </div>
                  {mode === "edit" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverPreview(null);
                        setCoverFile(null);
                        setDeleteCover(true);
                      }}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-colors"
                      title="ลบรูปปก"
                    >
                      <X size={12} />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImagePlus size={28} strokeWidth={1.5} />
                  <p className="text-xs">คลิกเพื่ออัปโหลดรูปปกเพลง</p>
                  <p className="text-xs text-gray-300">JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
          </div>

          {/* ชื่อเพลง */}
          <div>
            <label className={labelCls}>ชื่อเพลง *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="ชื่อเพลง" />
          </div>

          {/* Audio Source */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls + " mb-0"}>ไฟล์เสียง {mode === "add" ? "*" : ""}</label>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {tabBtn("upload", <Upload size={12} />, "อัปโหลด MP3")}
                {tabBtn("url", <Link size={12} />, "URL")}
              </div>
            </div>

            {audioTab === "upload" && (
              <div
                onClick={() => !uploading && audioInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-5 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
              >
                {audioFile ? (
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Music size={16} className="text-blue-600" /></div>
                    <div>
                      <p className="text-xs font-medium">{audioFile.name}</p>
                      <p className="text-xs text-gray-400">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setAudioFile(null); }} className="ml-2 text-gray-400 hover:text-red-500"><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <Upload size={24} strokeWidth={1.5} className="text-gray-300" />
                    <p className="text-xs text-gray-400">คลิกเพื่อเลือกไฟล์ MP3</p>
                    <p className="text-xs text-gray-300">ขนาดสูงสุด 50 MB</p>
                  </>
                )}
              </div>
            )}

            {audioTab === "url" && (
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="https://... หรือ songs/filename.mp3"
                className={inputCls}
              />
            )}

            <input ref={audioInputRef} type="file" accept="audio/mpeg,audio/mp3,.mp3" className="hidden" onChange={handleAudioChange} />
          </div>

          {/* ศิลปิน */}
          <div>
            <label className={labelCls}>ศิลปิน *</label>
            <select value={form.artistId} onChange={(e) => setForm({ ...form, artistId: e.target.value })} className={inputCls}>
              <option value="">เลือกศิลปิน</option>
              {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* อัลบั้ม */}
          <div>
            <label className={labelCls}>อัลบั้ม *</label>
            <select value={form.albumId} onChange={(e) => setForm({ ...form, albumId: e.target.value })} className={inputCls}>
              <option value="">เลือกอัลบั้ม</option>
              {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>

          {/* หมวดหมู่ */}
          <div>
            <label className={labelCls}>หมวดหมู่ *</label>
            <select value={form.genreId} onChange={(e) => setForm({ ...form, genreId: e.target.value })} className={inputCls}>
              <option value="">เลือกหมวดหมู่</option>
              {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          {/* ความยาว + ปี */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-xs font-medium text-gray-500">ความยาว (วินาที)</label>
                {audioFile && form.duration && (
                  <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">ตรวจจับอัตโนมัติ</span>
                )}
              </div>
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputCls} placeholder="210" />
            </div>
            <div>
              <label className={labelCls}>ปีที่ลงเพลง</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>

          {/* เนื้อเพลง */}
          <div>
            <label className={labelCls}>เนื้อเพลง</label>
            <textarea value={form.lyrics} onChange={(e) => setForm({ ...form, lyrics: e.target.value })} rows={3}
              placeholder="เนื้อเพลง (ถ้ามี)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          {saved
            ? <span className="text-xs text-green-600 font-medium">✓ บันทึกเรียบร้อยแล้ว</span>
            : uploading
              ? <span className="text-xs text-blue-500 flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" />กำลังอัปโหลด...</span>
              : <span />
          }
          <div className="flex gap-2">
            <button onClick={onClose} disabled={uploading} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40">ยกเลิก</button>
            <button onClick={handleSave} disabled={uploading || saved} className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-1.5">
              {uploading && <Loader2 size={13} className="animate-spin" />}บันทึก
            </button>
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
                            {/* Thumbnail — แสดงรูปปกถ้ามี */}
                            <div className="w-9 h-9 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {song.coverUrl
                                ? <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                                : <Music size={14} className="text-gray-400" />
                              }
                            </div>
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

      {addModal && (
        <SongModal
          mode="add"
          song={null}
          onClose={() => setAddModal(false)}
          onSave={async (fd) => { await createSong(fd); }}
        />
      )}
      {editSong && (
        <SongModal
          mode="edit"
          song={editSong}
          onClose={() => setEditSong(null)}
          onSave={async (fd) => { await updateSong(editSong.id, fd); }}
        />
      )}
      {deleteSong && (
        <DeleteModal song={deleteSong} onClose={() => setDeleteSong(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
};

export default SongManagementPage;
