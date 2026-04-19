// Hook จัดการอัลบั้ม — fetch list, create, update, delete | จัดการ loading/error state
//
// หลักการทำงาน:
// 1. fetchAlbums: GET /albums → โหลดอัลบั้มทั้งหมด
// 2. createAlbum/updateAlbum: POST/PUT /albums (FormData สำหรับ cover image)
// 3. deleteAlbum: DELETE /albums/:id → ลบและ refetch
// 4. จัดการ modal states: showCreate, showEdit, editTarget ภายใน hook

import { useState, useEffect, useCallback } from "react";
import type { Album } from "../types/album";
import {
  getAllAlbumsApi,
  getAlbumsByArtistApi,
  createAlbumApi,
  updateAlbumApi,
  deleteAlbumApi,
} from "../api/albumApi";

export const useAlbums = (artistId?: string) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = artistId
        ? await getAlbumsByArtistApi(artistId)
        : await getAllAlbumsApi();
      setAlbums(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch albums");
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const createAlbum = async (data: {
    title: string;
    artistId: string;
    releaseDate: string;
    coverUrl?: string;
    coverFile?: File;
  }) => {
    await createAlbumApi(data);
    await fetchAlbums();
  };

  const updateAlbum = async (id: string, data: {
    title?: string;
    artistId?: string;
    releaseDate?: string;
    coverUrl?: string;
    coverFile?: File;
  }) => {
    await updateAlbumApi(id, data);
    await fetchAlbums();
  };

  const deleteAlbum = async (id: string) => {
    await deleteAlbumApi(id);
    await fetchAlbums();
  };

  return { albums, loading, error, refetch: fetchAlbums, createAlbum, updateAlbum, deleteAlbum };
};
