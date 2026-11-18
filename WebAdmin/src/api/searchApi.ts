import api from "./axios";

export const searchApi = async (q: string) => {
  return api.get(`/search?q=${encodeURIComponent(q)}`);
};

export const getSearchHistoryApi = async () => {
  return api.get("/search/history");
};

export const clearSearchHistoryApi = async () => {
  return api.delete("/search/history");
};
