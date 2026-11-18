import api from "./axios";

export const getAllUsersApi = async (search?: string, status?: string) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  return api.get(`/admin/users?${params.toString()}`);
};

export const getUserByIdApi = async (id: string) => {
  return api.get(`/admin/users/${id}`);
};

export const updateUserApi = async (id: string, data: {
  name?: string;
  email?: string;
  isActive?: boolean;
  role?: string;
}) => {
  return api.put(`/admin/users/${id}`, data);
};

export const banUserApi = async (id: string) => {
  return api.put(`/admin/users/${id}/ban`);
};

export const unbanUserApi = async (id: string) => {
  return api.put(`/admin/users/${id}/unban`);
};

export const deleteUserApi = async (id: string) => {
  return api.delete(`/admin/users/${id}`);
};
