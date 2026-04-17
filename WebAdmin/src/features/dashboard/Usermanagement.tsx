import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Pencil, CheckCircle2, Ban, X, Shield, User as UserIcon, Crown, Users } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useUsers } from "../../hooks/useUsers";
import { usePremiumStats } from "../../hooks/usePremiumStats";
import { userEditSchema, type UserEditFormValues } from "../../schema/adminSchema";

type FilterTab = "all" | "premium" | "free" | "banned";

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isPremium?: boolean;
  premiumExpiresAt?: string | null;
  role: string;
  createdAt: string;
  lastLogin?: string;
  _count?: { playlists: number; likedSongs: number; downloads: number };
}

const formatDate = (d?: string | null): string => {
  if (!d) return "—";
  try {
    if (typeof d === "string" && d.includes("/")) {
      return d.split(" ")[0];
    }
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("th-TH");
  } catch {
    return "—";
  }
};

const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${isActive ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
    {isActive ? "ใช้งาน" : "ถูกระงับ"}
  </span>
);

const PremiumBadge: React.FC<{ isPremium?: boolean; expiresAt?: string | null }> = ({ isPremium, expiresAt }) => {
  const expired = expiresAt ? new Date(expiresAt) < new Date() : false;
  if (isPremium && !expired) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
        <Crown size={10} />
        พรีเมียม
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-700 text-gray-400 border border-gray-600">
      <Users size={10} />
      ฟรี
    </span>
  );
};

