import api from "./axios";

export const adminLoginApi = async (email: string, password: string) => {
  const res = await api.post("/auth/admin/login", { email, password });
  return res.data;
};

//  ไม่ต้องส่ง refreshToken — browser ส่ง HttpOnly Cookie ให้อัตโนมัติ
export const logoutApi = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const refreshApi = async () => {
  const refreshToken = localStorage.getItem("admin_refresh_token");
  const res = await api.post("/auth/refresh", refreshToken ? { refreshToken } : {});
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};