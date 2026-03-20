import api from "./axios";

export const getAllAlbumsApi = async () => {
  return api.get("/albums");
};

export const getAlbumByIdApi = async (id: string) => {
  return api.get(`/albums/${id}`);
};

export const getAlbumsByArtistApi = async (artistId: string) => {
  return api.get(`/albums/artist/${artistId}`);
};

export const createAlbumApi = async (data: {
  title: string;
  artistId: string;
  releaseDate: string;
  coverUrl?: string;
}) => {
  return api.post("/albums", data);
};

export const updateAlbumApi = async (id: string, data: {
  title?: string;
  artistId?: string;
  releaseDate?: string;
  coverUrl?: string;
}) => {
  return api.put(`/albums/${id}`, data);
};

export const deleteAlbumApi = async (id: string) => {
  return api.delete(`/albums/${id}`);
};
