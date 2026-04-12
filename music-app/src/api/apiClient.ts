import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";

const getBaseUrl = () => {
  return "http://192.168.1.63:8080/api";
};

const BASE_URL = getBaseUrl();

// Cache token in memory to avoid AsyncStorage read on every request
let cachedToken: string | null = null;

export const setCachedToken = (token: string | null) => {
  cachedToken = token;
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach access token ─────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  if (!cachedToken) {
    cachedToken = await AsyncStorage.getItem("accessToken");
  }
  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }
  return config;
});

// ─── Response interceptor: auto-refresh on 401 ───────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const flushQueue = (token: string | null, error: unknown = null) => {
  pendingQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Retry once on timeout only (use separate flag from 401 _retry)
    const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
    if (isTimeout && !original._timeoutRetried) {
      original._timeoutRetried = true;
      await new Promise((res) => setTimeout(res, 800));
      return apiClient(original);
    }

    // Only handle 401, and skip the refresh endpoint itself to avoid loops
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue requests while a refresh is in progress
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken: string = data.data?.accessToken ?? data.accessToken;
      await AsyncStorage.setItem("accessToken", newAccessToken);
      setCachedToken(newAccessToken);

      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      original.headers.Authorization = `Bearer ${newAccessToken}`;

      flushQueue(newAccessToken);
      return apiClient(original);
    } catch (refreshError) {
      flushQueue(null, refreshError);
      // Clear session — user must log in again
      setCachedToken(null);
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;