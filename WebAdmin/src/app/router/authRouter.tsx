import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "../../features/auth/AdminLogin";
import Dashboard from "../../features/dashboard/Dashboard";
import AdminRoute from "../../guards/AdminRoute";
import ForbiddenPage from "../../pages/ForbiddenPage";
import NotFoundPage from "../../pages/NotFoundPage";

const AuthRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="/dashboard" element={
        <AdminRoute>
          <Dashboard />
        </AdminRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AuthRouter;