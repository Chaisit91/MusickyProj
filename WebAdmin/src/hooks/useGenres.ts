// Hook จัดการแนวเพลง — fetch list, create, update, delete | จัดการ loading/error state
//
// หลักการทำงาน:
// 1. fetchGenres: GET /genres → รายการแนวเพลงทั้งหมด
// 2. createGenre/updateGenre: POST/PUT /genres (FormData สำหรับ image)
// 3. deleteGenre: DELETE /genres/:id

import { useState, useEffect, useCallback } from "react";
import type { Genre } from "../types/genre";
import {
  getAllGenresApi,
  getGenreStatsApi,
  createGenreApi,
  updateGenreApi,
  deleteGenreApi,
} from "../api/genreApi";

interface GenreStats {
  totalGenres: number;
  totalSongs: number;
  avgSongsPerGenre: number;
}

export const useGenres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [stats, setStats] = useState<GenreStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGenres = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [genresRes, statsRes] = await Promise.all([
        getAllGenresApi(),
        getGenreStatsApi(),
      ]);
      setGenres(genresRes.data.data);
      setStats(statsRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch genres");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  const createGenre = async (data: {
    name: string;
    description?: string;
    imageUrl?: string;
    color?: string;
    imageFile?: File;
  }) => {
    await createGenreApi(data);
    await fetchGenres();
  };

  const updateGenre = async (id: string, data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    color?: string;
    imageFile?: File;
    removeImage?: boolean; // ✅ รับ flag ลบรูป
  }) => {
    await updateGenreApi(id, data);
    await fetchGenres();
  };

  const deleteGenre = async (id: string) => {
    await deleteGenreApi(id);
    await fetchGenres();
  };

  return { genres, stats, loading, error, refetch: fetchGenres, createGenre, updateGenre, deleteGenre };
};