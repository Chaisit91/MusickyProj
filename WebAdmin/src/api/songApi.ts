// API จัดการเพลง (Admin) — getSongs, createSong, updateSong, deleteSong | รองรับ multipart upload audio file + ปก

import api from "./axios";

export const getSongStatsApi = async () => {
  return api.get("/admin/songs/stats");
};

export const getAllSongsApi = async (search?: string, genreId?: string, artistId?: string) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (genreId) params.append("genreId", genreId);
  if (artistId) params.append("artistId", artistId);
  return api.get(`/admin/songs?${params.toString()}`);
};

export const getSongByIdApi = async (id: string) => {
  return api.get(`/admin/songs/${id}`);
};

// ส่งเป็น FormData เพื่อรองรับ audioFile + coverImage
export const createSongApi = async (data: FormData) => {
  return api.post("/admin/songs", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateSongApi = async (id: string, data: FormData) => {
  return api.put(`/admin/songs/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteSongApi = async (id: string) => {
  return api.delete(`/admin/songs/${id}`);
};

export const playSongApi = async (id: string) => {
  return api.post(`/admin/songs/${id}/play`);
};
