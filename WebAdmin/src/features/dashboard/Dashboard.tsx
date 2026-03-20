import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
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
} from "chart.js";
import { logoutThunk } from "../../store/auth.store";
import type { AppDispatch, RootState } from "../../store/store";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login", { replace: true });
  };

  const lineChartData = {
    labels: ["ม.ค. 25", "ก.พ. 25", "มี.ค. 25", "เม.ย. 25", "พ.ค. 25", "มิ.ย. 25"],
    datasets: [
      {
        label: "ผู้ใช้ทั้งหมด",
        data: [25000, 30000, 35000, 40000, 45000, 50000],
        borderColor: "#34D399",
        backgroundColor: "rgba(52, 211, 153, 0.2)",
        fill: true,
      },
      {
        label: "ผู้ใช้ฟรี",
        data: [20000, 25000, 30000, 35000, 40000, 45000],
        borderColor: "#FBBF24",
        backgroundColor: "rgba(255, 179, 36, 0.2)",
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels: ["Midnight Drive", "City Lights", "Mountain High", "Dreamland", "Sunset Bliss"],
    datasets: [
      {
        label: "การเล่นมากที่สุด",
        data: [105000, 95000, 80000, 75000, 70000],
        backgroundColor: "#10B981",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <div className="w-64 bg-gray-800 p-6 flex flex-col border-r border-gray-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center justify-center text-green-500">
            Musicky Admin
          </h2>
          <ul className="space-y-4 flex-1">
            <li className="text-gray-400 hover:text-white cursor-pointer py-2 flex justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">แดชบอร์ด</li>
            <li className="text-gray-400 hover:text-white cursor-pointer py-2 flex justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">สถิติผู้ใช้</li>
            <li className="text-gray-400 hover:text-white cursor-pointer py-2 flex justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการผู้ใช้</li>
            <li className="text-gray-400 hover:text-white cursor-pointer py-2 flex justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการเพลง</li>
            <li className="text-gray-400 hover:text-white cursor-pointer py-2 flex justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการหมวดหมู่</li>
            <li className="text-gray-400 hover:text-white cursor-pointer py-2 flex justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการโฆษณา</li>
            <li className="text-gray-400 hover:text-white cursor-pointer py-2 flex justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">รายได้โฆษณา</li>
          </ul>

          {/* User info + Logout */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            <p className="text-sm text-gray-400 mb-1 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 mb-4 truncate">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="w-full p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col bg-gray-500">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-2">ผู้ใช้ทั้งหมด</h3>
              <p className="text-xl">82,543</p>
              <div className="text-green-400 mt-4">+ 14.2%</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-2">เพลงที่เล่นทั้งหมด</h3>
              <p className="text-xl">15,847</p>
              <div className="text-blue-400 mt-4">+ 8.3%</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-2">การเล่นทั้งหมด</h3>
              <p className="text-xl">2.4M</p>
              <div className="text-purple-400 mt-4">+ 18.7%</div>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg w-full sm:w-[50%]">
              <h3 className="text-xl font-semibold mb-4">การเติบโตของผู้ใช้</h3>
              <Line data={lineChartData} />
            </div>
            <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg w-full sm:w-[50%]">
              <h3 className="text-xl font-semibold mb-4">5 เพลงที่เล่นมากที่สุด</h3>
              <Bar data={barChartData} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">กิจกรรมล่าสุด</h3>
            <ul className="space-y-4">
              <li className="flex justify-between text-sm text-gray-400">
                <span>สาธิต การสร้างบัญชี</span>
                <span>5 นาทีที่แล้ว</span>
              </li>
              <li className="flex justify-between text-sm text-gray-400">
                <span>สวัสดี โลกใหญ่</span>
                <span>12 นาทีที่แล้ว</span>
              </li>
              <li className="flex justify-between text-sm text-gray-400">
                <span>วรรณา สุบิน</span>
                <span>28 นาทีที่แล้ว</span>
              </li>
              <li className="flex justify-between text-sm text-gray-400">
                <span>ธนารา ปัญจอง</span>
                <span>45 นาทีที่แล้ว</span>
              </li>
              <li className="flex justify-between text-sm text-gray-400">
                <span>สิลา ครูสำรวย</span>
                <span>1 ชั่วโมงที่แล้ว</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;