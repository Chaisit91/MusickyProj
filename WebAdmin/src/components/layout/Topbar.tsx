import React from "react";
import { Search, Bell } from "lucide-react";

interface TopBarProps {
  lang?: "ไทย" | "EN";
  onLangChange?: (lang: "ไทย" | "EN") => void;
}

const TopBar: React.FC<TopBarProps> = ({ lang = "ไทย", onLangChange }) => {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="ค้นหา..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-black"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Language Switcher */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
          {(["ไทย", "EN"] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange?.(l)}
              className={`px-3 py-1.5 transition-colors ${
                lang === l
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Bell */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
          <div className="text-right">
            <p className="text-xs font-medium text-gray-800 leading-tight">
              ผู้ดูแลระบบ
            </p>
            <p className="text-xs text-gray-500 leading-tight">แอดมิน</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopBar;