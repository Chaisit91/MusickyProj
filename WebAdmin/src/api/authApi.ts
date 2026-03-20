import api from "./axios";

export const adminLoginApi = async (email: string, password: string) => {
  const res = await api.post("/auth/admin/login", { email, password });
  return res.data;
};

export const logoutApi = async (refreshToken: string) => {
  const res = await api.post("/auth/logout", { refreshToken });
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};