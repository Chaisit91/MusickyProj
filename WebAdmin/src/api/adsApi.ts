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
  adType: string;
  adDuration: number;
  advertiser: string;
  linkUrl?: string;
  isActive?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
  mediaFile: File;
}) => {
  const fd = new FormData();
  fd.append("title", data.title);
  fd.append("adType", data.adType);
  fd.append("adDuration", String(data.adDuration));
  fd.append("advertiser", data.advertiser);
  if (data.linkUrl !== undefined) fd.append("linkUrl", data.linkUrl);
  if (data.isActive !== undefined) fd.append("isActive", String(data.isActive));
  if (data.priority !== undefined) fd.append("priority", String(data.priority));
  if (data.startDate) fd.append("startDate", data.startDate);
  if (data.endDate) fd.append("endDate", data.endDate);
  fd.append("media", data.mediaFile);
  return api.post("/admin/ads", fd, { headers: { "Content-Type": "multipart/form-data" } });
};

export const updateAdsApi = async (id: string, data: {
  title?: string;
  adType?: string;
  adDuration?: number;
  advertiser?: string;
  linkUrl?: string;
  isActive?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
  mediaFile?: File;
}) => {
  const fd = new FormData();
  if (data.title !== undefined) fd.append("title", data.title);
  if (data.adType !== undefined) fd.append("adType", data.adType);
  if (data.adDuration !== undefined) fd.append("adDuration", String(data.adDuration));
  if (data.advertiser !== undefined) fd.append("advertiser", data.advertiser);
  if (data.linkUrl !== undefined) fd.append("linkUrl", data.linkUrl);
  if (data.isActive !== undefined) fd.append("isActive", String(data.isActive));
  if (data.priority !== undefined) fd.append("priority", String(data.priority));
  if (data.startDate !== undefined) fd.append("startDate", data.startDate);
  if (data.endDate !== undefined) fd.append("endDate", data.endDate);
  if (data.mediaFile) fd.append("media", data.mediaFile);
  return api.put(`/admin/ads/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
};

export const toggleAdsApi = async (id: string) => {
  return api.patch(`/admin/ads/${id}/toggle`);
};

export const deleteAdsApi = async (id: string) => {
  return api.delete(`/admin/ads/${id}`);
};
