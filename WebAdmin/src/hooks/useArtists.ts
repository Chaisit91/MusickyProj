// Hook จัดการศิลปิน — fetch list, create, update, delete | จัดการ loading/error state
//
// หลักการทำงาน:
// 1. fetchArtists: GET /artists → โหลดศิลปินทั้งหมด
// 2. createArtist/updateArtist: POST/PUT /artists (FormData สำหรับ image)
// 3. deleteArtist: DELETE /artists/:id
// 4. pagination: totalPages, currentPage state สำหรับ paginated artist list

import { useState, useEffect, useCallback } from "react";
import type { Artist } from "../types/artist";
import {
  getAllArtistsApi,
  createArtistApi,
  updateArtistApi,
  deleteArtistApi,
} from "../api/artistApi";

export const useArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllArtistsApi();
      setArtists(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch artists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const createArtist = async (data: {
    name: string;
    bio?: string;
    imageUrl?: string;
    imageFile?: File;
  }) => {
    await createArtistApi(data);
    await fetchArtists();
  };

  const updateArtist = async (id: string, data: {
    name?: string;
    bio?: string;
    imageUrl?: string;
    imageFile?: File;
  }) => {
    await updateArtistApi(id, data);
    await fetchArtists();
  };

  const deleteArtist = async (id: string) => {
    await deleteArtistApi(id);
    await fetchArtists();
  };

  return { artists, loading, error, refetch: fetchArtists, createArtist, updateArtist, deleteArtist };
};
