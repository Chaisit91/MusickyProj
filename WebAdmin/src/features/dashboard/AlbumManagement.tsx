import React, { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { albumSchema, type AlbumFormValues } from "../../schema/adminSchema";
import {
  Search, Plus, Pencil, Trash2, Disc, X, Upload, ImageIcon,
  ChevronDown, ChevronRight, Music, User, PlayCircle,
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useAlbums } from "../../hooks/useAlbums";
import { useArtists } from "../../hooks/useArtists";
import { getAlbumByIdApi } from "../../api/albumApi";
import type { Album, AlbumSong } from "../../types/album";
import { StatCard, ConfirmDeleteModal } from "../../components/common";
import { toDateInputValue, formatDuration } from "../../utils/format";

interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
}

// ---- Album Modal (Add / Edit) ----
const AlbumModal: React.FC<{
  mode: "add" | "edit";
  album: Partial<Album>;
  artists: Artist[];
  onClose: () => void;
  onSave: (data: { title: string; artistId: string; releaseDate: string; coverUrl?: string; coverFile?: File }) => Promise<void>;
}> = ({ mode, album, artists, onClose, onSave }) => {
  const [imagePreview, setImagePreview] = useState(album.coverUrl || "");
  const [coverFile, setCoverFile] = useState<File | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: album.title || "",
      artistId: album.artistId || "",
      releaseDate: toDateInputValue(album.releaseDate),
      coverUrl: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => { setImagePreview(""); setCoverFile(undefined); };

  const onSubmit = async (data: AlbumFormValues) => {
    setSaving(true);
    try {
      await onSave({
        title: data.title,
        artistId: data.artistId,
        releaseDate: new Date(data.releaseDate).toISOString(),
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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900 text-sm">{mode === "add" ? "เพิ่มอัลบั้มใหม่" : "แก้ไขอัลบั้ม"}</p>
          <button type="button" onClick={onClose} disabled={saving} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">
            {/* Cover Image */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ปกอัลบั้ม</label>
              {imagePreview && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden mb-2 bg-gray-100">
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
              <input type="text" placeholder="เช่น Dynamite, Folklore"
                {...register("title")}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${errors.title ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-400"}`} />
              {errors.title && <p className="text-red-500 text-xs mt-1">⚠ {errors.title.message}</p>}
            </div>

            {/* Artist */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ศิลปิน *</label>
              <div className="relative">
                <select {...register("artistId")}
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all appearance-none bg-white ${errors.artistId ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-400"}`}>
                  <option value="">-- เลือกศิลปิน --</option>
                  {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.artistId && <p className="text-red-500 text-xs mt-1">⚠ {errors.artistId.message}</p>}
            </div>

            {/* Release Date */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">วันที่วางจำหน่าย *</label>
              <input type="date"
                {...register("releaseDate")}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.releaseDate ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-400"}`} />
              {errors.releaseDate && <p className="text-red-500 text-xs mt-1">⚠ {errors.releaseDate.message}</p>}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
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
              ) : "บันทึกอัลบั้ม"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ---- Album Songs Modal ----
const AlbumSongsModal: React.FC<{ album: Album; onClose: () => void }> = ({ album, onClose }) => {
  const [songs, setSongs] = useState<AlbumSong[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    getAlbumByIdApi(album.id)
      .then((res) => setSongs(res.data.data?.songs ?? []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, [album.id]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {album.coverUrl
              ? <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Disc size={20} className="text-gray-400" /></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{album.title}</p>
            <p className="text-gray-400 text-xs">{album.artist?.name} · {toDateInputValue(album.releaseDate).split("-")[0]}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
        </div>

        {/* Song list */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">กำลังโหลด...</div>
          ) : songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Music size={32} className="mb-2 opacity-40" />
              <p className="text-sm">ยังไม่มีเพลงในอัลบั้มนี้</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400">#</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-400">ชื่อเพลง</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-400">หมวดหมู่</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-400">ความยาว</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-400"><PlayCircle size={12} /></th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song, idx) => (
                  <tr key={song.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-sm">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          {song.coverUrl
                            ? <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Music size={12} className="text-gray-400" /></div>
                          }
                        </div>
                        <span className="text-sm text-gray-900 font-medium truncate max-w-[160px]">{song.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-400">{song.genre?.name || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 text-right">{formatDuration(song.duration)}</td>
                    <td className="px-5 py-3 text-sm text-gray-400 text-right">{song.playCount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {songs.length} เพลง
        </div>
      </div>
    </div>
  );
};

// ---- Album Card (inside artist section) ----
const AlbumCard: React.FC<{
  album: Album;
  onEdit: (a: Album) => void;
  onDelete: (a: Album) => void;
  onViewSongs: (a: Album) => void;
}> = ({ album, onEdit, onDelete, onViewSongs }) => (
  <div className="bg-gray-700 rounded-xl overflow-hidden group relative cursor-pointer"
    onClick={() => onViewSongs(album)}>
    <div className="relative h-32 overflow-hidden">
      {album.coverUrl ? (
        <img src={album.coverUrl} alt={album.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-600">
          <Disc size={28} className="text-gray-500" />
        </div>
      )}
      {/* Edit / Delete buttons */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onEdit(album)}
          className="w-6 h-6 rounded-md bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
          <Pencil size={11} />
        </button>
        <button onClick={() => onDelete(album)}
          className="w-6 h-6 rounded-md bg-black/50 backdrop-blur-sm flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors">
          <Trash2 size={11} />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2">
        <p className="text-white font-semibold text-xs drop-shadow truncate">{album.title}</p>
      </div>
    </div>
    <div className="px-2.5 py-2">
      <p className="text-gray-400 text-xs">{toDateInputValue(album.releaseDate).split("-")[0] || "—"}</p>
    </div>
  </div>
);

// ---- Artist Row (accordion) ----
const ArtistRow: React.FC<{
  artist: Artist;
  albums: Album[];
  isExpanded: boolean;
  onToggle: () => void;
  onEditAlbum: (a: Album) => void;
  onDeleteAlbum: (a: Album) => void;
  onViewSongs: (a: Album) => void;
}> = ({ artist, albums, isExpanded, onToggle, onEditAlbum, onDeleteAlbum, onViewSongs }) => (
  <div className="bg-gray-800 rounded-xl overflow-hidden">
    {/* Artist header row */}
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-750 transition-colors text-left">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
        {artist.imageUrl
          ? <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><User size={16} className="text-gray-500" /></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">{artist.name}</p>
        <p className="text-gray-400 text-xs">{albums.length} อัลบั้ม</p>
      </div>
      <div className="text-gray-400 flex-shrink-0">
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
    </button>

    {/* Albums grid */}
    {isExpanded && (
      <div className="px-4 pb-4">
        <div className="border-t border-gray-700 mb-3" />
        {albums.length === 0 ? (
          <p className="text-gray-500 text-xs text-center py-4">ยังไม่มีอัลบั้ม</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onEdit={onEditAlbum}
                onDelete={onDeleteAlbum}
                onViewSongs={onViewSongs}
              />
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);

// ---- Main Page ----
const AlbumManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editAlbum, setEditAlbum] = useState<Album | null>(null);
  const [deleteAlbum, setDeleteAlbum] = useState<Album | null>(null);
  const [viewSongsAlbum, setViewSongsAlbum] = useState<Album | null>(null);
  const [expandedArtistIds, setExpandedArtistIds] = useState<Set<string>>(new Set());

  const { albums, loading, error, createAlbum, updateAlbum, deleteAlbum: deleteAlbumApi } = useAlbums();
  const { artists } = useArtists();

  // กรองด้วย search แล้วจัดกลุ่มตามศิลปิน
  const filteredAlbums = useMemo(() =>
    albums.filter((a: Album) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.artist?.name || "").toLowerCase().includes(search.toLowerCase())
    ), [albums, search]);

  // map artistId → albums
  const albumsByArtist = useMemo(() => {
    const map = new Map<string, Album[]>();
    filteredAlbums.forEach((album: Album) => {
      const aid = album.artistId;
      if (!map.has(aid)) map.set(aid, []);
      map.get(aid)!.push(album);
    });
    return map;
  }, [filteredAlbums]);

  // เฉพาะศิลปินที่มีอัลบั้ม (เรียงตามชื่อ)
  const artistsWithAlbums = useMemo(() =>
    artists
      .filter((a: Artist) => albumsByArtist.has(a.id))
      .sort((a: Artist, b: Artist) => a.name.localeCompare(b.name, "th")),
    [artists, albumsByArtist]);

  const toggleArtist = (artistId: string) => {
    setExpandedArtistIds((prev) => {
      const next = new Set(prev);
      next.has(artistId) ? next.delete(artistId) : next.add(artistId);
      return next;
    });
  };

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

          {/* Header row */}
          <div className="flex items-center justify-between">
            <div />
            <button onClick={() => setAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-950 transition-colors">
              <Plus size={15} />เพิ่มอัลบั้ม
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="อัลบั้มทั้งหมด" value={albums.length} icon={<Disc size={16} />} />
            <StatCard label="ศิลปิน" value={artistsWithAlbums.length} icon={<User size={16} />} />
            <StatCard label="ผลการค้นหา" value={filteredAlbums.length} icon={<Search size={16} />} />
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="ค้นหาอัลบั้มหรือศิลปิน..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder-gray-500" />
          </div>

          {/* Artist accordion list */}
          <div className="space-y-3">
            {!loading && artistsWithAlbums.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm">ไม่พบอัลบั้ม</div>
            )}
            {artistsWithAlbums.map((artist: Artist) => (
              <ArtistRow
                key={artist.id}
                artist={artist}
                albums={albumsByArtist.get(artist.id) ?? []}
                isExpanded={expandedArtistIds.has(artist.id)}
                onToggle={() => toggleArtist(artist.id)}
                onEditAlbum={setEditAlbum}
                onDeleteAlbum={setDeleteAlbum}
                onViewSongs={setViewSongsAlbum}
              />
            ))}
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
        <ConfirmDeleteModal title="อัลบั้ม" onClose={() => setDeleteAlbum(null)} onConfirm={handleDelete} />
      )}
      {viewSongsAlbum && (
        <AlbumSongsModal album={viewSongsAlbum} onClose={() => setViewSongsAlbum(null)} />
      )}
    </div>
  );
};

export default AlbumManagementPage;
