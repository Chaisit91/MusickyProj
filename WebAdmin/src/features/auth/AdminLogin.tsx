import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginThunk, clearError } from "../../store/auth.store";
import type { AppDispatch, RootState } from "../../store/store";

interface LoginForm {
  email: string;
  password: string;
}


const AdminLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, accessToken } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  // ถ้า login อยู่แล้วให้ redirect ไป dashboard เลย
  useEffect(() => {
    if (accessToken) navigate("/dashboard", { replace: true });
  }, [accessToken, navigate]);

  // เคลียร์ error ตอน unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = (data: LoginForm) => {
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
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@gmail\.com$/i,
                message: "Only @gmail.com is allowed",
              },
            })}
            className="w-full p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className="w-full p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* API Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900 text-red-300 text-sm">
            {error}
          </div>
        )}

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