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
  imageFile?: File;
}) => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  if (data.color) formData.append("color", data.color);
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  } else if (data.imageUrl) {
    formData.append("imageUrl", data.imageUrl);
  }
  return api.post("/admin/genres", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateGenreApi = async (id: string, data: {
  name?: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  imageFile?: File;
  removeImage?: boolean; // ✅ flag บอก backend ให้ลบรูป
}) => {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  if (data.color) formData.append("color", data.color);
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  } else if (data.removeImage) {
    // ✅ ส่ง flag บอก backend ให้ลบรูปออก
    formData.append("removeImage", "true");
  } else if (data.imageUrl) {
    formData.append("imageUrl", data.imageUrl);
  }
  return api.put(`/admin/genres/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteGenreApi = async (id: string) => {
  return api.delete(`/admin/genres/${id}`);
};

export const uploadGenreImageApi = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await api.post("/upload/genres", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data.url;
};