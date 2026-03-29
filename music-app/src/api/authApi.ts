import apiClient from "./apiClient";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  birthDate?: string; // ISO string e.g. "2000-01-15"
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export const registerApi = async (payload: RegisterPayload) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data as { success: boolean; message: string };
};

export const loginApi = async (payload: LoginPayload) => {
  const { data } = await apiClient.post("/auth/login", payload);
  return data as LoginResponse;
};

export const logoutApi = async () => {
  const { data } = await apiClient.post("/auth/logout");
  return data;
};
