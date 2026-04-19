// หน้า Login ของ Admin — form email/password (zod validation) | dispatch loginThunk → redirect /dashboard
//
// หลักการทำงาน:
// 1. react-hook-form + zod validate email/password
// 2. onSubmit: dispatch loginThunk → ถ้าสำเร็จ navigate /dashboard
// 3. ถ้า error: แสดง server error message

// นำเข้า useEffect สำหรับตรวจสอบสถานะหลัง login และทำความสะอาด error
import { useEffect } from "react";
// useForm ใช้จัดการ form state, validation และ error ของ react-hook-form
import { useForm } from "react-hook-form";
// zodResolver เชื่อม Zod schema กับ react-hook-form เพื่อ validate อัตโนมัติ
import { zodResolver } from "@hookform/resolvers/zod";
// useDispatch ส่ง action ไปยัง Redux store, useSelector อ่าน state จาก store
import { useDispatch, useSelector } from "react-redux";
// useNavigate ใช้เปลี่ยนหน้าแบบ programmatic
import { useNavigate } from "react-router-dom";
// loginThunk คือ async action สำหรับเรียก API login, clearError ล้าง error state
import { loginThunk, clearError } from "../../store/auth.store";
// type ของ dispatch และ state ทั้งหมด
import type { AppDispatch, RootState } from "../../store/store";
// schema และ type สำหรับ validate ฟอร์ม login ของ admin
import { adminLoginSchema, type AdminLoginForm } from "../../schema/adminSchema";

const AdminLogin = () => {
  // dispatch ใช้ส่ง action (login, clearError) ไปยัง Redux
  const dispatch = useDispatch<AppDispatch>();
  // navigate ใช้เปลี่ยนหน้าหลัง login สำเร็จ
  const navigate = useNavigate();
  // ดึง loading, error, accessToken, user จาก auth state ใน Redux
  const { loading, error, accessToken, user } = useSelector((state: RootState) => state.auth);

  // ตั้งค่า react-hook-form พร้อม Zod schema สำหรับ validate email/password
  const {
    register,       // ลงทะเบียน input field กับ form
    handleSubmit,   // wrapper ที่รัน validation ก่อนเรียก onSubmit
    formState: { errors }, // error message จาก Zod validation
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema), // ใช้ Zod ตรวจสอบ input
  });

  // ถ้ามี accessToken และ user แล้ว ให้ redirect ไปหน้า dashboard ทันที
  // replace: true เพื่อไม่ให้กลับมาหน้า login ด้วย back button
  useEffect(() => {
    if (accessToken && user) navigate("/dashboard", { replace: true });
  }, [accessToken, user, navigate]);

  // cleanup: เมื่อ component ถูก unmount ให้ล้าง error state
  // ป้องกัน error เดิมค้างอยู่เมื่อกลับมาหน้า login ครั้งต่อไป
  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  // handler เมื่อ submit form: dispatch loginThunk พร้อม email และ password
  const onSubmit = (data: AdminLoginForm) => {
    dispatch(loginThunk({ email: data.email, password: data.password }));
  };

  return (
    // container หลัก: พื้นหลังเทาเข้ม, ข้อความขาว, เต็มหน้าจอ, จัดกลางทั้งแนวตั้งและแนวนอน
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center p-6">
      {/* ส่วนหัว: แสดงชื่อแอปและหัวข้อหน้า */}
      <header className="text-center mb-8">
        {/* ชื่อแอป สีเขียวเพื่อให้โดดเด่น */}
        <h1 className="text-4xl font-bold text-green-500">MUSICKY</h1>
        {/* หัวข้อบอกว่าเป็นหน้า login สำหรับ admin */}
        <h2 className="text-xl mt-4 font-semibold">ADMIN LOGIN</h2>
      </header>

      {/* ฟอร์ม: handleSubmit จาก react-hook-form จะ validate ก่อนเรียก onSubmit */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email (@gmail.com)"
            // register เชื่อม input กับ form และกำหนด onChange handler
            // เมื่อผู้ใช้พิมพ์ใหม่ให้ล้าง server error ออกก่อน
            {...register("email", {
              onChange: () => { if (error) dispatch(clearError()); },
            })}
            // เปลี่ยน border เป็นแดงถ้ามี validation error, เขียวถ้า focus ปกติ
            className={`w-full p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 border-2 transition-colors ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-transparent focus:ring-green-500"
            }`}
          />
          {/* แสดง error message ของ email ถ้ามี */}
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
            // register password และล้าง error เมื่อผู้ใช้แก้ไข
            {...register("password", {
              onChange: () => { if (error) dispatch(clearError()); },
            })}
            // border แดงถ้ามี validation error หรือ server error (login ผิดพลาด)
            className={`w-full p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 border-2 transition-colors ${
              errors.password || error
                ? "border-red-500 focus:ring-red-500"
                : "border-transparent focus:ring-green-500"
            }`}
          />
          {/* แสดง validation error ของ password */}
          {errors.password && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.password.message}
            </p>
          )}
          {/* แสดง error จาก server (เช่น password ผิด, ไม่มีสิทธิ์ admin) */}
          {error && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <span>⚠</span> Login failed: {error}
            </p>
          )}
        </div>

        {/* Submit */}
        {/* disabled เมื่อกำลัง loading เพื่อป้องกันการ submit ซ้ำ */}
        <button
          type="submit"
          disabled={loading}
          className="w-full p-4 rounded-lg bg-white text-black font-semibold hover:bg-green-500 hover:text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* แสดงข้อความตามสถานะ: กำลัง login หรือปกติ */}
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>
    </div>
  );
};

export default AdminLogin;
