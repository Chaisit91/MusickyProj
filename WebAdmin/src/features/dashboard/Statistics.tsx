import React from 'react';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

const Statistics = () => {
  // Sample data for the line chart (user growth)
  const lineChartData = {
    labels: ['ม.ค. 25', 'ก.พ. 25', 'มี.ค. 25', 'เม.ย. 25', 'พ.ค. 25', 'มิ.ย. 25'],
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
        data: [20000, 25000, 30000, 35000, 40000, 45000],
        borderColor: '#FBBF24',
        backgroundColor: 'rgba(255, 179, 36, 0.2)',
        fill: true,
      },
      {
        label: 'ผู้ใช้ใหม่',
        data: [5000, 7000, 9000, 12000, 15000, 18000],
        borderColor: '#34B1D1',
        backgroundColor: 'rgba(52, 177, 209, 0.2)',
        fill: true,
      },
    ],
  };

  // Sample data for the bar chart (age group distribution)
  const barChartData = {
    labels: ['15-17', '18-24', '25-34', '35-44', '45+'],
    datasets: [
      {
        label: 'ผู้ใช้ตามกลุ่มอายุ',
        data: [15000, 22000, 18000, 12000, 8000],
        backgroundColor: '#9B4E97', // สีของแถบ
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="flex">
        <div className="w-64 bg-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6">Music Admin</h2>
          <ul>
            <li className="text-gray-400 hover:text-white cursor-pointer py-2">แดชบอร์ด</li>
            <li className="text-gray-400 hover:text-white cursor-pointer py-2">การจัดการผู้ใช้</li>
            <li className="text-gray-400 hover:text-white cursor-pointer py-2">จัดการเพลง</li>
            <li className="text-gray-400 hover:text-white cursor-pointer py-2">สถิติการฟังเพลง</li>
          </ul>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {/* Statistics Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Total Users Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-2">ผู้ใช้ทั้งหมด</h3>
              <p className="text-xl">82,543</p>
              <div className="text-green-400 mt-4">+ 14.2%</div>
            </div>

            {/* New Users Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-2">ผู้ใช้ใหม่</h3>
              <p className="text-xl">71</p>
              <div className="text-blue-400 mt-4">+ 8.3%</div>
            </div>

            {/* Total Premium Users Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-2">ผู้ใช้พรีเมียม</h3>
              <p className="text-xl">27,500</p>
              <div className="text-yellow-400 mt-4">+ 22.5%</div>
            </div>

            {/* Active Users Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-2">ผู้ใช้งานจริง</h3>
              <p className="text-xl">45,280</p>
              <div className="text-red-400 mt-4">- 4.1%</div>
            </div>
          </div>

          {/* Line Chart for User Growth */}
          <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">การเติบโตของผู้ใช้</h3>
            <Line data={lineChartData} height={300} />
          </div>

          {/* Bar Chart for Age Distribution */}
          <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">ผู้ใช้ตามกลุ่มอายุ</h3>
            <Bar data={barChartData} height={300} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;