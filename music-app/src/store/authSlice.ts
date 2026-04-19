// Redux slice จัดการ auth — state: user, accessToken, isLoggedIn | thunks: loginThunk, googleLoginThunk, logoutThunk, fetchMeThunk, updateProfileThunk | ล้าง state ทั้งหมดเมื่อ logout
//
// หลักการทำงาน:
// 1. restoreSession (เรียกตอนแอปเปิด): อ่าน token+user จาก AsyncStorage → setCachedToken → fetchMeApi sync user ล่าสุด → คืน session หรือ null
// 2. loginThunk: เรียก loginApi → บันทึก token ลง AsyncStorage + cachedToken → คืน user+token
// 3. logoutThunk: เรียก logoutApi (best-effort) → setCachedToken(null) → ลบ AsyncStorage ทั้ง 3 key
// 4. extraReducers: restoreSession.fulfilled ตั้ง isLoggedIn=true + ปิด isLoading, login.fulfilled เก็บ user+token, logout.fulfilled ล้าง state ทั้งหมด
// 5. isLoading เริ่มที่ true เพื่อบล็อก UI ขณะ restore session — ปิดทั้ง fulfilled+rejected

// นำเข้า createSlice สำหรับสร้าง slice และ createAsyncThunk สำหรับสร้าง async action
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// นำเข้า AsyncStorage สำหรับเก็บ/อ่าน token และข้อมูลผู้ใช้ใน local storage ของอุปกรณ์
import AsyncStorage from "@react-native-async-storage/async-storage";
<<<<<<< HEAD
// นำเข้า API functions และ types สำหรับระบบ authentication
import { loginApi, registerApi, logoutApi, fetchMeApi, updateProfileApi, googleLoginApi, AuthUser, LoginPayload, RegisterPayload } from "../api/authApi";
// นำเข้า setCachedToken เพื่ออัปเดต token ที่ใช้กับ axios instance ทันที (ไม่ต้องรอ AsyncStorage)
=======
import { loginApi, registerApi, logoutApi, fetchMeApi, updateProfileApi, AuthUser, LoginPayload, RegisterPayload } from "../api/authApi";
>>>>>>> d644fe44f32236481b9e824505657910f9ebd318
import { setCachedToken } from "../api/apiClient";

// ─── State ────────────────────────────────────────────────────────────────────
// กำหนด interface ของ state สำหรับระบบ authentication ทั้งหมด
interface AuthState {
  user: AuthUser | null;        // ข้อมูลผู้ใช้ที่ login อยู่ (null = ยังไม่ได้ login)
  accessToken: string | null;   // JWT access token สำหรับเรียก API ที่ต้องการ auth
  isLoggedIn: boolean;          // สถานะว่า login อยู่หรือไม่
  isLoading: boolean;           // true ระหว่างกำลังโหลด/รอผล async (เช่น restore session)
  error: string | null;         // ข้อความ error ล่าสุด (null = ไม่มี error)
}

// ค่าเริ่มต้น: isLoading=true เพราะแอปต้องรอ restoreSession ก่อนแสดง UI
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoggedIn: false,
  isLoading: true,  // ตั้งเป็น true เพื่อบล็อก UI จนกว่าจะ restore session เสร็จ
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Restore session + sync latest user data from API
// เรียกตอนแอปเปิดเพื่อดึง token จาก AsyncStorage และรีเฟรช user data จาก API
export const restoreSession = createAsyncThunk("auth/restoreSession", async () => {
  // ดึง token และ user data ที่บันทึกไว้จาก local storage
  const token = await AsyncStorage.getItem("accessToken");
  const userJson = await AsyncStorage.getItem("user");
  // ถ้าไม่มี token หรือ user data → ผู้ใช้ยังไม่ได้ login
  if (!token || !userJson) return null;

  // ตั้ง token ใน axios cache ทันทีเพื่อให้ API call ถัดไปส่ง token ไปด้วย
  setCachedToken(token);
  const cachedUser = JSON.parse(userJson) as AuthUser;

  // ดึง user ล่าสุดจาก API เพื่อให้ avatarUrl และ name เป็นปัจจุบัน
  try {
    const res = await fetchMeApi();
    const freshUser = res.data;
    // บันทึก user ที่อัปเดตแล้วกลับลง AsyncStorage เพื่อให้ครั้งต่อไปใช้ข้อมูลล่าสุด
    await AsyncStorage.setItem("user", JSON.stringify(freshUser));
    return { accessToken: token, user: freshUser };
  } catch {
    // ถ้า API ล้มเหลว ใช้ข้อมูลใน cache แทน — แอปยังทำงานได้แม้ offline
    return { accessToken: token, user: cachedUser };
  }
});

<<<<<<< HEAD
// Google Login
// รับ Google access token แล้วส่งไป backend เพื่อแลก JWT ของแอป
export const googleLoginThunk = createAsyncThunk(
  "auth/googleLogin",
  async (params: { accessToken: string; name?: string }, { rejectWithValue }) => {
    try {
      const res = await googleLoginApi(params);
      if (res.requiresName) {
        // backend แจ้งว่าบัญชีใหม่ที่ยังไม่มีชื่อ → ต้องตั้งชื่อก่อน navigate ไป home
        return { requiresName: true as const, googleData: res.googleData! };
      }
      const { accessToken, refreshToken, user } = res.data!;
      // บันทึก token และ user ลง AsyncStorage สำหรับ session ต่อไป
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      // อัปเดต token ใน axios ทันที
      setCachedToken(accessToken);
      return { requiresName: false as const, accessToken, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Google login failed");
    }
  }
);

=======
>>>>>>> d644fe44f32236481b9e824505657910f9ebd318
// Fetch latest user from API (call after focus on profile screens)
// ใช้รีเฟรช user data หลังผู้ใช้แก้ไข profile เพื่อให้ UI แสดงข้อมูลล่าสุด
export const fetchMeThunk = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchMeApi();
    const user = res.data;
    // บันทึก user ที่อัปเดตแล้วกลับลง AsyncStorage
    await AsyncStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? "Failed to fetch user");
  }
});

