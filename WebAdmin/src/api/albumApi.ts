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
  coverFile?: File;
}) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("artistId", data.artistId);
  formData.append("releaseDate", data.releaseDate);
  if (data.coverFile) {
    formData.append("image", data.coverFile);
  } else if (data.coverUrl) {
    formData.append("coverUrl", data.coverUrl);
  }
  return api.post("/albums", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateAlbumApi = async (id: string, data: {
  title?: string;
  artistId?: string;
  releaseDate?: string;
  coverUrl?: string;
  coverFile?: File;
}) => {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.artistId) formData.append("artistId", data.artistId);
  if (data.releaseDate) formData.append("releaseDate", data.releaseDate);
  if (data.coverFile) {
    formData.append("image", data.coverFile);
  } else if (data.coverUrl !== undefined) {
    formData.append("coverUrl", data.coverUrl);
  }
  return api.put(`/albums/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteAlbumApi = async (id: string) => {
  return api.delete(`/albums/${id}`);
};
