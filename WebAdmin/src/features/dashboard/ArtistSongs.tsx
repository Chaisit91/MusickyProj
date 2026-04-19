// หน้ารายการเพลงของศิลปิน — แสดงเพลงทั้งหมดของ artistId จาก URL params, preview เพลงด้วย MiniPlayer | ใช้ useSongs + useAudioPlayer
//
// หลักการทำงาน:
// 1. รับ artistId จาก URL params → GET /songs?artistId= → แสดงเพลงของศิลปินนั้น
// 2. ปุ่ม back กลับไปหน้า ArtistManagement
// 3. สามารถลบเพลงออกจาก artist ได้โดยตรง

import React, { useState, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search, Plus, Pencil, Trash2, Music, X,
  Upload, Link, ImagePlus, Loader2, ChevronLeft, Play, Pause, Sparkles,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useSongs } from "../../hooks/useSongs";
import type { Song } from "../../types/song";
import api from "../../api/axios";
import { StatCard, ConfirmDeleteModal, MiniPlayer } from "../../components/common";
import { formatDuration } from "../../utils/format";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { songSchema, type SongFormValues } from "../../schema/adminSchema";

type AudioTab = "upload" | "url";

// ── Song Modal ────────────────────────────────────────────────────────────────
const SongModal: React.FC<{
  mode: "add" | "edit";
  song: Song | null;
  defaultArtistId: string;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
}> = ({ mode, song, defaultArtistId, onClose, onSave }) => {
  const [audioTab, setAudioTab] = useState<AudioTab>(song?.filePath ? "url" : "upload");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(song?.coverUrl || null);
  const [deleteCover, setDeleteCover] = useState(false);
  const [artists, setArtists] = useState<{ id: string; name: string }[]>([]);
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingLyrics, setFetchingLyrics] = useState(false);
  const [lyricsMsg, setLyricsMsg] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: song?.title || "",
      artistId: song?.artistId || song?.artist?.id || defaultArtistId,
      albumId: song?.albumId || song?.album?.id || "",
      genreId: song?.genreId || song?.genre?.id || "",
      duration: song?.duration ? String(song.duration) : "",
      year: song?.year ?? new Date().getFullYear(),
      lyrics: song?.lyrics || "",
      filePath: song?.filePath || "",
    },
  });

  const watchedArtistId = useWatch({ control, name: "artistId" });
  const watchedTitle = useWatch({ control, name: "title" });

  // โหลด artists + genres ครั้งเดียว
  useEffect(() => {
    Promise.all([api.get("/artists"), api.get("/genres")])
      .then(([aRes, gRes]) => {
        setArtists(aRes.data.data);
        setGenres(gRes.data.data);
      })
      .catch(() => {});
  }, []);

  // โหลด albums เมื่อ artistId เปลี่ยน (useWatch)
  useEffect(() => {
    if (!watchedArtistId) { setAlbums([]); return; }
    setAlbumsLoading(true);
    api.get(`/albums/artist/${watchedArtistId}`)
      .then((res) => setAlbums(res.data.data ?? []))
      .catch(() => setAlbums([]))
      .finally(() => setAlbumsLoading(false));
  }, [watchedArtistId]);

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
    const audio = new window.Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      setValue("duration", String(Math.round(audio.duration)));
      URL.revokeObjectURL(audio.src);
    };
  };

  const fetchLyrics = async () => {
    const artistName = artists.find((a) => a.id === watchedArtistId)?.name ?? "";
    if (!watchedTitle || !artistName) {
      setLyricsMsg("กรุณากรอกชื่อเพลงและเลือกศิลปินก่อน");
      setTimeout(() => setLyricsMsg(null), 3000);
      return;
    }
    setFetchingLyrics(true);
    setLyricsMsg(null);
    try {
      const params = new URLSearchParams({ track_name: watchedTitle, artist_name: artistName });
      const res = await fetch(`https://lrclib.net/api/search?${params}`);
      const data = await res.json();
      const hit = data.find((d: any) => d.syncedLyrics) ?? data[0];
      if (hit?.syncedLyrics) {
        setValue("lyrics", hit.syncedLyrics);
        setLyricsMsg("✓ พบเนื้อเพลง (LRC) เรียบร้อย");
      } else if (hit?.plainLyrics) {
        setValue("lyrics", hit.plainLyrics);
        setLyricsMsg("⚠ พบเนื้อเพลงแบบ plain text (ไม่มี timestamps)");
      } else {
        setLyricsMsg("ไม่พบเนื้อเพลงใน lrclib.net");
      }
    } catch {
      setLyricsMsg("เชื่อมต่อ lrclib.net ไม่ได้");
    } finally {
      setFetchingLyrics(false);
      setTimeout(() => setLyricsMsg(null), 4000);
    }
  };

  const onSubmit = async (data: SongFormValues) => {
    setError(null);
    if (mode === "add") {
      if (audioTab === "upload" && !audioFile) { setError("กรุณาเลือกไฟล์ MP3"); return; }
      if (audioTab === "url" && !data.filePath?.trim()) { setError("กรุณากรอก URL เพลง"); return; }
    }

    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("artistId", data.artistId);
    fd.append("albumId", data.albumId);
    fd.append("genreId", data.genreId);
    if (data.duration) fd.append("duration", data.duration);
    if (data.year) fd.append("year", String(data.year));
    if (data.lyrics) fd.append("lyrics", data.lyrics);
    if (audioTab === "upload" && audioFile) fd.append("audioFile", audioFile);
    else if (audioTab === "url" && data.filePath?.trim()) fd.append("filePath", data.filePath.trim());
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

  const inputCls = (hasErr?: boolean) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all bg-white ${hasErr ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-400"}`;
  const labelCls = "text-xs font-medium text-gray-500 mb-1.5 block";
  const tabBtn = (tab: AudioTab, icon: React.ReactNode, label: string) => (
    <button type="button" onClick={() => setAudioTab(tab)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${audioTab === tab ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
      {icon}{label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (!uploading && e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <p className="font-semibold text-gray-900 text-sm">{mode === "add" ? "เพิ่มเพลงใหม่" : "แก้ไขเพลง"}</p>
          <button type="button" onClick={onClose} disabled={uploading} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-40"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

            {/* Cover Image */}
            <div>
              <label className={labelCls}>รูปปกเพลง</label>
              <div onClick={() => !uploading && coverInputRef.current?.click()}
                className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all overflow-hidden group">
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-xs font-medium flex items-center gap-1"><ImagePlus size={14} /> เปลี่ยนรูป</p>
                    </div>
                    {mode === "edit" && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setCoverPreview(null); setCoverFile(null); setDeleteCover(true); }}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-colors">
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
              <input type="text" placeholder="ชื่อเพลง" {...register("title")} className={inputCls(!!errors.title)} />
              {errors.title && <p className="text-red-500 text-xs mt-1">⚠ {errors.title.message}</p>}
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
                <div onClick={() => !uploading && audioInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-5 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
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
                <input type="text" placeholder="https://... หรือ songs/filename.mp3"
                  {...register("filePath")} className={inputCls()} />
              )}
              <input ref={audioInputRef} type="file" accept="audio/mpeg,audio/mp3,.mp3" className="hidden" onChange={handleAudioChange} />
            </div>

            {/* ศิลปิน */}
            <div>
              <label className={labelCls}>ศิลปิน *</label>
              {mode === "add" && defaultArtistId ? (
                <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 flex items-center gap-2">
                  <span className="text-gray-400">🎤</span>
                  <span className="font-medium">{artists.find(a => a.id === defaultArtistId)?.name ?? "กำลังโหลด..."}</span>
                  <span className="ml-auto text-xs text-gray-400">ศิลปินที่เลือก</span>
                </div>
              ) : (
                <select {...register("artistId", { onChange: () => setValue("albumId", "") })}
                  className={inputCls(!!errors.artistId)}>
                  <option value="">เลือกศิลปิน</option>
                  {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              )}
              {errors.artistId && <p className="text-red-500 text-xs mt-1">⚠ {errors.artistId.message}</p>}
            </div>

            {/* อัลบั้ม */}
            <div>
              <label className={labelCls}>อัลบั้ม *</label>
              <select {...register("albumId")} className={inputCls(!!errors.albumId)} disabled={!watchedArtistId || albumsLoading}>
                {!watchedArtistId ? (
                  <option value="">— เลือกศิลปินก่อน —</option>
                ) : albumsLoading ? (
                  <option value="">กำลังโหลด...</option>
                ) : albums.length === 0 ? (
                  <option value="">ไม่มีอัลบั้มของศิลปินนี้</option>
                ) : (
                  <>
                    <option value="">เลือกอัลบั้ม</option>
                    {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </>
                )}
              </select>
              {errors.albumId && <p className="text-red-500 text-xs mt-1">⚠ {errors.albumId.message}</p>}
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className={labelCls}>หมวดหมู่ *</label>
              <select {...register("genreId")} className={inputCls(!!errors.genreId)}>
                <option value="">เลือกหมวดหมู่</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              {errors.genreId && <p className="text-red-500 text-xs mt-1">⚠ {errors.genreId.message}</p>}
            </div>

            {/* ปี */}
            <div>
              <label className={labelCls}>ปีที่ลงเพลง</label>
              <input type="number" {...register("year", { valueAsNumber: true })} className={inputCls()} />
            </div>

            {/* เนื้อเพลง */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls + " mb-0"}>เนื้อเพลง</label>
                <button
                  type="button"
                  onClick={fetchLyrics}
                  disabled={fetchingLyrics}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors disabled:opacity-50"
                >
                  {fetchingLyrics
                    ? <><Loader2 size={11} className="animate-spin" />กำลังดึง...</>
                    : <><Sparkles size={11} />ดึงเนื้อเพลง</>}
                </button>
              </div>
              {lyricsMsg && (
                <p className={`text-xs mb-1.5 px-2 py-1 rounded ${lyricsMsg.startsWith("✓") ? "bg-green-50 text-green-600" : lyricsMsg.startsWith("⚠") ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"}`}>
                  {lyricsMsg}
                </p>
              )}
              <textarea {...register("lyrics")} rows={3} placeholder="เนื้อเพลง (ถ้ามี)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" />
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
            {saved
              ? <span className="text-xs text-green-600 font-medium">✓ บันทึกเรียบร้อยแล้ว</span>
              : uploading
                ? <span className="text-xs text-blue-500 flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" />กำลังอัปโหลด...</span>
                : <span />
            }
            <div className="flex gap-2">
              <button type="button" onClick={onClose} disabled={uploading} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40">ยกเลิก</button>
              <button type="submit" disabled={uploading || saved} className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-1.5">
                {uploading && <Loader2 size={13} className="animate-spin" />}บันทึก
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Artist Songs Page ─────────────────────────────────────────────────────────
const ArtistSongsPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();

  const [artist, setArtist] = useState<{ id: string; name: string; imageUrl?: string } | null>(null);
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [deleteSong, setDeleteSong] = useState<Song | null>(null);

  const { songs, stats, loading, error, createSong, updateSong, deleteSong: deleteSongApi } = useSongs(search, undefined, artistId);
  const { current, isPlaying, progress, duration, volume, play, stop, seek, setVolume } = useAudioPlayer();

  useEffect(() => {
    if (!artistId) return;
    api.get(`/artists/${artistId}`)
      .then((res) => setArtist(res.data.data))
      .catch(() => {});
  }, [artistId]);

  const handleDelete = async () => {
    if (!deleteSong) return;
    await deleteSongApi(deleteSong.id);
    setDeleteSong(null);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 bg-gray-500 p-6 space-y-5">
          <div className="flex-1 bg-gray-500 p-6 space-y-5">
            {error && <div className="bg-red-900 text-red-300 p-3 rounded-lg text-sm">{error}</div>}

            {/* Header */}
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/songs")}
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-sm">
                <ChevronLeft size={18} />
                <span>ศิลปินทั้งหมด</span>
              </button>
            </div>

            {/* Artist Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 ring-2 ring-gray-600 flex-shrink-0">
                {artist?.imageUrl ? (
                  <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music size={24} className="text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-white text-xl font-bold">{artist?.name ?? "..."}</h1>
                <p className="text-gray-400 text-sm">{songs.length} เพลง</p>
              </div>
              <button onClick={() => setAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-950 transition-colors">
                <Plus size={15} />เพิ่มเพลง
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="เพลงทั้งหมด" value={songs.length} icon={<Music size={16} />} />
              <StatCard label="เล่นทั้งหมด" value={songs.reduce((s, x) => s + x.playCount, 0)} icon={<Music size={16} />} />
              <StatCard label="เฉลี่ยการเล่น" value={songs.length ? Math.round(songs.reduce((s, x) => s + x.playCount, 0) / songs.length) : 0} icon={<Music size={16} />} />
              <StatCard label="หมวดหมู่" value={new Set(songs.map((s: Song) => s.genre?.name)).size} icon={<Music size={16} />} />
            </div>

            {/* Table */}
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
                    {loading && (
                      <tr><td colSpan={7} className="text-center py-12 text-gray-500 text-sm">กำลังโหลด...</td></tr>
                    )}
                    {!loading && songs.map((song: Song) => {
                      const isThisPlaying = current?.id === song.id && isPlaying;
                      return (
                      <tr key={song.id} className={`hover:bg-gray-700/40 transition-colors ${current?.id === song.id ? "bg-green-900/20" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="relative w-9 h-9 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer group/cover"
                              onClick={() => play({ id: song.id, title: song.title, coverUrl: song.coverUrl, filePath: song.filePath })}>
                              {song.coverUrl
                                ? <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                                : <Music size={14} className="text-gray-400" />}
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
                                {isThisPlaying ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white ml-0.5" />}
                              </div>
                            </div>
                            <p className={`font-medium text-sm ${current?.id === song.id ? "text-green-400" : "text-white"}`}>{song.title}</p>
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
                    );})}
                    {!loading && songs.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-gray-500 text-sm">ยังไม่มีเพลง</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Player — fixed bottom */}
      {current && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
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
        </div>
      )}

      {addModal && (
        <SongModal mode="add" song={null} defaultArtistId={artistId!}
          onClose={() => setAddModal(false)}
          onSave={async (fd) => { await createSong(fd); }} />
      )}
      {editSong && (
        <SongModal mode="edit" song={editSong} defaultArtistId={artistId!}
          onClose={() => setEditSong(null)}
          onSave={async (fd) => { await updateSong(editSong.id, fd); }} />
      )}
      {deleteSong && (
        <ConfirmDeleteModal title="เพลง" onClose={() => setDeleteSong(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
};

export default ArtistSongsPage;
