import { useState, useEffect, useCallback } from "react";
import type { User } from "../types/user";
import {
  getAllUsersApi,
  updateUserApi,
  banUserApi,
  unbanUserApi,
  deleteUserApi,
} from "../api/userApi";

export const useUsers = (search?: string, status?: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsersApi(search, status);
      setUsers(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (id: string, data: {
    name?: string;
    email?: string;
    isActive?: boolean;
    role?: string;
  }) => {
    await updateUserApi(id, data);
    await fetchUsers();
  };

  const banUser = async (id: string) => {
    await banUserApi(id);
    await fetchUsers();
  };

  const unbanUser = async (id: string) => {
    await unbanUserApi(id);
    await fetchUsers();
  };

  const deleteUser = async (id: string) => {
    await deleteUserApi(id);
    await fetchUsers();
  };

  return { users, loading, error, refetch: fetchUsers, updateUser, banUser, unbanUser, deleteUser };
};
