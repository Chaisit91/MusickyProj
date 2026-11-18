import api from "./axios";

export const getDashboardApi = async () => {
  return api.get("/admin/dashboard");
};
