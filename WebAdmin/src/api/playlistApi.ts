import api from "./axios";

export const getAllPlaylistsApi = async () => {
  return api.get("/playlists");
};

export const getPlaylistByIdApi = async (id: string) => {
  return api.get(`/playlists/${id}`);
};

export const createPlaylistApi = async (data: { name: string }) => {
  return api.post("/playlists", data);
};

export const updatePlaylistApi = async (id: string, data: { name?: string }) => {
  return api.put(`/playlists/${id}`, data);
};

export const deletePlaylistApi = async (id: string) => {
  return api.delete(`/playlists/${id}`);
};

export const addSongToPlaylistApi = async (playlistId: string, songId: string) => {
  return api.post(`/playlists/${playlistId}/songs`, { songId });
};

export const removeSongFromPlaylistApi = async (playlistId: string, songId: string) => {
  return api.delete(`/playlists/${playlistId}/songs/${songId}`);
};
