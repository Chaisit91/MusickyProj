import apiClient from "./apiClient";
import { Song } from "./homeApi";

export interface ApiPlaylist {
  id: string;
  name: string;
  createdAt: string;
  playlistSongs: { song: Song }[];
}

export const getPlaylistsApi = () =>
  apiClient.get<{ data: ApiPlaylist[] }>("/playlists");

export const createPlaylistApi = (title: string) =>
  apiClient.post<{ data: ApiPlaylist }>("/playlists", { name: title });

export const deletePlaylistApi = (id: string) =>
  apiClient.delete(`/playlists/${id}`);

export const addSongToPlaylistApi = (playlistId: string, songId: string) =>
  apiClient.post(`/playlists/${playlistId}/songs`, { songId });

export const removeSongFromPlaylistApi = (playlistId: string, songId: string) =>
  apiClient.delete(`/playlists/${playlistId}/songs/${songId}`);
