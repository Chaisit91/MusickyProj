import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    // ฟังก์ชันการนำทางไปยังหน้าต่างๆ
    const handleNavigation = (path: string) => {
        navigate(path);  // ใช้ `navigate` เพื่อเปลี่ยนเส้นทาง
    };

    return (
        <div className="w-80 bg-gray-800 p-8 flex flex-col border-r border-gray-700 min-h-screen">
            <h2 className="text-2xl font-semibold mb-8 flex items-center justify-center text-green-500">Musicky Admin</h2>
            <ul className="space-y-8">
                <li onClick={() => handleNavigation('/dashboard')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">แดชบอร์ด</li>
                <li onClick={() => handleNavigation('/statistics')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">สถิติผู้ใช้</li>
                <li onClick={() => handleNavigation('/users')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการผู้ใช้</li>
                <li onClick={() => handleNavigation('/songs')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการเพลง</li>
                <li onClick={() => handleNavigation('/categories')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการหมวดหมู่</li>
                <li onClick={() => handleNavigation('/ads')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการโฆษณา</li>
                <li onClick={() => handleNavigation('/revenue')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">รายได้โฆษณา</li>
            </ul>
        </div>
    );
};

export default Sidebar;