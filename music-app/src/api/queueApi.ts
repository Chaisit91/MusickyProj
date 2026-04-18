import apiClient from "./apiClient";

export interface BackendQueueItem {
  id: string;
  songId: string;
  position: number;
}

export const getQueueApi = (): Promise<BackendQueueItem[]> =>
  apiClient.get("/queue").then((r) => r.data.data);

export const addToQueueApi = (songId: string): Promise<BackendQueueItem> =>
  apiClient.post("/queue", { songId }).then((r) => r.data.data);

export const removeFromQueueApi = (id: string): Promise<void> =>
  apiClient.delete(`/queue/${id}`);

export const reorderQueueApi = (orderedIds: string[]): Promise<void> =>
  apiClient.post("/queue/reorder", { orderedIds });

export const clearQueueApi = (): Promise<void> =>
  apiClient.delete("/queue/clear");
