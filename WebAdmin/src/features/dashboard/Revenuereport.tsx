import React, { useState } from "react";
import {
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────

type DateRange = "7 วันล่าสุด" | "6 เดือนล่าสุด" | "เดือนนี้" | "ของปีนี้";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const REVENUE_LINE: Record<DateRange, { date: string; revenue: number }[]> = {
  "7 วันล่าสุด": [
    { date: "20 มี.ค.", revenue: 28000 },
    { date: "21 มี.ค.", revenue: 35000 },
    { date: "22 มี.ค.", revenue: 42000 },
    { date: "23 มี.ค.", revenue: 38000 },
    { date: "24 มี.ค.", revenue: 55000 },
    { date: "25 มี.ค.", revenue: 61000 },
    { date: "26 มี.ค.", revenue: 74000 },
  ],
  "6 เดือนล่าสุด": [
    { date: "ต.ค. 25", revenue: 145000 },
    { date: "พ.ย. 25", revenue: 162000 },
    { date: "ธ.ค. 25", revenue: 178000 },
    { date: "ม.ค. 26", revenue: 195000 },
    { date: "ก.พ. 26", revenue: 221000 },
    { date: "มี.ค. 26", revenue: 258000 },
  ],
  "เดือนนี้": [
    { date: "สัปดาห์ 1", revenue: 52000 },
    { date: "สัปดาห์ 2", revenue: 68000 },
    { date: "สัปดาห์ 3", revenue: 75000 },
    { date: "สัปดาห์ 4", revenue: 63000 },
  ],
  "ของปีนี้": [
    { date: "ม.ค.", revenue: 195000 },
    { date: "ก.พ.", revenue: 221000 },
    { date: "มี.ค.", revenue: 258000 },
    { date: "เม.ย.", revenue: 0 },
    { date: "พ.ค.", revenue: 0 },
    { date: "มิ.ย.", revenue: 0 },
  ],
};

const PIE_DATA = [
  { name: "วิดีโอ", value: 62, color: "#3b82f6" },
  { name: "แบนเนอร์", value: 42, color: "#22c55e" },
];

const BAR_DATA = [
  { name: "TechCorp", revenue: 115000 },
  { name: "Fashion Brand", revenue: 89000 },
  { name: "LifeStyle Co.", revenue: 67000 },
  { name: "บริษัทพรีเมียม", revenue: 45000 },
  { name: "SoundWave", revenue: 210000 },
];

const ADVERTISERS = [
  { name: "TechCorp", revenue: 115000, share: 24.2, ctr: 9.8, cpm: 4.58 },
  { name: "Fashion Brand", revenue: 89000, share: 17.2, ctr: 5.6, cpm: 6.15 },
  { name: "LifeStyle Co.", revenue: 67000, share: 13.0, ctr: 5.1, cpm: 3.85 },
  { name: "บริษัทพรีเมียม", revenue: 45000, share: 8.7, ctr: 4.7, cpm: 3.52 },
  { name: "SoundWave", revenue: 210000, share: 40.6, ctr: 8.8, cpm: 4.94 },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  up: boolean;
  icon: React.ReactNode;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, up, icon, iconColor }) => (
  <div className="bg-gray-800 rounded-xl px-5 py-4 flex-1 min-w-0">
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <span className="text-gray-400 text-xs">{label}</span>
    </div>
    <p className="text-white text-xl font-bold">{value}</p>
    <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${up ? "text-green-400" : "text-red-400"}`}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      <span>{sub}</span>
    </div>
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-semibold">฿{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

// ─── Share Bar ────────────────────────────────────────────────────────────────

const ShareBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
    <div className="h-full bg-green-400 rounded-full" style={{ width: `${value}%` }} />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const RevenueReportPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>("6 เดือนล่าสุด");
  const lineData = REVENUE_LINE[dateRange];

  const DATE_RANGES: DateRange[] = ["7 วันล่าสุด", "6 เดือนล่าสุด", "เดือนนี้", "ของปีนี้"];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 bg-gray-500 p-6 space-y-5 overflow-auto">
          <div className="space-y-5">

            {/* Page Header */}
            <div>
              <h1 className="text-white text-lg font-bold">รายได้และวิเคราะห์โฆษณา</h1>
              <p className="text-gray-300 text-xs mt-0.5">ติดตามผลประกอบการและรายได้จากโฆษณา</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatCard
                label="รายได้รวม"
                value="฿258,000"
                sub="3.62% เทียบเดือนที่แล้ว"
                up={true}
                icon={<DollarSign size={14} className="text-emerald-400" />}
                iconColor="bg-gray-700"
              />
              <StatCard
                label="การแสดงผล"
                value="4.7M"
                sub="8.92% เทียบเดือนที่แล้ว"
                up={true}
                icon={<Eye size={14} className="text-blue-400" />}
                iconColor="bg-gray-700"
              />
              <StatCard
                label="คลิกทั้งหมด"
                value="312K"
                sub="1.05% เทียบเดือนที่แล้ว"
                up={false}
                icon={<MousePointerClick size={14} className="text-orange-400" />}
                iconColor="bg-gray-700"
              />
              <StatCard
                label="CTR เฉลี่ย"
                value="6.67%"
                sub="2.21 เทียบเดือนที่แล้ว"
                up={true}
                icon={<TrendingUp size={14} className="text-purple-400" />}
                iconColor="bg-gray-700"
              />
              <StatCard
                label="CPM เฉลี่ย"
                value="฿55.13"
                sub="฿1,000 ครั้ง"
                up={true}
                icon={<BarChart2 size={14} className="text-indigo-400" />}
                iconColor="bg-gray-700"
              />
            </div>

            {/* Line Chart Card */}
            <div className="bg-gray-800 rounded-xl p-5">
              {/* Range pills */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                {DATE_RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      dateRange === r
                        ? "bg-white text-gray-900"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <p className="text-white text-sm font-semibold mb-4">รายได้ตามช่วงเวลา</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center mt-2">
                <div className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                  <div className="w-3 h-0.5 bg-green-500 rounded" />
                  รายได้ (฿)
                </div>
              </div>
            </div>

            {/* Pie + Bar Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Pie Chart */}
              <div className="bg-gray-800 rounded-xl p-5">
                <p className="text-white text-sm font-semibold mb-4">รายได้แยกตามประเภทโฆษณา</p>
                <div className="flex items-center justify-around">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={PIE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {PIE_DATA.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => [`${v}%`, ""]}
                        contentStyle={{ background: "#1f2937", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {PIE_DATA.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <div>
                          <p className="text-xs text-gray-400">{d.name}</p>
                          <p className="text-sm font-semibold text-white">{d.value}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-gray-800 rounded-xl p-5">
                <p className="text-white text-sm font-semibold mb-4">รายได้แยกตามผู้ลงโฆษณา</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={BAR_DATA} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(v: number) => [`฿${v.toLocaleString()}`, "รายได้"]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", background: "#1f2937", color: "#fff" }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{ color: "#9ca3af" }}
                    />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Advertiser Table */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-700">
                <p className="text-white text-sm font-semibold">ถัวเฉลี่ยผลประกอบการผู้ลงโฆษณา</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left px-5 py-3 text-gray-400 font-medium text-xs">ผู้ลงโฆษณา</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs">รายได้</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">ส่วนแบ่งตลาด</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs">CTR เฉลี่ย</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium text-xs">CPM เฉลี่ย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {ADVERTISERS.map((a) => (
                      <tr key={a.name} className="hover:bg-gray-700/40 transition-colors">
                        <td className="px-5 py-3 text-white font-medium text-sm">{a.name}</td>
                        <td className="px-4 py-3 text-right text-white text-sm font-semibold">
                          ฿{a.revenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ShareBar value={a.share} />
                            <span className="text-gray-400 text-xs">{a.share}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300 text-sm">{a.ctr}%</td>
                        <td className="px-4 py-3 text-right text-gray-300 text-sm">฿{a.cpm.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Footer */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-700">
                <div>
                  <p className="text-gray-400 text-xs mb-1">สรุปรายได้</p>
                  <p className="text-gray-400 text-xs mb-2">รายได้เดือนที่แล้ว (ก.พ. 2026)</p>
                  <p className="text-white text-2xl font-bold">฿258,000</p>
                </div>
                <div className="pt-4 md:pt-0 md:pl-6">
                  <p className="text-gray-400 text-xs mb-1">&nbsp;</p>
                  <p className="text-gray-400 text-xs mb-2">คาดการณ์เดือนนี้ (มี.ค. 2026)</p>
                  <p className="text-white text-2xl font-bold">฿283,000</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight size={12} className="text-green-400" />
                    <span className="text-green-400 text-xs">เพิ่มขึ้นประมาณ +9.7%</span>
                  </div>
                </div>
                <div className="pt-4 md:pt-0 md:pl-6">
                  <p className="text-gray-400 text-xs mb-1">&nbsp;</p>
                  <p className="text-gray-400 text-xs mb-2">คาดการณ์ทั้งปี (2026)</p>
                  <p className="text-white text-2xl font-bold">฿493,000</p>
                  <p className="text-gray-500 text-xs mt-1">ม.ค. – ก.พ. สะสม</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReportPage;