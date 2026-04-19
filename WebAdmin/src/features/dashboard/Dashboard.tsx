// หน้า Dashboard หลัก — StatCards: total users/songs/artists/revenue + กราฟรายได้รายเดือน | ใช้ useDashboard hook
//
// หลักการทำงาน:
// 1. useDashboard hook โหลด stats, activities, topSongs, growth data
// 2. แสดง StatCards (total users, songs, artists, revenue)
// 3. วาดกราฟ Bar (monthly revenue) และ Line (growth trend) ด้วย Chart.js
// 4. แสดง recent activities list และ top songs table

// นำเข้า component กราฟแท่ง (Bar) และกราฟเส้น (Line) จาก react-chartjs-2
import { Bar, Line } from "react-chartjs-2";
// นำเข้า plugin และ scale ทั้งหมดที่จำเป็นสำหรับ Chart.js
import {
  Chart as ChartJS,
  CategoryScale,   // scale สำหรับแกน X ประเภท category (ข้อความ)
  LinearScale,     // scale สำหรับแกน Y ประเภทตัวเลข
  BarElement,      // element สำหรับกราฟแท่ง
  Title,           // plugin แสดงชื่อกราฟ
  Tooltip,         // plugin แสดง tooltip เมื่อ hover
  Legend,          // plugin แสดงตำนานสี
  LineElement,     // element สำหรับเส้นกราฟ
  PointElement,    // element สำหรับจุดบนเส้นกราฟ
  Filler,          // plugin สำหรับ fill ใต้เส้นกราฟ
} from "chart.js";
// Layout components ของหน้า dashboard
import TopBar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
// custom hook ดึงข้อมูล stats, activities, topSongs, growth จาก API
import { useDashboard } from "../../hooks/useDashboard";

// ลงทะเบียน plugin และ scale ทั้งหมดกับ Chart.js ก่อนใช้งาน
// หากไม่ register จะ error เนื่องจาก Chart.js v3+ ต้องลงทะเบียนเอง
ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
  LineElement, PointElement, Filler,
);

// ฟังก์ชันสร้าง options กราฟที่ใช้ซ้ำได้ รับ title แต่ไม่แสดงในกราฟ (display: false)
const chartOptions = (title: string) => ({
  responsive: true, // ปรับขนาดกราฟตาม container อัตโนมัติ
  plugins: {
    legend: { display: false }, // ซ่อน legend เพราะมีแค่ dataset เดียว
    title: { display: false },  // ซ่อนชื่อกราฟ ใช้ h3 แทน
    tooltip: {
      // ปรับสี tooltip ให้เข้ากับ dark theme
      backgroundColor: "#1f2937",
      titleColor: "#f9fafb",
      bodyColor: "#d1d5db",
      borderColor: "#374151",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      // สีตัวเลขและเส้น grid แกน X ให้เข้ากับ dark theme
      ticks: { color: "#9ca3af", font: { size: 11 } },
      grid: { color: "#374151" },
    },
    y: {
      // สีตัวเลขและเส้น grid แกน Y
      ticks: { color: "#9ca3af", font: { size: 11 } },
      grid: { color: "#374151" },
      beginAtZero: true, // เริ่มแกน Y จาก 0 เสมอ
    },
  },
});

