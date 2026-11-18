import api from "./axios";

export const getQueueApi = async () => {
  return api.get("/queue");
};

export const addToQueueApi = async (songId: string) => {
  return api.post("/queue", { songId });
};

export const removeFromQueueApi = async (id: string) => {
  return api.delete(`/queue/${id}`);
};

export const reorderQueueApi = async (orderedIds: string[]) => {
  return api.post("/queue/reorder", { orderedIds });
};

export const clearQueueApi = async () => {
  return api.delete("/queue/clear");
};
