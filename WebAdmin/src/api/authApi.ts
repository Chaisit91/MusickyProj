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

//  silent refresh — browser ส่ง cookie ไปเอง ไม่ต้องส่ง body อะไร
export const refreshApi = async () => {
  const res = await api.post("/auth/refresh");
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};