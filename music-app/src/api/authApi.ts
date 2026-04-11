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
  avatarUrl?: string | null;
  isPremium?: boolean;
  premiumExpiresAt?: string | null;
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

export interface GoogleLoginResponse {
  success: boolean;
  requiresName: boolean;
  // กรณี requiresName = true
  googleData?: {
    googleId: string;
    email: string;
    suggestedName: string;
    avatarUrl: string | null;
    accessToken: string;
  };
  // กรณี requiresName = false
  data?: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export const googleLoginApi = async (params: { accessToken: string; name?: string }) => {
  const { data } = await apiClient.post("/auth/google", params);
  return data as GoogleLoginResponse;
};

export const fetchMeApi = async () => {
  const { data } = await apiClient.get("/auth/me");
  return data as { success: boolean; data: AuthUser };
};

export const updateProfileApi = async (params: {
  name?: string;
  avatarUri?: string;
  avatarMimeType?: string;
}) => {
  const formData = new FormData();
  if (params.name) formData.append("name", params.name);
  if (params.avatarUri) {
    const filename = params.avatarUri.split("/").pop() ?? "avatar.jpg";
    formData.append("avatar", {
      uri: params.avatarUri,
      name: filename,
      type: params.avatarMimeType ?? "image/jpeg",
    } as any);
  }
  const { data } = await apiClient.patch("/auth/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { success: boolean; data: AuthUser };
};
