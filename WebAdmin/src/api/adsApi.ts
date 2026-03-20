import api from "./axios";

export const getAdsStatsApi = async () => {
  return api.get("/admin/ads/stats");
};

export const getAllAdsApi = async () => {
  return api.get("/admin/ads");
};

export const getAdsByIdApi = async (id: string) => {
  return api.get(`/admin/ads/${id}`);
};

export const createAdsApi = async (data: {
  title: string;
  imageUrl: string;
  linkUrl: string;
  adType: string;
  adDuration: number;
  advertiser: string;
  isActive?: boolean;
}) => {
  return api.post("/admin/ads", data);
};

export const updateAdsApi = async (id: string, data: {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  adType?: string;
  adDuration?: number;
  advertiser?: string;
  isActive?: boolean;
}) => {
  return api.put(`/admin/ads/${id}`, data);
};

export const toggleAdsApi = async (id: string) => {
  return api.patch(`/admin/ads/${id}/toggle`);
};

export const deleteAdsApi = async (id: string) => {
  return api.delete(`/admin/ads/${id}`);
};
