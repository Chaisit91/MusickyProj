import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { logoutThunk } from "../store/auth.store";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  //  ไม่มี refreshToken ใน state แล้ว — อยู่ใน HttpOnly Cookie ฝั่ง browser
  const { user, accessToken, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const logout = async () => {
    await dispatch(logoutThunk());
    // backend จะ clearCookie refreshToken ให้อัตโนมัติ
    navigate("/login", { replace: true });
  };

  const isAdmin = user?.role === "ADMIN";
  const isAuthenticated = !!accessToken && !!user;

  return { user, accessToken, loading, error, logout, isAdmin, isAuthenticated };
};