// หน้า 404 Not Found — แสดงเมื่อ route ไม่ตรงกับที่กำหนดใน authRouter
//
// หลักการทำงาน:
// 1. แสดงข้อความ 404 Not Found สำหรับ route ที่ไม่มีอยู่
// 2. ปุ่ก "Go home" → navigate /dashboard

import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold text-green-500">404</h1>
      <p className="text-xl mt-4">Page Not Found</p>
      <button
        onClick={() => navigate("/dashboard", { replace: true })}
        className="mt-6 text-green-500 hover:underline"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default NotFoundPage;