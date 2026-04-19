// กำหนด routes ทั้งหมดของ WebAdmin — /login, /forbidden, /dashboard, /users, /artists, /albums, /songs, /songs/:artistId, /Genres, /ads, /payments, /support | ครอบด้วย AdminRoute guard
//
// หลักการทำงาน:
// 1. กำหนด routes ทั้งหมด: /login → AdminLogin, / + /dashboard/... → protected routes ครอบ AdminRoute
// 2. AdminRoute ตรวจ isAuthenticated + isAdmin ก่อนแสดง children — redirect /login ถ้าไม่ผ่าน
// 3. ProtectedRoute: ตรวจ isAuthenticated อย่างเดียว (ไม่ตรวจ role)
// 4. Sidebar + Outlet pattern: layout มี Sidebar ซ้าย, Outlet เปลี่ยนตาม route ขวา

import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "../../features/auth/AdminLogin";
import Dashboard from "../../features/dashboard/Dashboard";
import AdminRoute from "../../guards/AdminRoute";
import ForbiddenPage from "../../pages/ForbiddenPage";
import NotFoundPage from "../../pages/NotFoundPage";
import UserManagementPage from "../../features/dashboard/Usermanagement";
import SongManagementPage from "../../features/dashboard/Songmanagement";
import ArtistSongsPage from "../../features/dashboard/ArtistSongs";
import GenreManagementPage from "../../features/dashboard/GenreManagement";
import AdManagementPage from "../../features/dashboard/Admanagement";
import ArtistManagementPage from "../../features/dashboard/ArtistManagement";
import AlbumManagementPage from "../../features/dashboard/AlbumManagement";
import PaymentManagementPage from "../../features/dashboard/PaymentManagement";
import SupportManagementPage from "../../features/dashboard/SupportManagement";

const AuthRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
      <Route path="/artists" element={<AdminRoute><ArtistManagementPage /></AdminRoute>} />
      <Route path="/albums" element={<AdminRoute><AlbumManagementPage /></AdminRoute>} />
      <Route path="/songs" element={<AdminRoute><SongManagementPage /></AdminRoute>} />
      <Route path="/songs/:artistId" element={<AdminRoute><ArtistSongsPage /></AdminRoute>} />
      <Route path="/Genres" element={<AdminRoute><GenreManagementPage /></AdminRoute>} />
      <Route path="/ads" element={<AdminRoute><AdManagementPage /></AdminRoute>} />
      <Route path="/payments" element={<AdminRoute><PaymentManagementPage /></AdminRoute>} />
      <Route path="/support" element={<AdminRoute><SupportManagementPage /></AdminRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AuthRouter;
