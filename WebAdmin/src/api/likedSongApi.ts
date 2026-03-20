import api from "./axios";

export const getLikedSongsApi = async () => {
  return api.get("/liked-songs");
};

export const likeSongApi = async (songId: string) => {
  return api.post("/liked-songs", { songId });
};

export const unlikeSongApi = async (songId: string) => {
  return api.delete(`/liked-songs/${songId}`);
};