const Dashboard = () => {
  // ดึงข้อมูลทั้งหมดจาก custom hook:
  // stats = สถิติรวม, activities = กิจกรรมล่าสุด, topSongs = เพลงยอดนิยม
  // userGrowth = จำนวนผู้ใช้ใหม่ต่อเดือน, playGrowth = ยอดเล่นต่อเดือน
  const { stats, activities, topSongs, userGrowth, playGrowth, loading } = useDashboard();
  // helper function แปลงตัวเลขเป็น format มี comma เช่น 1000 → "1,000"
  // ถ้าค่าเป็น null/undefined แสดง "—" แทน
  const fmt = (n: number) => n?.toLocaleString() ?? "—";

  // ข้อมูลกราฟเส้น: จำนวนผู้ใช้ใหม่ต่อเดือน (6 เดือนล่าสุด)
  const lineChartData = {
    labels: userGrowth.map(u => u.label), // label ของแต่ละเดือน เช่น "ม.ค."
    datasets: [
      {
        label: "ผู้ใช้ใหม่",
        data: userGrowth.map(u => u.count), // จำนวนผู้ใช้ใหม่แต่ละเดือน
        borderColor: "#34D399",                        // สีเส้นกราฟ (เขียว)
        backgroundColor: "rgba(52, 211, 153, 0.15)",  // สี fill ใต้เส้น (โปร่งแสง)
        fill: true,       // เติมสีใต้เส้น
        tension: 0.4,     // ความโค้งของเส้น (0 = ตรง, 1 = โค้งมาก)
        pointBackgroundColor: "#34D399", // สีจุดบนเส้นกราฟ
        pointRadius: 4,   // ขนาดจุดบนเส้นกราฟ
      },
    ],
  };

  // ข้อมูลกราฟเส้น: ยอดเล่นเพลงต่อเดือน (6 เดือนล่าสุด)
  const playLineChartData = {
    labels: playGrowth.map(p => p.label), // label เดือน
    datasets: [
      {
        label: "ครั้งที่เล่น",
        data: playGrowth.map(p => p.count), // ยอดเล่นแต่ละเดือน
        borderColor: "#818cf8",                        // สีเส้น (ม่วง)
        backgroundColor: "rgba(129, 140, 248, 0.15)", // สี fill ใต้เส้น
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#818cf8",
        pointRadius: 4,
      },
    ],
  };

  // ข้อมูลกราฟแท่ง: 5 เพลงที่เล่นมากที่สุด
  const barChartData = {
    // ตัดชื่อเพลงที่ยาวเกิน 18 ตัวอักษรให้เหลือ "..." เพื่อไม่ให้ label ยาวเกิน
    // ถ้าไม่มีเพลงใช้ ["—"] แทน
    labels: topSongs.length ? topSongs.map(s => s.title.length > 18 ? s.title.slice(0, 18) + "…" : s.title) : ["—"],
    datasets: [{
      label: "ครั้งที่เล่น",
      data: topSongs.length ? topSongs.map(s => s.playCount) : [0], // ยอดเล่นแต่ละเพลง
      // สีแท่งแต่ละอันต่างกัน (เขียว, น้ำเงิน, ม่วง, เหลือง, แดง)
      backgroundColor: [
        "rgba(16, 185, 129, 0.8)",
        "rgba(59, 130, 246, 0.8)",
        "rgba(168, 85, 247, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)",
      ],
      // สี border แต่ละแท่ง
      borderColor: [
        "#10B981", "#3B82F6", "#A855F7", "#F59E0B", "#EF4444",
      ],
      borderWidth: 1,   // ความหนา border
      borderRadius: 6,  // มุมโค้งของแท่ง
    }],
  };

  // ข้อมูล stat card ทั้ง 6 ช่อง: label, value (ฟอร์แมตแล้ว), sub text, สี
  const statCards = [
    { label: "ผู้ใช้ทั้งหมด", value: stats ? fmt(stats.totalUsers) : "—", sub: "ผู้ใช้ที่ลงทะเบียน", color: "text-green-400" },
    { label: "เพลงทั้งหมด", value: stats ? fmt(stats.totalSongs) : "—", sub: "เพลงในระบบ", color: "text-blue-400" },
    { label: "ศิลปินทั้งหมด", value: stats ? fmt(stats.totalArtists) : "—", sub: "ศิลปินในระบบ", color: "text-yellow-400" },
    { label: "การเล่นทั้งหมด", value: stats ? fmt(stats.totalPlays) : "—", sub: "จำนวนครั้งที่เปิดฟัง", color: "text-purple-400" },
    { label: "สมาชิก Premium", value: stats ? fmt(stats.totalPremium) : "—", sub: `Conversion ${stats?.conversionRate ?? "—"}%`, color: "text-pink-400" },
    { label: "รายได้เดือนนี้", value: stats ? `฿${stats.monthlyRevenue.toLocaleString()}` : "—", sub: "จากการสมัคร Premium", color: "text-amber-400" },
  ];

  return (
    // layout หลัก: พื้นหลังเทาเข้ม เต็มหน้าจอ
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        {/* Sidebar เมนูด้านซ้าย */}
        <Sidebar />
        <div className="flex-1 flex flex-col">
          {/* TopBar แถบด้านบน */}
          <TopBar />
          {/* content area: padding รอบด้าน, flex column, gap ระหว่าง section */}
          <div className="flex-1 p-8 flex flex-col bg-gray-500 gap-6">

            {/* แสดง loading indicator ขณะโหลดข้อมูลจาก API */}
            {loading && <div className="text-center py-4 text-gray-300 text-sm">กำลังโหลด...</div>}

            {/* Stat Cards: grid แสดง 6 ช่องสถิติสำคัญ
                responsive: 2 คอลัมน์บนจอเล็ก, 3 คอลัมน์บนจอกลาง, 6 คอลัมน์บนจอใหญ่ */}
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
              {statCards.map((c) => (
                // แต่ละ card: พื้นหลัง gray-800, padding, มุมโค้ง, เงา
                <div key={c.label} className="bg-gray-800 p-5 rounded-xl shadow-lg">
                  {/* label ขนาดเล็ก สีเทา */}
                  <p className="text-gray-400 text-xs mb-1">{c.label}</p>
                  {/* ค่าตัวเลขขนาดใหญ่ ตัวหนา */}
                  <p className="text-2xl font-bold text-white">{c.value}</p>
                  {/* sub text แสดงรายละเอียดเพิ่มเติม สีตามที่กำหนดต่อ card */}
                  <p className={`text-xs mt-2 ${c.color}`}>{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Charts row 1: กราฟเส้น 2 อัน (ผู้ใช้ใหม่ + ยอดเล่น) แสดงคู่กัน */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* กราฟเส้นผู้ใช้ใหม่ */}
              <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h3 className="text-sm font-semibold text-gray-200 mb-4">ผู้ใช้ใหม่ (6 เดือนล่าสุด)</h3>
                {/* แสดงกราฟถ้ามีข้อมูล หรือแสดงข้อความถ้าไม่มี */}
                {userGrowth.length > 0
                  ? <Line data={lineChartData} options={chartOptions("ผู้ใช้ใหม่") as any} />
                  : <p className="text-gray-500 text-sm text-center py-10">ไม่มีข้อมูล</p>}
              </div>
              {/* กราฟเส้นยอดเล่นเพลง */}
              <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h3 className="text-sm font-semibold text-gray-200 mb-4">ยอดเล่นเพลง (6 เดือนล่าสุด)</h3>
                {playGrowth.length > 0
                  ? <Line data={playLineChartData} options={chartOptions("ยอดเล่น") as any} />
                  : <p className="text-gray-500 text-sm text-center py-10">ไม่มีข้อมูล</p>}
              </div>
            </div>

            {/* Charts row 2: กราฟแท่ง Top 5 เพลง + กิจกรรมล่าสุด */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* กราฟแท่ง: 5 เพลงยอดนิยม */}
              <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h3 className="text-sm font-semibold text-gray-200 mb-4">5 เพลงที่เล่นมากที่สุด</h3>
                {topSongs.length > 0 ? (
                  <>
                    {/* กราฟแท่งด้านบน */}
                    <Bar data={barChartData} options={chartOptions("top5") as any} />
                    {/* รายการเพลงด้านล่างกราฟ พร้อมอันดับ, ชื่อ, ศิลปิน, จำนวนเล่น */}
                    <ul className="mt-4 space-y-2">
                      {topSongs.map((s, i) => (
                        <li key={s.id} className="flex items-center gap-3 text-xs text-gray-300">
                          {/* วงกลมแสดงอันดับ */}
                          <span className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            {/* ชื่อเพลง truncate กันยาวเกิน */}
                            <p className="font-medium text-white truncate">{s.title}</p>
                            {/* ชื่อศิลปิน */}
                            <p className="text-gray-500 truncate">{s.artist?.name}</p>
                          </div>
                          {/* จำนวนครั้งที่เล่น แสดงสีเขียว */}
                          <span className="text-green-400 font-semibold whitespace-nowrap">
                            {s.playCount.toLocaleString()} ครั้ง
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  // กรณีไม่มีข้อมูล
                  <p className="text-gray-500 text-sm text-center py-10">ยังไม่มีข้อมูลการเล่นเพลง</p>
                )}
              </div>

              {/* กิจกรรมล่าสุดในระบบ */}
              <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h3 className="text-sm font-semibold text-gray-200 mb-4">กิจกรรมล่าสุด</h3>
                {activities.length ? (
                  <ul className="space-y-3">
                    {activities.map((a, i) => (
                      // แต่ละกิจกรรม: message + เวลา (format ภาษาไทย)
                      <li key={i} className="flex items-start justify-between gap-3 text-xs">
                        <span className="text-gray-300 leading-relaxed">{a.message}</span>
                        {/* แปลง timestamp เป็น format วันที่และเวลาภาษาไทย */}
                        <span className="text-gray-500 whitespace-nowrap flex-shrink-0">
                          {new Date(a.timestamp).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // กรณีไม่มีกิจกรรม
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
