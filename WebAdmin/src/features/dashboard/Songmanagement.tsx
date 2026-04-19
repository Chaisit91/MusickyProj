// หน้าจัดการ Songs — table + modal CRUD: สร้าง/แก้ไข/ลบเพลง, upload audio + ปก, เลือกศิลปิน/อัลบั้ม/แนวเพลง, preview เพลง | ใช้ useSongs + useAudioPlayer
//
// หลักการทำงาน:
// 1. useSongs hook: โหลดเพลง, CRUD operations
// 2. แสดง table รายการเพลง + paginator
// 3. modal สร้าง/แก้ไข: form มี file upload สำหรับ audio + cover
// 4. ปุ่ม play: useAudioPlayer preview เพลงก่อน
// 5. search + filter โดย artist/genre

import React, { useState, useEffect } from "react";
import { Search, Plus, Music, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import api from "../../api/axios";

interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  bio?: string;
}

const SongManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songCounts, setSongCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/artists"),
      api.get("/admin/songs"),
    ])
      .then(([artistRes, songRes]) => {
        const artistList: Artist[] = artistRes.data.data ?? [];
        const songList: { artistId: string }[] = songRes.data.data ?? [];

        const counts: Record<string, number> = {};
        for (const s of songList) {
          counts[s.artistId] = (counts[s.artistId] ?? 0) + 1;
        }

        setArtists(artistList);
        setSongCounts(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = artists.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 bg-gray-500 p-6 space-y-5">
          <div className="flex-1 bg-gray-500 p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-white text-xl font-bold">จัดการเพลง</h1>
                <p className="text-gray-300 text-xs mt-0.5">เลือกศิลปินเพื่อจัดการเพลง</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาศิลปิน..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
              />
            </div>

            {/* Artist Grid */}
            {loading ? (
              <div className="text-center py-16 text-gray-400 text-sm">กำลังโหลด...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-sm">ไม่พบศิลปิน</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filtered.map((artist) => (
                  <button
                    key={artist.id}
                    onClick={() => navigate(`/songs/${artist.id}`)}
                    className="bg-gray-800 rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-gray-700 hover:scale-[1.02] transition-all text-left group"
                  >
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 ring-2 ring-gray-600 group-hover:ring-gray-400 transition-all">
                      {artist.imageUrl ? (
                        <img
                          src={artist.imageUrl}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music size={28} className="text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-center w-full">
                      <p className="text-white text-sm font-semibold truncate">{artist.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {songCounts[artist.id] ?? 0} เพลง
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1 text-gray-500 group-hover:text-gray-300 transition-colors text-xs">
                      <span>ดูเพลง</span>
                      <ChevronRight size={12} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongManagementPage;
