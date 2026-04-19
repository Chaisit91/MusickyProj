// Route guard ตรวจสอบ login — isAuthenticated → render children | ไม่ authenticated → redirect /login
//
// หลักการทำงาน:
// 1. ตรวจ accessToken จาก Redux state — ถ้าไม่มี → Navigate to /login
// 2. ถ้ามี token → render children
// 3. ง่ายกว่า AdminRoute เพราะไม่ตรวจ role

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { accessToken } = useSelector((state: RootState) => state.auth);

  if (!accessToken) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;