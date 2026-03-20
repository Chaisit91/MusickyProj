import api from "./axios";

export const adminLoginApi = async (email: string, password: string) => {
  return api.post("/auth/admin/login", { email, password });
};

export const logoutApi = async (refreshToken: string) => {
  return api.post("/auth/logout", { refreshToken });
};

export const getMeApi = async () => {
  return api.get("/auth/me");
};
