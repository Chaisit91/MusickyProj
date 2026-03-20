import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "../../features/auth/AdminLogin";
import Dashboard from "../../features/dashboard/Dashboard";
import AdminRoute from "../../guards/AdminRoute";
import ForbiddenPage from "../../pages/ForbiddenPage";
import NotFoundPage from "../../pages/NotFoundPage";
import UserManagementPage from "../../features/dashboard/Usermanagement";
import SongManagementPage from "../../features/dashboard/Songmanagement";
import GenreManagementPage from "../../features/dashboard/GenreManagement";
import AdManagementPage from "../../features/dashboard/Admanagement";
import RevenueReportPage from "../../features/dashboard/Revenuereport";


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
      <Route path="/users" element={
        <AdminRoute>
          <UserManagementPage />
        </AdminRoute>
      } />
      <Route path="/songs" element={
        <AdminRoute>
          <SongManagementPage />
        </AdminRoute>
      } />
      <Route path="/songs" element={
        <AdminRoute>
          <SongManagementPage />
        </AdminRoute>
      } />
      <Route path="/Genres" element={
        <AdminRoute>
          <GenreManagementPage/>
        </AdminRoute>
      } />
      <Route path="/ads" element={
        <AdminRoute>
          <AdManagementPage/>
        </AdminRoute>
      } />
      <Route path="/revenue" element={
        <AdminRoute>
          <RevenueReportPage/>
        </AdminRoute>
      } />



      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AuthRouter;