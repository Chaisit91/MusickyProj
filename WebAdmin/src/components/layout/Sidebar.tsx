import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../../store/auth.store';
import type { AppDispatch, RootState } from '../../store/store';
import { LayoutDashboard, Users, Music, Tag, Megaphone, Mic, Disc, LogOut } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'สถิติภาพรวม', icon: LayoutDashboard },
  { path: '/users', label: 'จัดการผู้ใช้', icon: Users },
  { path: '/artists', label: 'จัดการศิลปิน', icon: Mic },
  { path: '/albums', label: 'จัดการอัลบั้ม', icon: Disc },
  { path: '/songs', label: 'จัดการเพลง', icon: Music },
  { path: '/Genres', label: 'จัดการหมวดหมู่', icon: Tag },
  { path: '/ads', label: 'จัดการโฆษณา', icon: Megaphone },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login', { replace: true });
  };

  return (
    <div className="w-64 bg-gray-900 flex flex-col border-r border-gray-700 min-h-screen">
      <div className="px-6 py-6 border-b border-gray-700">
        <h2 className="text-lg font-bold text-green-400 tracking-wide">Musicky Admin</h2>
      </div>

      <ul className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <li key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium
                ${isActive
                  ? 'bg-green-500/10 text-green-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}>
              <Icon size={16} />
              {label}
            </li>
          );
        })}
      </ul>

      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-sm text-gray-300 font-medium truncate mb-0.5">{user?.name}</p>
        <p className="text-xs text-gray-500 mb-3 truncate">{user?.email}</p>
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-sm font-medium transition-colors">
          <LogOut size={14} />ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
