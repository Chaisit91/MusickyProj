import apiClient from "./apiClient";

export interface UserPreferences {
  streamingQuality: string;
  downloadQuality: string;
  musicLanguages: string[];
  autoPlay: boolean;
  showLyrics: boolean;
}

export const getPreferencesApi = async (): Promise<UserPreferences> => {
  const { data } = await apiClient.get("/users/me/preferences");
  return data.data as UserPreferences;
};

export const updatePreferencesApi = async (
  prefs: Partial<UserPreferences>
): Promise<UserPreferences> => {
  const { data } = await apiClient.put("/users/me/preferences", prefs);
  return data.data as UserPreferences;
};
