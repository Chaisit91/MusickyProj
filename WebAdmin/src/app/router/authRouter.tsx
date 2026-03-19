import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLogin from '../../features/auth/AdminLogin';

const AuthRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
    </Routes>
  );
};

export default AuthRouter;