import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginThunk, clearError } from "../../store/auth.store";
import type { AppDispatch, RootState } from "../../store/store";
import { adminLoginSchema, type AdminLoginForm } from "../../schema/adminSchema";

const AdminLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, accessToken, user } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  });

  useEffect(() => {
    if (accessToken && user) navigate("/dashboard", { replace: true });
  }, [accessToken, user, navigate]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const onSubmit = (data: AdminLoginForm) => {
    dispatch(loginThunk({ email: data.email, password: data.password }));
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-500">MUSICKY</h1>
        <h2 className="text-xl mt-4 font-semibold">ADMIN LOGIN</h2>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email (@gmail.com)"
            {...register("email", {
              onChange: () => { if (error) dispatch(clearError()); },
            })}
            className={`w-full p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 border-2 transition-colors ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-transparent focus:ring-green-500"
            }`}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            {...register("password", {
              onChange: () => { if (error) dispatch(clearError()); },
            })}
            className={`w-full p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 border-2 transition-colors ${
              errors.password || error
                ? "border-red-500 focus:ring-red-500"
                : "border-transparent focus:ring-green-500"
            }`}
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.password.message}
            </p>
          )}
          {error && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <span>⚠</span> Login failed: {error}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full p-4 rounded-lg bg-white text-black font-semibold hover:bg-green-500 hover:text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>
    </div>
  );
};

export default AdminLogin;
