import React, { useState } from "react";
import {
    Search,
    Filter,
    Pencil,
    CheckCircle2,
    Crown,
    Shield,
    Ban,
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserType = "ฟรี"
type UserStatus = "ใช้งาน" | "ไม่ใช้งาน" | "ถูกระงับ";
type TypeFilter = "ทั้งหมด" | "ฟรี" | "พรีเมียม";
type StatusFilter = "ทั้งหมด" | "ใช้งาน" | "ไม่ใช้งาน" | "ถูกระงับ";

interface User {
    id: number;
    name: string;
    email: string;
    type: UserType;
    status: UserStatus;
    joinDate: string;
    lastActive: string;
    playlists: number;
    following: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const USERS: User[] = [
    {
        id: 1,
        name: "สาริกา จันทร์สว่าง",
        email: "sarika.j@example.com",
        type: "ฟรี",
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
        type: "ฟรี",
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
        type: "ฟรี",
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
        type: "ฟรี",
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
        type: "ฟรี",
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
        type: "ฟรี",
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
        type: "ฟรี",
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
        type: "ฟรี",
        status: "ไม่ใช้งาน",
        joinDate: "12 ธ.ค. 2025",
        lastActive: "2 สัปดาห์ที่แล้ว",
        playlists: 3,
        following: 8,
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const TypeBadge: React.FC<{ type: UserType }> = ({ type }) => {
    // if (type === "พรีเมียม") {
    //     return (
    //         <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium">
    //             <Crown size={11} className="text-yellow-500" />
    //             พรีเมียม
    //         </span>
    //     );
    // }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium">
            ฟรี
        </span>
    );
};

const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
    const map: Record<UserStatus, string> = {
        ใช้งาน: "bg-green-50 border border-green-200 text-green-700",
        ไม่ใช้งาน: "bg-gray-50 border border-gray-200 text-gray-500",
        ถูกระงับ: "bg-red-50 border border-red-200 text-red-600",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${map[status]}`}
        >
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
    <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
        </div>
    </div>
);

// ─── Filter Pill ──────────────────────────────────────────────────────────────

interface FilterPillProps {
    label: string;
    active: boolean;
    onClick: () => void;
}
const FilterPill: React.FC<FilterPillProps> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 rounded-full text-sm transition-all ${active
            ? "bg-gray-900 text-white font-medium"
            : "text-gray-600 hover:bg-gray-100"
            }`}
    >
        {label}
    </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const UserManagementPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("ทั้งหมด");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ทั้งหมด");

    const totalUsers = USERS.length;
    // const premiumUsers = USERS.filter((u) => u.type === "พรีเมียม").length;
    const freeUsers = USERS.filter((u) => u.type === "ฟรี").length;
    const bannedUsers = USERS.filter((u) => u.status === "ถูกระงับ").length;

    const filtered = USERS.filter((u) => {
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "ทั้งหมด" || u.type === typeFilter;
        const matchStatus = statusFilter === "ทั้งหมด" || u.status === statusFilter;
        return matchSearch && matchType && matchStatus;
    });

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <div className="flex-1 bg-gray-500 p-6 space-y-5">
                    {/* Header */}
                    <div className="flex-1 bg-gray-500 p-6 space-y-5">
                        {/* Header */}

                        {/* Stat Cards */}
                        <div className="flex gap-4 flex-wrap">
                            <StatCard
                                label="ผู้ใช้ที่ใช้งาน"
                                count={totalUsers}
                                iconBg="bg-blue-50"
                                icon={<CheckCircle2 size={20} className="text-blue-500" />}
                            />
                            {/* <StatCard
                        label="ผู้ใช้พรีเมียม"
                        count={premiumUsers}
                        iconBg="bg-yellow-50"
                        icon={<Crown size={20} className="text-yellow-500" />}
                    /> */}
                            <StatCard
                                label="ผู้ใช้ฟรี"
                                count={freeUsers}
                                iconBg="bg-gray-100"
                                icon={<Shield size={20} className="text-gray-500" />}
                            />
                            <StatCard
                                label="ถูกระงับ"
                                count={bannedUsers}
                                iconBg="bg-red-50"
                                icon={<Ban size={20} className="text-red-400" />}
                            />
                        </div>

                        {/* Table Card */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {/* Toolbar */}
                            <div className="px-5 py-4 border-b border-gray-100 space-y-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search
                                        size={14}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-1 text-gray-500 text-sm mr-1">
                                        <Filter size={13} />
                                        <span>ประเภท:</span>
                                    </div>
                                    {(["ทั้งหมด", "ฟรี",] as TypeFilter[]).map((t) => (
                                        <FilterPill
                                            key={t}
                                            label={t}
                                            active={typeFilter === t}
                                            onClick={() => setTypeFilter(t)}
                                        />
                                    ))}

                                    <div className="w-px h-4 bg-gray-200 mx-1" />

                                    <span className="text-gray-500 text-sm">สถานะ:</span>
                                    {(
                                        ["ทั้งหมด", "ใช้งาน", "ไม่ใช้งาน", "ถูกระงับ"] as StatusFilter[]
                                    ).map((s) => (
                                        <FilterPill
                                            key={s}
                                            label={s}
                                            active={statusFilter === s}
                                            onClick={() => setStatusFilter(s)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/60">
                                            <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs tracking-wide">
                                                ผู้ใช้
                                            </th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs tracking-wide">
                                                ประเภท
                                            </th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs tracking-wide">
                                                สถานะ
                                            </th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs tracking-wide">
                                                วันที่สมัคร
                                            </th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs tracking-wide">
                                                ใช้งานล่าสุด
                                            </th>
                                            <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs tracking-wide">
                                                เพลย์ลิสต์
                                            </th>
                                            <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs tracking-wide">
                                                กำลังติดตาม
                                            </th>
                                            <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs tracking-wide">
                                                จัดการ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filtered.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-gray-50/60 transition-colors"
                                            >
                                                <td className="px-5 py-3.5">
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <TypeBadge type={user.type} />
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge status={user.status} />
                                                </td>
                                                <td className="px-4 py-3.5 text-gray-600">{user.joinDate}</td>
                                                <td className="px-4 py-3.5 text-gray-600">
                                                    {user.lastActive}
                                                </td>
                                                <td className="px-4 py-3.5 text-center text-gray-700 font-medium">
                                                    {user.playlists}
                                                </td>
                                                <td className="px-4 py-3.5 text-center text-gray-700 font-medium">
                                                    {user.following}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                                        <Pencil size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filtered.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="text-center py-12 text-gray-400 text-sm"
                                                >
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
        </div>
    );
};

export default UserManagementPage;