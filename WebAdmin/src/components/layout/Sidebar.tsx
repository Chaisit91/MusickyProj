import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../../store/auth.store';
import type { AppDispatch, RootState } from '../../store/store';

const Sidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const handleLogout = async () => {
        await dispatch(logoutThunk());
        navigate('/login', { replace: true });
    };

    return (
        <div className="w-80 bg-gray-800 p-8 flex flex-col border-r border-gray-700 min-h-screen">
            <h2 className="text-2xl font-semibold mb-8 flex items-center justify-center text-green-500">
                Musicky Admin
            </h2>

            <ul className="flex-1 flex flex-col gap-2">
                <li onClick={() => handleNavigation('/dashboard')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">แดชบอร์ด</li>
                <li onClick={() => handleNavigation('/statistics')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">สถิติผู้ใช้</li>
                <li onClick={() => handleNavigation('/users')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการผู้ใช้</li>
                <li onClick={() => handleNavigation('/songs')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการเพลง</li>
                <li onClick={() => handleNavigation('/categories')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการหมวดหมู่</li>
                <li onClick={() => handleNavigation('/ads')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">จัดการโฆษณา</li>
                <li onClick={() => handleNavigation('/revenue')} className="text-gray-400 hover:text-white cursor-pointer py-4 justify-between rounded-md w-full bg-gray-800 hover:bg-black transition duration-300 p-12">รายได้โฆษณา</li>
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
    );
};

export default Sidebar;