// Register → auto-login (backend returns tokens)
// สมัครสมาชิกใหม่ — ถ้าสำเร็จ backend จะส่ง tokens กลับมาด้วย
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      await registerApi(payload);
      return true; // สมัครสำเร็จ ให้ caller navigate ไปหน้า login หรือ home
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Registration failed");
    }
  }
);

// Login
// ล็อกอินด้วย email/password แล้วบันทึก token ลง AsyncStorage
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await loginApi(payload);
      const { accessToken, refreshToken, user } = res.data;
      // บันทึก token และ user ลง AsyncStorage เพื่อให้ restoreSession ใช้ได้ครั้งต่อไป
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      // อัปเดต token ใน axios ทันทีโดยไม่รอ AsyncStorage อ่านซ้ำ
      setCachedToken(accessToken);
      return { accessToken, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Login failed");
    }
  }
);

// Update Profile
// อัปเดต ชื่อ หรือ avatar ของผู้ใช้แล้วบันทึกข้อมูลใหม่ลง AsyncStorage
export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (
    params: { name?: string; avatarUri?: string; avatarMimeType?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await updateProfileApi(params);
      const user = res.data;
      // sync user ใหม่ลง AsyncStorage เพื่อให้ restoreSession ครั้งต่อไปได้ข้อมูลล่าสุด
      await AsyncStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Update failed");
    }
  }
);

// Logout
// ส่ง logout request ไป backend (best-effort) แล้วล้าง token และข้อมูลใน local storage ทั้งหมด
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    await logoutApi(); // แจ้ง backend ให้ invalidate refresh token
  } catch {
    // ถ้า API ล้มเหลวก็ยังต้องล้าง local storage ต่อ (proceed even if API fails)
  }
  setCachedToken(null); // ล้าง token ใน axios cache ทันที
  // ลบข้อมูลทั้ง 3 key ออกจาก AsyncStorage พร้อมกัน
  await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
});

// ─── Slice ────────────────────────────────────────────────────────────────────
// สร้าง slice ชื่อ "auth" ซึ่งจะกลายเป็น state.auth ใน Redux store
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // action: ล้าง error message เช่น เมื่อผู้ใช้กลับไปหน้า login หรือปิด error dialog
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // restoreSession: จัดการผลลัพธ์การคืน session หลังแอปเปิด
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          // มีข้อมูล session → ตั้งค่า user และ token พร้อมระบุว่า login อยู่
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isLoggedIn = true;
        }
        // ไม่ว่าจะมี session หรือไม่ ให้ปิด loading เพื่อให้ UI แสดงผลได้
        state.isLoading = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        // restore ล้มเหลว (เช่น AsyncStorage error) → ปิด loading เพื่อให้แอปทำงานต่อได้
        state.isLoading = false;
      });

    // register (auto-login): จัดการการสมัครสมาชิก
    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;   // แสดง loading ขณะรอ API
        state.error = null;        // ล้าง error เก่า
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false;  // ปิด loading เมื่อสมัครสำเร็จ
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.error = action.payload as string; // เก็บข้อความ error จาก API
        state.isLoading = false;
      });

    // login: จัดการการล็อกอิน
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;   // แสดง loading ขณะรอ API
        state.error = null;        // ล้าง error เก่า
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        // login สำเร็จ → บันทึก user, token และตั้งสถานะ login
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isLoggedIn = true;
        state.isLoading = false;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.error = action.payload as string; // เก็บ error เช่น "Invalid password"
        state.isLoading = false;
      });

<<<<<<< HEAD
    // googleLogin: จัดการ Google OAuth login
    builder
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        if (!action.payload.requiresName) {
          // login สำเร็จและมีชื่อแล้ว → ตั้งค่า state เหมือน loginThunk
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isLoggedIn = true;
        }
        // requiresName=true → state ไม่เปลี่ยน รอให้ตั้งชื่อก่อน (caller จะ navigate ไปหน้าตั้งชื่อ)
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.error = action.payload as string; // เก็บ error เช่น "Google login failed"
      });

    // fetchMe: อัปเดต user data ล่าสุดจาก API
=======
    // fetchMe
>>>>>>> d644fe44f32236481b9e824505657910f9ebd318
    builder.addCase(fetchMeThunk.fulfilled, (state, action) => {
      state.user = action.payload; // แทนที่ user เดิมด้วยข้อมูลล่าสุด
    });

    // updateProfile: อัปเดต user หลังแก้ไข profile สำเร็จ
    builder
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload; // แทนที่ user ด้วยข้อมูลที่อัปเดตแล้ว
        state.error = null;           // ล้าง error เก่าถ้ามี
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.error = action.payload as string; // เก็บ error เช่น "Upload failed"
      });

    // logout: ล้าง state ทั้งหมดเมื่อ logout สำเร็จ
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;           // ล้างข้อมูลผู้ใช้
      state.accessToken = null;    // ล้าง token
      state.isLoggedIn = false;    // ระบุว่าไม่ได้ login อยู่แล้ว
      state.isLoading = false;     // ปิด loading
    });
  },
});

// export action clearError เพื่อให้ component เรียกล้าง error ได้
export const { clearError } = authSlice.actions;
// export reducer เพื่อนำไปลงทะเบียนใน store
export default authSlice.reducer;
