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
  imageFile?: File;
}) => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.bio) formData.append("bio", data.bio);
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  } else if (data.imageUrl) {
    formData.append("imageUrl", data.imageUrl);
  }
  return api.post("/artists", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateArtistApi = async (id: string, data: {
  name?: string;
  bio?: string;
  imageUrl?: string;
  imageFile?: File;
}) => {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.bio !== undefined) formData.append("bio", data.bio);
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  } else if (data.imageUrl !== undefined) {
    formData.append("imageUrl", data.imageUrl);
  }
  return api.put(`/artists/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteArtistApi = async (id: string) => {
  return api.delete(`/artists/${id}`);
};
