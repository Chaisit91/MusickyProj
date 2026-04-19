// หน้าจัดการ Users — table แสดง users ทั้งหมด, search, กำหนด role, toggle premium, ban/unban, ดู premium stats | ใช้ useUsers + usePremiumStats
//
// หลักการทำงาน:
// 1. useUsers hook: โหลด users, ban/unban, change role
// 2. แสดง table ผู้ใช้ + paginator + search
// 3. ปุ่ม ban: ยืนยันด้วย ConfirmDeleteModal ก่อน
// 4. แสดง badge premium/banned/admin

// นำเข้า React และ useState สำหรับจัดการ state ใน component
import React, { useState } from "react";
// useForm สำหรับจัดการ form state, zodResolver สำหรับ validate schema
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// icons จาก lucide-react ใช้แสดงสัญลักษณ์ต่างๆ ในหน้า
import { Search, Pencil, CheckCircle2, Ban, X, Shield, User as UserIcon, Crown, Users } from "lucide-react";
// Layout components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
// custom hook ดึง/แก้ไข/ระงับผู้ใช้
import { useUsers } from "../../hooks/useUsers";
// custom hook ดึงสถิติ premium (total, premium, free, banned count)
import { usePremiumStats } from "../../hooks/usePremiumStats";
// schema และ type สำหรับ validate form แก้ไขผู้ใช้
import { userEditSchema, type UserEditFormValues } from "../../schema/adminSchema";

// ประเภทของ tab กรองผู้ใช้ที่รองรับ
type FilterTab = "all" | "premium" | "free" | "banned";

// interface ข้อมูลผู้ใช้ที่ได้จาก API
interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;       // true = ปกติ, false = ถูกระงับ
  isPremium?: boolean;     // สมาชิก premium หรือไม่
  premiumExpiresAt?: string | null; // วันหมดอายุ premium
  role: string;            // "USER" หรือ "ADMIN"
  createdAt: string;       // วันที่สมัคร
  lastLogin?: string;      // วันที่ login ล่าสุด
  _count?: { playlists: number; likedSongs: number; downloads: number }; // จำนวนข้อมูลที่เกี่ยวข้อง
}

// ฟังก์ชันแปลงวันที่ string เป็น format ภาษาไทย (dd/mm/yyyy)
// รองรับหลาย format ของ input ป้องกัน crash
const formatDate = (d?: string | null): string => {
  if (!d) return "—"; // ถ้าไม่มีค่า แสดง dash
  try {
    // ถ้า string มี "/" อยู่แล้ว (format ไทย) ตัดเฉพาะส่วนวันที่
    if (typeof d === "string" && d.includes("/")) {
      return d.split(" ")[0];
    }
    const date = new Date(d);
    // ถ้าแปลงไม่ได้ (invalid date) แสดง dash
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("th-TH"); // แปลงเป็น format ไทย
  } catch {
    return "—";
  }
};

// Badge แสดงสถานะบัญชี: ใช้งาน (เขียว) หรือถูกระงับ (แดง)
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${isActive ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
    {isActive ? "ใช้งาน" : "ถูกระงับ"}
  </span>
);

// Badge แสดงประเภทบัญชี: Premium (เหลือง+มงกุฎ) หรือ Free (เทา)
// ตรวจสอบว่า premium หมดอายุหรือยังก่อนแสดง
const PremiumBadge: React.FC<{ isPremium?: boolean; expiresAt?: string | null }> = ({ isPremium, expiresAt }) => {
  // เช็คว่า premium หมดอายุแล้วหรือยัง
  const expired = expiresAt ? new Date(expiresAt) < new Date() : false;
  if (isPremium && !expired) {
    // แสดง badge premium (มงกุฎสีเหลือง) ถ้ายังไม่หมดอายุ
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
        <Crown size={10} />
        พรีเมียม
      </span>
    );
  }
  // แสดง badge free (ไอคอนผู้ใช้สีเทา)
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-700 text-gray-400 border border-gray-600">
      <Users size={10} />
      ฟรี
    </span>
  );
};

