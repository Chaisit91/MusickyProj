import React from 'react';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/Topbar';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);


const Dashboard = () => {
    // Sample data for the line chart (user growth)
    const lineChartData = {
        labels: ['ม.ค. 25', 'ก.พ. 25', 'มี.ค. 25', 'เม.ย. 25', 'พ.ค. 25', 'มิ.ย. 25'],
        datasets: [
            {
                label: 'ผู้ใช้ทั้งหมด',
                data: [25000, 30000, 35000, 35000, 50000, 50000],
                borderColor: '#34D399', // สีเส้น
                backgroundColor: 'rgba(52, 211, 153, 0.2)', // สีพื้นหลังของเส้น
                fill: true,
            },
            {
                label: 'ผู้ใช้ฟรี',
                data: [20000, 40000, 30000, 40000, 40000, 45000],
                borderColor: '#FBBF24', // สีเส้น
                backgroundColor: 'rgba(255, 179, 36, 0.2)', // สีพื้นหลังของเส้น
                fill: true,
            },
        ],
    };

    // Sample data for the bar chart (Top 5 Songs)
    const barChartData = {
        labels: ['Midnight Drive', 'City Lights', 'Mountain High', 'Dreamland', 'Sunset Bliss'],
        datasets: [
            {
                label: 'การเล่นมากที่สุด',
                data: [105000, 95000, 80000, 75000, 70000],
                backgroundColor: '#10B981', // สีของแถบ
            },
        ],
    };


    return (

        <div className='flex min-h-screen'>
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <TopBar />
                {/* ข้อมูลสถิติผู้ใช้ */}
                <div className="flex-1 flex text-white">
                    {/* Content */}
                    <div className="flex-1 p-8 flex flex-col bg-gray-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {/* User Stats Cards */}
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

                        {/* Line Chart */}
                        <div className='flex justify-between gap-2 '>
                            <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg w-full sm:w-[50%]">
                                <h3 className="text-xl font-semibold mb-4">การเติบโตของผู้ใช้</h3>
                                <Line data={lineChartData} />
                            </div>

                            {/* Bar Chart */}
                            <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg w-full sm:w-[50%]">
                                <h3 className="text-xl font-semibold mb-4">5 เพลงที่เล่นมากที่สุด</h3>
                                <Bar data={barChartData} />
                            </div>
                        </div>

                        {/* Recent Activities */}
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
        </div>
    );
};


export default Dashboard;