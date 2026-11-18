import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import TopBar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { useDashboard } from "../../hooks/useDashboard";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
  LineElement, PointElement, Filler,
);

const chartOptions = (title: string) => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      backgroundColor: "#1f2937",
      titleColor: "#f9fafb",
      bodyColor: "#d1d5db",
      borderColor: "#374151",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: "#9ca3af", font: { size: 11 } },
      grid: { color: "#374151" },
    },
    y: {
      ticks: { color: "#9ca3af", font: { size: 11 } },
      grid: { color: "#374151" },
      beginAtZero: true,
    },
  },
});

const Dashboard = () => {
  const { stats, activities, topSongs, userGrowth, playGrowth, loading } = useDashboard();
  const fmt = (n: number) => n?.toLocaleString() ?? "—";

  const lineChartData = {
    labels: userGrowth.map(u => u.label),
    datasets: [
      {
        label: "ผู้ใช้ใหม่",
        data: userGrowth.map(u => u.count),
        borderColor: "#34D399",
        backgroundColor: "rgba(52, 211, 153, 0.15)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#34D399",
        pointRadius: 4,
      },
    ],
  };

  const playLineChartData = {
    labels: playGrowth.map(p => p.label),
    datasets: [
      {
        label: "ครั้งที่เล่น",
        data: playGrowth.map(p => p.count),
        borderColor: "#818cf8",
        backgroundColor: "rgba(129, 140, 248, 0.15)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#818cf8",
        pointRadius: 4,
      },
    ],
  };

  const barChartData = {
    labels: topSongs.length ? topSongs.map(s => s.title.length > 18 ? s.title.slice(0, 18) + "…" : s.title) : ["—"],
    datasets: [{
      label: "ครั้งที่เล่น",
      data: topSongs.length ? topSongs.map(s => s.playCount) : [0],
      backgroundColor: [
        "rgba(16, 185, 129, 0.8)",
        "rgba(59, 130, 246, 0.8)",
        "rgba(168, 85, 247, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)",
      ],
      borderColor: [
        "#10B981", "#3B82F6", "#A855F7", "#F59E0B", "#EF4444",
      ],
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const statCards = [
    { label: "ผู้ใช้ทั้งหมด", value: stats ? fmt(stats.totalUsers) : "—", sub: "ผู้ใช้ที่ลงทะเบียน", color: "text-green-400" },
    { label: "เพลงทั้งหมด", value: stats ? fmt(stats.totalSongs) : "—", sub: "เพลงในระบบ", color: "text-blue-400" },
    { label: "ศิลปินทั้งหมด", value: stats ? fmt(stats.totalArtists) : "—", sub: "ศิลปินในระบบ", color: "text-yellow-400" },
    { label: "การเล่นทั้งหมด", value: stats ? fmt(stats.totalPlays) : "—", sub: "จำนวนครั้งที่เปิดฟัง", color: "text-purple-400" },
    { label: "สมาชิก Premium", value: stats ? fmt(stats.totalPremium) : "—", sub: `Conversion ${stats?.conversionRate ?? "—"}%`, color: "text-pink-400" },
    { label: "รายได้เดือนนี้", value: stats ? `฿${stats.monthlyRevenue.toLocaleString()}` : "—", sub: "จากการสมัคร Premium", color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <div className="flex-1 p-8 flex flex-col bg-gray-500 gap-6">

            {loading && <div className="text-center py-4 text-gray-300 text-sm">กำลังโหลด...</div>}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
              {statCards.map((c) => (
                <div key={c.label} className="bg-gray-800 p-5 rounded-xl shadow-lg">
                  <p className="text-gray-400 text-xs mb-1">{c.label}</p>
                  <p className="text-2xl font-bold text-white">{c.value}</p>
                  <p className={`text-xs mt-2 ${c.color}`}>{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h3 className="text-sm font-semibold text-gray-200 mb-4">ผู้ใช้ใหม่ (6 เดือนล่าสุด)</h3>
                {userGrowth.length > 0
                  ? <Line data={lineChartData} options={chartOptions("ผู้ใช้ใหม่") as any} />
                  : <p className="text-gray-500 text-sm text-center py-10">ไม่มีข้อมูล</p>}
              </div>
              <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h3 className="text-sm font-semibold text-gray-200 mb-4">ยอดเล่นเพลง (6 เดือนล่าสุด)</h3>
                {playGrowth.length > 0
                  ? <Line data={playLineChartData} options={chartOptions("ยอดเล่น") as any} />
                  : <p className="text-gray-500 text-sm text-center py-10">ไม่มีข้อมูล</p>}
              </div>
            </div>

            {/* Charts row 2 — Top 5 songs + recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Bar chart */}
              <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h3 className="text-sm font-semibold text-gray-200 mb-4">5 เพลงที่เล่นมากที่สุด</h3>
                {topSongs.length > 0 ? (
                  <>
                    <Bar data={barChartData} options={chartOptions("top5") as any} />
                    <ul className="mt-4 space-y-2">
                      {topSongs.map((s, i) => (
                        <li key={s.id} className="flex items-center gap-3 text-xs text-gray-300">
                          <span className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{s.title}</p>
                            <p className="text-gray-500 truncate">{s.artist?.name}</p>
                          </div>
                          <span className="text-green-400 font-semibold whitespace-nowrap">
                            {s.playCount.toLocaleString()} ครั้ง
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-10">ยังไม่มีข้อมูลการเล่นเพลง</p>
                )}
              </div>

              {/* Recent activities */}
              <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h3 className="text-sm font-semibold text-gray-200 mb-4">กิจกรรมล่าสุด</h3>
                {activities.length ? (
                  <ul className="space-y-3">
                    {activities.map((a, i) => (
                      <li key={i} className="flex items-start justify-between gap-3 text-xs">
                        <span className="text-gray-300 leading-relaxed">{a.message}</span>
                        <span className="text-gray-500 whitespace-nowrap flex-shrink-0">
                          {new Date(a.createdAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-10">ไม่มีกิจกรรมล่าสุด</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
