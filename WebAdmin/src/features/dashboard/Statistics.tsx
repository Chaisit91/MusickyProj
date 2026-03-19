import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Sidebar from '../../components/layout/Sidebar';

ChartJS.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

const Statistics = () => {
    // ข้อมูลการเติบโตของผู้ใช้ (Line Chart)
    const lineChartData = {
        labels: ['25 ม.ค. 25', '26 ม.ค. 25', '27 ม.ค. 25', '28 ม.ค. 25', '29 ม.ค. 25', '1 ก.พ. 25'],
        datasets: [
            {
                label: 'ผู้ใช้ทั้งหมด',
                data: [25000, 30000, 35000, 40000, 45000, 50000],
                borderColor: '#34D399',
                backgroundColor: 'rgba(52, 211, 153, 0.2)',
                fill: true,
            },
            {
                label: 'ผู้ใช้ฟรี',
                data: [20000, 22000, 25000, 29000, 33000, 37000],
                borderColor: '#FBBF24',
                backgroundColor: 'rgba(255, 180, 92, 0.2)',
                fill: true,
            },
            {
                label: 'ผู้ใช้ใหม่',
                data: [1000, 2000, 3000, 4000, 5000, 6000],
                borderColor: '#F87171',
                backgroundColor: 'rgba(248, 113, 113, 0.2)',
                fill: true,
            },
        ],
    };

    // ข้อมูลการแบ่งผู้ใช้ตามช่วงอายุ (Bar Chart)
    const barChartData = {
        labels: ['15-17', '18-24', '25-34', '35-44', '45+'],
        datasets: [
            {
                label: 'ผู้ใช้ตามช่วงอายุ',
                data: [5000, 25000, 15000, 10000, 5000],
                backgroundColor: '#A78BFA',
            },
        ],
    };

    // สัดส่วนผู้ใช้ฟรี vs พรีเมียม
    const userStatsData = {
        labels: ['ผู้ใช้ฟรี', 'ผู้ใช้พรีเมียม'],
        datasets: [
            {
                data: [55043, 27500],
                backgroundColor: ['#10B981', '#FBBF24'],
            },
        ],
    };

    return (

        <div className='flex min-h-screen'>
            <Sidebar />
            {/* ข้อมูลสถิติผู้ใช้ */}
            <div className="flex-1 flex flex-col text-white">
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

                    {/* Line Chart (การเติบโตของผู้ใช้) */}
                    <div className="flex justify-between gap-2">
                        <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg w-full sm:w-[50%]">
                            <h3 className="text-xl font-semibold mb-4">การเติบโตของผู้ใช้</h3>
                            <Line data={lineChartData} />
                        </div>

                        {/* Bar Chart (ผู้ใช้ตามช่วงอายุ) */}
                        <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg w-full sm:w-[50%]">
                            <h3 className="text-xl font-semibold mb-4">ผู้ใช้ตามช่วงอายุ</h3>
                            <Bar data={barChartData} />
                        </div>
                    </div>
                    <div className="flex justify-between gap-2">
                        {/* สัดส่วนผู้ใช้ฟรี vs พรีเมียม */}
                        <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg sm:w-[50%]">
                            <h3 className="text-xl font-semibold mb-4">สัดส่วนผู้ใช้</h3>
                            <div className="relative h-12 bg-gray-600 rounded-lg overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-green-500"
                                    style={{ width: '66.7%' }}
                                />
                                <div
                                    className="absolute top-0 right-0 h-full bg-yellow-500"
                                    style={{ width: '33.3%' }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-sm text-gray-400">
                                <span>ผู้ใช้ฟรี: 55,043</span>
                                <span>ผู้ใช้พรีเมียม: 27,500</span>
                            </div>
                        </div>

                        {/* กิจกรรมล่าสุด */}
                        <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg sm:w-[50%]">
                            <h3 className="text-xl font-semibold mb-4">ผู้ใช้งานจริง</h3>
                            <ul className="space-y-4">
                                <li className="flex justify-between text-sm text-white ">
                                    <span>ผู้ฝช้รายวัน</span>
                                    <span className='text-lg'>55,043</span>
                                </li>
                                <li className="flex justify-between text-sm text-white">
                                    <span>ผู้ใช้รายสัปดาห์</span>
                                    <span className='text-lg'>12,345</span>
                                </li>
                                <li className="flex justify-between text-sm text-white">
                                    <span>ผู้ใช้รายเดือน</span>
                                    <span className='text-lg'>78,456</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;