const RoleBadge: React.FC<{ role: string }> = ({ role }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${role === "ADMIN" ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" : "bg-gray-700 text-gray-300 border border-gray-600"}`}>
    {role === "ADMIN" ? <Shield size={10} /> : <UserIcon size={10} />}
    {role === "ADMIN" ? "Admin" : "User"}
  </span>
);

const StatCard: React.FC<{ label: string; count: number; icon: React.ReactNode; iconBg: string; active?: boolean; onClick?: () => void }> = ({ label, count, icon, iconBg, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 rounded-xl px-5 py-4 flex-1 min-w-0 transition-all cursor-pointer select-none
    ${active ? "bg-gray-600 ring-2 ring-white/20" : "bg-gray-800 hover:bg-gray-700"}`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
    <div>
      <p className="text-white text-sm">{label}</p>
      <p className="text-2xl font-bold text-white">{count || 0}</p>
    </div>
  </div>
);

const EditUserModal: React.FC<{ user: User | null; onClose: () => void; onSave: (id: string, data: any) => void }> = ({ user, onClose, onSave }) => {
  const [showToast, setShowToast] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    values: user ? { role: user.role as "USER" | "ADMIN", isActive: user.isActive ? "active" : "banned" } : undefined,
  });

  const watchedRole = watch("role");

  if (!user) return null;

  const initials = user.name.split(" ").map((w: string) => w.charAt(0)).slice(0, 2).join("");

  const onSubmit = (data: UserEditFormValues) => {
    onSave(user.id, { role: data.role, isActive: data.isActive === "active" });
    setShowToast(true);
    setTimeout(() => { setShowToast(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-medium text-gray-900 text-sm">แก้ไขข้อมูลผู้ใช้</p>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm flex-shrink-0">{initials}</div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{user.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">บทบาท (Role)</label>
              <select {...register("role")}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all bg-white ${errors.role ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 focus:ring-purple-500/20 focus:border-purple-400"}`}>
                <option value="USER">User — ผู้ใช้งานทั่วไป</option>
                <option value="ADMIN">Admin — ผู้ดูแลระบบ</option>
              </select>
              {watchedRole === "ADMIN" && (
                <p className="text-xs text-orange-500 mt-1.5">⚠️ Admin สามารถเข้าถึงและจัดการข้อมูลทั้งหมดในระบบได้</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">สถานะบัญชี</label>
              <select {...register("isActive")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white">
                <option value="active">ใช้งาน</option>
                <option value="banned">ถูกระงับ</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Playlists</p><p className="font-bold text-gray-900">{user._count?.playlists ?? 0}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Liked Songs</p><p className="font-bold text-gray-900">{user._count?.likedSongs ?? 0}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Downloads</p><p className="font-bold text-gray-900">{user._count?.downloads ?? 0}</p></div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            {showToast ? <span className="text-xs text-green-600 font-medium">✓ บันทึกเรียบร้อยแล้ว</span> : <span />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
              <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium">บันทึกการเปลี่ยนแปลง</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "premium", label: "พรีเมียม" },
  { key: "free", label: "ผู้ใช้ปกติ" },
  { key: "banned", label: "ถูกระงับ" },
];

const UserManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const statusParam = activeTab === "all" ? undefined : activeTab;
  const { users, loading, error, updateUser, banUser, unbanUser } = useUsers(search, statusParam);
  const { stats, refetch: refetchStats } = usePremiumStats();

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setSearch("");
  };

  const handleUpdateUser = async (id: string, data: any) => {
    await updateUser(id, data);
    refetchStats();
  };

  const handleBan = async (id: string) => {
    await banUser(id);
    refetchStats();
  };

  const handleUnban = async (id: string) => {
    await unbanUser(id);
    refetchStats();
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="ผู้ใช้ทั้งหมด" count={stats?.total ?? 0} iconBg="bg-blue-50"
                icon={<CheckCircle2 size={20} className="text-blue-500" />}
                active={activeTab === "all"} onClick={() => handleTabChange("all")} />
              <StatCard label="พรีเมียม" count={stats?.premium ?? 0} iconBg="bg-yellow-100"
                icon={<Crown size={20} className="text-yellow-500" />}
                active={activeTab === "premium"} onClick={() => handleTabChange("premium")} />
              <StatCard label="ผู้ใช้ปกติ" count={stats?.free ?? 0} iconBg="bg-gray-700"
                icon={<Users size={20} className="text-gray-300" />}
                active={activeTab === "free"} onClick={() => handleTabChange("free")} />
              <StatCard label="ถูกระงับ" count={stats?.banned ?? 0} iconBg="bg-red-50"
                icon={<Ban size={20} className="text-red-400" />}
                active={activeTab === "banned"} onClick={() => handleTabChange("banned")} />
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 pt-4 pb-0">
                <div className="flex items-center gap-2 mb-4">
                  {TABS.map((t) => (
                    <button key={t.key} onClick={() => handleTabChange(t.key)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === t.key
                        ? "bg-white text-gray-900"
                        : "text-gray-400 hover:text-white hover:bg-gray-700"}`}>
                      {t.label}
                    </button>
                  ))}
                  <div className="relative ml-auto">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="ค้นหาชื่อ / อีเมล..." value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-1.5 text-sm bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-56 transition-all" />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800">
                      <th className="text-left px-5 py-3 text-white font-medium text-xs">ผู้ใช้</th>
                      <th className="text-left px-4 py-3 text-white font-medium text-xs">Role</th>
                      <th className="text-left px-4 py-3 text-white font-medium text-xs">ประเภท</th>
                      <th className="text-left px-4 py-3 text-white font-medium text-xs">สถานะ</th>
                      <th className="text-left px-4 py-3 text-white font-medium text-xs">วันที่สมัคร</th>
                      <th className="text-left px-4 py-3 text-white font-medium text-xs">ใช้งานล่าสุด</th>
                      <th className="text-center px-4 py-3 text-white font-medium text-xs">Playlists</th>
                      <th className="text-center px-4 py-3 text-white font-medium text-xs">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user: User) => (
                      <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
                        </td>
                        <td className="px-4 py-3.5"><RoleBadge role={user.role} /></td>
                        <td className="px-4 py-3.5"><PremiumBadge isPremium={user.isPremium} expiresAt={user.premiumExpiresAt} /></td>
                        <td className="px-4 py-3.5"><StatusBadge isActive={user.isActive} /></td>
                        <td className="px-4 py-3.5 text-white text-xs">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3.5 text-white text-xs">{formatDate(user.lastLogin)}</td>
                        <td className="px-4 py-3.5 text-center text-white font-medium">{user._count?.playlists ?? 0}</td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setEditingUser(user)} className="p-1.5 rounded-lg text-white hover:text-gray-900 hover:bg-gray-100 transition-colors"><Pencil size={15} /></button>
                            {user.isActive
                              ? <button onClick={() => handleBan(user.id)} className="px-2 py-1 rounded text-red-400 hover:bg-red-500/10 transition-colors text-xs">Ban</button>
                              : <button onClick={() => handleUnban(user.id)} className="px-2 py-1 rounded text-green-400 hover:bg-green-500/10 transition-colors text-xs">Unban</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && users.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">ไม่พบผู้ใช้</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleUpdateUser} />
    </div>
  );
};

export default UserManagementPage;
