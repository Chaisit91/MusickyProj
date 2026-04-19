// Card แสดงตัวเลขสถิติ — รับ props: title, value, icon, color | ใช้ใน Dashboard สำหรับแสดง total users, songs, revenue
//
// หลักการทำงาน:
// 1. card แสดงตัวเลข stat: label + value + icon + optional trend (เปลี่ยนแปลง%)
// 2. รับ props: title, value, icon, trend
// 3. ใช้ใน Dashboard สำหรับ 4 card หลัก

import React from "react";

const StatCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-gray-800 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-0">
    {icon && <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-300">{icon}</div>}
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-xl font-bold mt-0.5">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

export default StatCard;
