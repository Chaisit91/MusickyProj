import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutThunk } from "../store/auth.store";
import type { AppDispatch } from "../store/store";

const ForbiddenPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleBackToLogin = async () => {
    await dispatch(logoutThunk());
    navigate("/login", { replace: true });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold text-red-500">403</h1>
      <p className="text-xl mt-4">Access Denied</p>
      <button
        onClick={handleBackToLogin}
        className="mt-6 text-green-500 hover:underline"
      >
        Back to Login
      </button>
    </div>
  );
};

export default ForbiddenPage;