// Badge แสดง role: Admin (ม่วง+โล่) หรือ User (เทา+ไอคอนคน)
const RoleBadge: React.FC<{ role: string }> = ({ role }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${role === "ADMIN" ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" : "bg-gray-700 text-gray-300 border border-gray-600"}`}>
    {/* แสดงไอคอนตาม role */}
    {role === "ADMIN" ? <Shield size={10} /> : <UserIcon size={10} />}
    {role === "ADMIN" ? "Admin" : "User"}
  </span>
);

// StatCard ใช้แสดงตัวเลขสรุป เช่น จำนวนผู้ใช้ทั้งหมด, premium, ฯลฯ
// คลิกได้เพื่อกรองตาราง (active = highlighted)
const StatCard: React.FC<{ label: string; count: number; icon: React.ReactNode; iconBg: string; active?: boolean; onClick?: () => void }> = ({ label, count, icon, iconBg, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 rounded-xl px-5 py-4 flex-1 min-w-0 transition-all cursor-pointer select-none
    ${active ? "bg-gray-600 ring-2 ring-white/20" : "bg-gray-800 hover:bg-gray-700"}`}>
    {/* ไอคอนบน background สี */}
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
    <div>
      <p className="text-white text-sm">{label}</p>
      {/* แสดงจำนวน ถ้า 0 ให้แสดง 0 ไม่ใช่ false */}
      <p className="text-2xl font-bold text-white">{count || 0}</p>
    </div>
  </div>
);

// Modal แก้ไขข้อมูลผู้ใช้: เปลี่ยน role และสถานะบัญชี
const EditUserModal: React.FC<{ user: User | null; onClose: () => void; onSave: (id: string, data: any) => void }> = ({ user, onClose, onSave }) => {
  // state toast แสดง feedback "บันทึกเรียบร้อย" หลัง save สำเร็จ
  const [showToast, setShowToast] = useState(false);

  // ตั้งค่า form ด้วย Zod schema validate role และ isActive
  const {
    register,
    handleSubmit,
    watch,            // ติดตามค่า field แบบ real-time
    formState: { errors },
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    // กำหนดค่าเริ่มต้นจากข้อมูลผู้ใช้ที่เลือก
    values: user ? { role: user.role as "USER" | "ADMIN", isActive: user.isActive ? "active" : "banned" } : undefined,
  });

  // ติดตามค่า role แบบ real-time เพื่อแสดง warning เมื่อเลือก ADMIN
  const watchedRole = watch("role");

  // ถ้าไม่มี user ที่เลือก ไม่ render modal
  if (!user) return null;

  // สร้าง initials (ตัวย่อชื่อ) จาก name เช่น "John Doe" → "JD"
  const initials = user.name.split(" ").map((w: string) => w.charAt(0)).slice(0, 2).join("");

  // handler submit form: บันทึกและแสดง toast ก่อนปิด modal
  const onSubmit = (data: UserEditFormValues) => {
    // แปลง isActive จาก string "active"/"banned" เป็น boolean
    onSave(user.id, { role: data.role, isActive: data.isActive === "active" });
    setShowToast(true); // แสดง feedback
    // หน่วง 1.5 วินาทีก่อนปิด modal ให้ผู้ใช้เห็น feedback
    setTimeout(() => { setShowToast(false); onClose(); }, 1500);
  };

  return (
    // overlay: คลิกพื้นหลังเพื่อปิด modal (ยกเว้นคลิกใน modal เอง)
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-xl">
        {/* Modal header: ชื่อ + ปุ่มปิด */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-medium text-gray-900 text-sm">แก้ไขข้อมูลผู้ใช้</p>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
        </div>

        {/* User info header: แสดง avatar (initials), ชื่อ, email ของผู้ใช้ที่กำลังแก้ไข */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          {/* avatar วงกลม แสดงตัวอักษรย่อ */}
          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm flex-shrink-0">{initials}</div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{user.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Form แก้ไข role และสถานะ */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-5 py-4 space-y-4">
            {/* Field เลือก Role */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">บทบาท (Role)</label>
              <select {...register("role")}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all bg-white ${errors.role ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 focus:ring-purple-500/20 focus:border-purple-400"}`}>
                <option value="USER">User — ผู้ใช้งานทั่วไป</option>
                <option value="ADMIN">Admin — ผู้ดูแลระบบ</option>
              </select>
              {/* แสดง warning เมื่อเลือก ADMIN เพราะมีสิทธิ์สูงสุด */}
              {watchedRole === "ADMIN" && (
                <p className="text-xs text-orange-500 mt-1.5">⚠️ Admin สามารถเข้าถึงและจัดการข้อมูลทั้งหมดในระบบได้</p>
              )}
            </div>

            {/* Field เลือกสถานะบัญชี */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">สถานะบัญชี</label>
              <select {...register("isActive")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white">
                <option value="active">ใช้งาน</option>
                <option value="banned">ถูกระงับ</option>
              </select>
            </div>

            {/* สถิติผู้ใช้: จำนวน playlist, เพลงที่ถูกใจ, downloads */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Playlists</p><p className="font-bold text-gray-900">{user._count?.playlists ?? 0}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Liked Songs</p><p className="font-bold text-gray-900">{user._count?.likedSongs ?? 0}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Downloads</p><p className="font-bold text-gray-900">{user._count?.downloads ?? 0}</p></div>
            </div>
          </div>

          {/* Modal footer: แสดง toast หรือปุ่มยกเลิก/บันทึก */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            {/* แสดง toast feedback หลัง save สำเร็จ หรือ placeholder ว่างๆ */}
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

// ข้อมูล tab filter สำหรับกรองผู้ใช้ตามประเภท
const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "premium", label: "พรีเมียม" },
  { key: "free", label: "ผู้ใช้ปกติ" },
  { key: "banned", label: "ถูกระงับ" },
];

// หน้าหลัก User Management
const UserManagementPage: React.FC = () => {
  // state ค้นหา: keyword สำหรับ filter ชื่อ/email
  const [search, setSearch] = useState("");
  // tab ที่เลือกอยู่: กรองผู้ใช้ตามประเภท
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  // user ที่กำลังแก้ไข (null = ปิด modal)
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // แปลง tab เป็น parameter สำหรับ API (all = ไม่กรอง)
  const statusParam = activeTab === "all" ? undefined : activeTab;
  // hook ดึงรายการผู้ใช้พร้อม function จัดการ
  const { users, loading, error, updateUser, banUser, unbanUser } = useUsers(search, statusParam);
  // hook ดึงสถิติ premium สำหรับ StatCard (รองรับ refetch หลังอัปเดต)
  const { stats, refetch: refetchStats } = usePremiumStats();

  // เมื่อเปลี่ยน tab: รีเซ็ต search และเปลี่ยน activeTab
  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setSearch(""); // ล้าง search เพื่อแสดงผลใหม่ตาม tab
  };

  // อัปเดตข้อมูลผู้ใช้ (role/status) แล้ว refetch stats ให้ตรงกัน
  const handleUpdateUser = async (id: string, data: any) => {
    await updateUser(id, data);
    refetchStats(); // อัปเดต stat card หลังเปลี่ยนข้อมูล
  };

  // ระงับบัญชีผู้ใช้ แล้ว refetch stats
  const handleBan = async (id: string) => {
    await banUser(id);
    refetchStats();
  };

  // เปิดบัญชีผู้ใช้ที่ถูกระงับ แล้ว refetch stats
  const handleUnban = async (id: string) => {
    await unbanUser(id);
    refetchStats();
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar เมนูด้านซ้าย */}
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Topbar แถบด้านบน */}
        <Topbar />
        <div className="flex-1 bg-gray-500 p-6 space-y-5">
          <div className="flex-1 bg-gray-500 p-6 space-y-5">
            {/* แสดง error ถ้าโหลดข้อมูลไม่สำเร็จ */}
            {error && <div className="bg-red-900 text-red-300 p-3 rounded-lg text-sm">{error}</div>}
            {/* แสดง loading indicator */}
            {loading && <div className="text-center py-4 text-gray-300 text-sm">กำลังโหลด...</div>}

            {/* Stat Cards: 4 ช่อง ผู้ใช้ทั้งหมด, premium, ปกติ, ถูกระงับ
                คลิกแต่ละ card เพื่อกรองตาราง */}
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

            {/* ตารางรายชื่อผู้ใช้ */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 pt-4 pb-0">
                {/* แถบ Tab filter + Search box */}
                <div className="flex items-center gap-2 mb-4">
                  {/* Tab ปุ่มกรอง: ทั้งหมด, พรีเมียม, ปกติ, ถูกระงับ */}
                  {TABS.map((t) => (
                    <button key={t.key} onClick={() => handleTabChange(t.key)}
                      // active tab: พื้นขาว ตัวอักษรดำ / inactive: เทาโปร่งแสง
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === t.key
                        ? "bg-white text-gray-900"
                        : "text-gray-400 hover:text-white hover:bg-gray-700"}`}>
                      {t.label}
                    </button>
                  ))}
                  {/* Search box อยู่ขวาสุด (ml-auto) */}
                  <div className="relative ml-auto">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="ค้นหาชื่อ / อีเมล..." value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-1.5 text-sm bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-56 transition-all" />
                  </div>
                </div>
              </div>
              {/* ตารางข้อมูลผู้ใช้ scroll แนวนอนได้บนจอเล็ก */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800">
                      {/* หัวตาราง: ชื่อ-email, role, ประเภท, สถานะ, วันสมัคร, ใช้งานล่าสุด, playlists, actions */}
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
                    {/* วน render แต่ละ user */}
                    {users.map((user: User) => (
                      <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                        {/* ชื่อและ email ผู้ใช้ */}
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
                        </td>
                        {/* badge role: Admin หรือ User */}
                        <td className="px-4 py-3.5"><RoleBadge role={user.role} /></td>
                        {/* badge ประเภท: Premium หรือ Free */}
                        <td className="px-4 py-3.5"><PremiumBadge isPremium={user.isPremium} expiresAt={user.premiumExpiresAt} /></td>
                        {/* badge สถานะบัญชี */}
                        <td className="px-4 py-3.5"><StatusBadge isActive={user.isActive} /></td>
                        {/* วันที่สมัคร format ไทย */}
                        <td className="px-4 py-3.5 text-white text-xs">{formatDate(user.createdAt)}</td>
                        {/* วันที่ login ล่าสุด */}
                        <td className="px-4 py-3.5 text-white text-xs">{formatDate(user.lastLogin)}</td>
                        {/* จำนวน playlist */}
                        <td className="px-4 py-3.5 text-center text-white font-medium">{user._count?.playlists ?? 0}</td>
                        {/* ปุ่มจัดการ: แก้ไข + ban/unban */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* ปุ่มแก้ไข: เปิด EditUserModal */}
                            <button onClick={() => setEditingUser(user)} className="p-1.5 rounded-lg text-white hover:text-gray-900 hover:bg-gray-100 transition-colors"><Pencil size={15} /></button>
                            {/* แสดงปุ่ม Ban ถ้าบัญชีใช้งานอยู่ หรือ Unban ถ้าถูกระงับ */}
                            {user.isActive
                              ? <button onClick={() => handleBan(user.id)} className="px-2 py-1 rounded text-red-400 hover:bg-red-500/10 transition-colors text-xs">Ban</button>
                              : <button onClick={() => handleUnban(user.id)} className="px-2 py-1 rounded text-green-400 hover:bg-green-500/10 transition-colors text-xs">Unban</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* กรณีไม่มีผู้ใช้ในผลลัพธ์ */}
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
      {/* Modal แก้ไขผู้ใช้: แสดงเมื่อมี editingUser */}
      <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleUpdateUser} />
    </div>
  );
};

export default UserManagementPage;
