import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLogin from '../../features/auth/AdminLogin';
import Dashboard from '../../features/dashboard/Dashboard';
import Statistics from '../../features/dashboard/Statistics';
import UserManagementPage from '../../features/dashboard/Usermanagement';


const AuthRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/users" element={<UserManagementPage />} />
    </Routes>
  );
};

export default AuthRouter;