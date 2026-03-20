import api from "./axios";

export const getDownloadsApi = async () => {
  return api.get("/downloads");
};

export const addDownloadApi = async (songId: string) => {
  return api.post("/downloads", { songId });
};

export const removeDownloadApi = async (id: string) => {
  return api.delete(`/downloads/${id}`);
};

export const clearDownloadsApi = async () => {
  return api.delete("/downloads/clear");
};
