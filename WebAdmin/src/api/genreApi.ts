import api from "./axios";

export const getGenreStatsApi = async () => {
  return api.get("/admin/genres/stats");
};

export const getAllGenresApi = async () => {
  return api.get("/admin/genres");
};

export const getGenreByIdApi = async (id: string) => {
  return api.get(`/admin/genres/${id}`);
};

export const createGenreApi = async (data: {
  name: string;
  description?: string;
  imageUrl?: string;
  color?: string;
}) => {
  return api.post("/admin/genres", data);
};

export const updateGenreApi = async (id: string, data: {
  name?: string;
  description?: string;
  imageUrl?: string;
  color?: string;
}) => {
  return api.put(`/admin/genres/${id}`, data);
};

export const deleteGenreApi = async (id: string) => {
  return api.delete(`/admin/genres/${id}`);
};
