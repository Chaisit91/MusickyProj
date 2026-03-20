import api from "./axios";

export const getSongStatsApi = async () => {
  return api.get("/admin/songs/stats");
};

export const getAllSongsApi = async (search?: string, genreId?: string) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (genreId) params.append("genreId", genreId);
  return api.get(`/admin/songs?${params.toString()}`);
};

export const getSongByIdApi = async (id: string) => {
  return api.get(`/admin/songs/${id}`);
};

export const createSongApi = async (data: {
  title: string;
  artistId: string;
  albumId: string;
  genreId: string;
  filePath: string;
  duration?: number;
  year?: number;
  lyrics?: string;
}) => {
  return api.post("/admin/songs", data);
};

export const updateSongApi = async (id: string, data: {
  title?: string;
  artistId?: string;
  albumId?: string;
  genreId?: string;
  filePath?: string;
  duration?: number;
  year?: number;
  lyrics?: string;
}) => {
  return api.put(`/admin/songs/${id}`, data);
};

export const deleteSongApi = async (id: string) => {
  return api.delete(`/admin/songs/${id}`);
};

export const playSongApi = async (id: string) => {
  return api.post(`/admin/songs/${id}/play`);
};
