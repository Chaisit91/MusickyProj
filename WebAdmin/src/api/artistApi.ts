import api from "./axios";

export const getAllArtistsApi = async () => {
  return api.get("/artists");
};

export const getArtistByIdApi = async (id: string) => {
  return api.get(`/artists/${id}`);
};

export const createArtistApi = async (data: {
  name: string;
  bio?: string;
  imageUrl?: string;
}) => {
  return api.post("/artists", data);
};

export const updateArtistApi = async (id: string, data: {
  name?: string;
  bio?: string;
  imageUrl?: string;
}) => {
  return api.put(`/artists/${id}`, data);
};

export const deleteArtistApi = async (id: string) => {
  return api.delete(`/artists/${id}`);
};
