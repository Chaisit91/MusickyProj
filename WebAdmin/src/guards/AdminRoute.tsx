// Route guard ตรวจสิทธิ์ admin — isAuthenticated + role=ADMIN → render children | ไม่ authenticated → redirect /login | authenticated แต่ไม่ใช่ admin → redirect /forbidden
//
// หลักการทำงาน:
// 1. ใช้ useAuth hook ดึง isAuthenticated + isAdmin
// 2. ถ้าไม่ authenticated → Navigate to /login
// 3. ถ้า authenticated แต่ไม่ใช่ admin → Navigate to /forbidden
// 4. ถ้าผ่านทั้งคู่ → render children (หรือ Outlet)

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { refreshTokenThunk } from "../store/auth.store";

interface Props {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, user } = useSelector((state: RootState) => state.auth);
  const [checking, setChecking] = useState(!accessToken);

  useEffect(() => {
    if (!accessToken) {
      dispatch(refreshTokenThunk()).finally(() => setChecking(false));
    }
  }, []);

  // กำลังตรวจสอบ cookie → แสดง loading แทน redirect
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!accessToken) return <Navigate to="/login" replace />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role.toLowerCase() !== "admin") return <Navigate to="/forbidden" replace />;

  return <>{children}</>;
};

export default AdminRoute;
