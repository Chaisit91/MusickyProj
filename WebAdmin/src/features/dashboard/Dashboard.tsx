import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import TopBar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { useDashboard } from "../../hooks/useDashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { stats, activities, topSongs, loading } = useDashboard();
  const fmt = (n: number) => n?.toLocaleString() ?? "—";

  const barChartData = {
    labels: topSongs.length ? topSongs.map(s => s.title) : ["—"],
    datasets: [{
      label: "การเล่นมากที่สุด",
      data: topSongs.length ? topSongs.map(s => s.playCount) : [0],
      backgroundColor: "#10B981",
    }],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar lang="ไทย" onLangChange={() => {}} />
          <div className="flex-1 p-8 flex flex-col bg-gray-500">

            {loading && <div className="text-center py-4 text-gray-300 text-sm">กำลังโหลด...</div>}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-2">ผู้ใช้ทั้งหมด</h3>
                <p className="text-xl">{stats ? fmt(stats.totalUsers) : "—"}</p>
                <div className="text-green-400 mt-4">ผู้ใช้ที่ลงทะเบียน</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-2">เพลงทั้งหมด</h3>
                <p className="text-xl">{stats ? fmt(stats.totalSongs) : "—"}</p>
                <div className="text-blue-400 mt-4">เพลงในระบบ</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-2">การเล่นทั้งหมด</h3>
                <p className="text-xl">{stats ? fmt(stats.totalPlays) : "—"}</p>
                <div className="text-purple-400 mt-4">จำนวนครั้งที่เปิดฟัง</div>
              </div>
            </div>

            {/* Top 5 Songs */}
            <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">5 เพลงที่เล่นมากที่สุด</h3>
              <Bar data={barChartData} />
            </div>

            {/* Recent Activities */}
            <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">กิจกรรมล่าสุด</h3>
              <ul className="space-y-4">
                {activities.length ? (
                  activities.map((a, i) => (
                    <li key={i} className="flex justify-between text-sm text-gray-400">
                      <span>{a.message}</span>
                      <span>{new Date(a.createdAt).toLocaleString("th-TH")}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-400">ไม่มีกิจกรรมล่าสุด</li>
                )}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;