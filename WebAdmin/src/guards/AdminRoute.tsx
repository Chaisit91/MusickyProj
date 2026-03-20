import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

interface Props {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: Props) => {
  const { accessToken, user } = useSelector((state: RootState) => state.auth);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/forbidden" replace />;

  return <>{children}</>;
};

export default AdminRoute;