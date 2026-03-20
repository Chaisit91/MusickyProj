import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { logoutThunk } from "../store/auth.store";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, accessToken, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const logout = async () => {
    await dispatch(logoutThunk());
    navigate("/login", { replace: true });
  };

  const isAdmin = user?.role === "ADMIN";

  return { user, accessToken, loading, error, logout, isAdmin };
};
