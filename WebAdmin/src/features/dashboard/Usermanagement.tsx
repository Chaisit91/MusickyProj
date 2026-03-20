import React, { useState, useEffect } from "react";
import {
    Search,
    Pencil,
    CheckCircle2,
    Ban,
    X,
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserStatus = "ใช้งาน" | "ไม่ใช้งาน" | "ถูกระงับ";
type StatusFilter = "ทั้งหมด" | "ใช้งาน" | "ไม่ใช้งาน" | "ถูกระงับ";

interface User {
    id: number;
    name: string;
    email: string;
    status: UserStatus;
    joinDate: string;
    lastActive: string;
    playlists: number;
    following: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_USERS: User[] = [
    {
        id: 1,
        name: "สาริกา จันทร์สว่าง",
        email: "sarika.j@example.com",
        status: "ใช้งาน",
        joinDate: "15 ส.ค. 2025",
        lastActive: "2 ชั่วโมงที่แล้ว",
        playlists: 24,
        following: 156,
    },
    {
        id: 2,
        name: "สมชาย วงศ์ใหญ่",
        email: "somchai.w@example.com",
        status: "ใช้งาน",
        joinDate: "22 มิ.ย. 2025",
        lastActive: "1 วันที่แล้ว",
        playlists: 18,
        following: 89,
    },
    {
        id: 3,
        name: "วรรณา สุขดี",
        email: "wanna.s@example.com",
        status: "ใช้งาน",
        joinDate: "10 ม.ค. 2026",
        lastActive: "5 นาทีที่แล้ว",
        playlists: 8,
        following: 34,
    },
    {
        id: 4,
        name: "ธนากร มั่นคง",
        email: "tanakorn.m@example.com",
        status: "ใช้งาน",
        joinDate: "5 พ.ย. 2025",
        lastActive: "3 ชั่วโมงที่แล้ว",
        playlists: 32,
        following: 210,
    },
    {
        id: 5,
        name: "ลิสา อรุณสว่าง",
        email: "lisa.a@example.com",
        status: "ถูกระงับ",
        joinDate: "18 ก.ย. 2025",
        lastActive: "1 สัปดาห์ที่แล้ว",
        playlists: 5,
        following: 12,
    },
    {
        id: 6,
        name: "ดวงใจ สว่างจิต",
        email: "duangjai.s@example.com",
        status: "ใช้งาน",
        joinDate: "1 ก.พ. 2026",
        lastActive: "30 นาทีที่แล้ว",
        playlists: 12,
        following: 45,
    },
    {
        id: 7,
        name: "ภูมิใจ ชัยชนะ",
        email: "poomjai.c@example.com",
        status: "ใช้งาน",
        joinDate: "30 ต.ค. 2025",
        lastActive: "4 ชั่วโมงที่แล้ว",
        playlists: 28,
        following: 178,
    },
    {
        id: 8,
        name: "นัฐพล พัฒนกุล",
        email: "nattapon.p@example.com",
        status: "ไม่ใช้งาน",
        joinDate: "12 ธ.ค. 2025",
        lastActive: "2 สัปดาห์ที่แล้ว",
        playlists: 3,
        following: 8,
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
    const map: Record<UserStatus, string> = {
        ใช้งาน: "bg-green-50 border border-green-200 text-green-700",
        ไม่ใช้งาน: "bg-gray-50 border border-gray-200 text-gray-500",
        ถูกระงับ: "bg-red-50 border border-red-200 text-red-600",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${map[status]}`}>
            {status}
        </span>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    count: number;
    icon: React.ReactNode;
    iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, count, icon, iconBg }) => (
    <div className="flex items-center gap-4 bg-gray-800 rounded-xl px-5 py-4 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
            {icon}
        </div>
        <div>
            <p className="text-white text-sm">{label}</p>
            <p className="text-2xl font-bold text-white">{count}</p>
        </div>
    </div>
);

// ─── Edit User Modal ──────────────────────────────────────────────────────────

interface EditUserModalProps {
    user: User | null;
    onClose: () => void;
    onSave: (updated: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
    const [form, setForm] = useState<User | null>(null);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        setForm(user ? { ...user } : null);
    }, [user]);

    if (!user || !form) return null;

    const initials = form.name
        .split(" ")
        .map((w) => w.charAt(0))
        .slice(0, 2)
        .join("");

    const handleSave = () => {
        onSave(form);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            onClose();
        }, 1500);
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <p className="font-medium text-gray-900 text-sm">แก้ไขข้อมูลผู้ใช้</p>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Avatar Row */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm flex-shrink-0">
                        {initials}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 text-sm">{form.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{form.email}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">ชื่อ-นามสกุล</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">อีเมล</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                        />
                    </div>

                    {/* Status + JoinDate */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">สถานะ</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                            >
                                <option value="ใช้งาน">ใช้งาน</option>
                                <option value="ไม่ใช้งาน">ไม่ใช้งาน</option>
                                <option value="ถูกระงับ">ถูกระงับ</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">วันที่สมัคร</label>
                            <input
                                type="text"
                                value={form.joinDate}
                                readOnly
                                className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-default"
                            />
                        </div>
                    </div>

                    {/* Playlists + Following */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">เพลย์ลิสต์</label>
                            <input
                                type="number"
                                min={0}
                                value={form.playlists}
                                onChange={(e) => setForm({ ...form, playlists: Number(e.target.value) })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">กำลังติดตาม</label>
                            <input
                                type="number"
                                min={0}
                                value={form.following}
                                onChange={(e) => setForm({ ...form, following: Number(e.target.value) })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                    {showToast && (
                        <span className="text-xs text-green-600 font-medium">✓ บันทึกเรียบร้อยแล้ว</span>
                    )}
                    {!showToast && <span />}
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
                            บันทึกการเปลี่ยนแปลง
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>(INITIAL_USERS);
    const [search, setSearch] = useState("");
    const [statusFilter] = useState<StatusFilter>("ทั้งหมด");
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const totalUsers = users.length;
    const bannedUsers = users.filter((u) => u.status === "ถูกระงับ").length;

    const filtered = users.filter((u) => {
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "ทั้งหมด" || u.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleSave = (updated: User) => {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <div className="flex-1 bg-gray-500 p-6 space-y-5">
                    <div className="flex-1 bg-gray-500 p-6 space-y-5">

                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StatCard
                                label="ผู้ใช้งาน"
                                count={totalUsers}
                                iconBg="bg-blue-50"
                                icon={<CheckCircle2 size={20} className="text-blue-500" />}
                            />
                            <StatCard
                                label="ถูกระงับ"
                                count={bannedUsers}
                                iconBg="bg-red-50"
                                icon={<Ban size={20} className="text-red-400" />}
                            />
                        </div>

                        {/* Table Card */}
                        <div className="bg-gray-800 rounded-xl overflow-hidden">
                            {/* Toolbar */}
                            <div className="px-5 py-4 space-y-3">
                                <div className="relative">
                                    <Search
                                        size={14}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700 bg-gray-800">
                                            <th className="text-left px-5 py-3 text-white font-medium text-xs tracking-wide">ผู้ใช้</th>
                                            <th className="text-left px-4 py-3 text-white font-medium text-xs tracking-wide">สถานะ</th>
                                            <th className="text-left px-4 py-3 text-white font-medium text-xs tracking-wide">วันที่สมัคร</th>
                                            <th className="text-left px-4 py-3 text-white font-medium text-xs tracking-wide">ใช้งานล่าสุด</th>
                                            <th className="text-center px-4 py-3 text-white font-medium text-xs tracking-wide">เพลย์ลิสต์</th>
                                            <th className="text-center px-4 py-3 text-white font-medium text-xs tracking-wide">กำลังติดตาม</th>
                                            <th className="text-center px-4 py-3 text-white font-medium text-xs tracking-wide">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {filtered.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <p className="font-medium text-white">{user.name}</p>
                                                    <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge status={user.status} />
                                                </td>
                                                <td className="px-4 py-3.5 text-white">{user.joinDate}</td>
                                                <td className="px-4 py-3.5 text-white">{user.lastActive}</td>
                                                <td className="px-4 py-3.5 text-center text-white font-medium">{user.playlists}</td>
                                                <td className="px-4 py-3.5 text-center text-white font-medium">{user.following}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <button
                                                        onClick={() => setEditingUser(user)}
                                                        className="p-1.5 rounded-lg text-white hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filtered.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                                                    ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข
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

            {/* Edit Modal */}
            <EditUserModal
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSave={handleSave}
            />
        </div>
    );
};

export default UserManagementPage;