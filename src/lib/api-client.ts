import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/lib/env";
import { useAuthStore } from "@/store/auth-store";
import type { AuthResult } from "@/types/auth";

// Backend selalu membungkus response sukses sebagai { message, data, meta? }.
// Kita augment AxiosResponse supaya `meta` (info pagination: total, offset, limit)
// tetap bisa diakses setelah response.data di-unwrap jadi payload aslinya.
declare module "axios" {
  interface AxiosResponse {
    meta?: Record<string, unknown>;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: selalu lampirkan access token terbaru dari store
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (sukses): unwrap envelope { message, data, meta } -> response.data = data,
// dan simpan meta di response.meta biar hooks yang butuh `total` masih bisa akses.
apiClient.interceptors.response.use((response) => {
  const payload = response.data;
  if (payload && typeof payload === "object" && "data" in payload) {
    response.meta = payload.meta;
    response.data = payload.data;
  }
  return response;
});

// --- Refresh token queue ---
// Mencegah beberapa request 401 sekaligus memicu banyak panggilan /auth/refresh.
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Jangan coba refresh untuk request refresh itu sendiri
    if (originalRequest.url?.includes("/auth/refresh")) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      useAuthStore.getState().logout();
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      // Panggil pakai axios polos (bukan apiClient) supaya tidak lewat interceptor
      // request (yang nempelin access token lama) dan tidak trigger loop.
      // Body respons masih envelope penuh: { message, data: { user, tokens } }.
      const { data: envelope } = await axios.post<{ data: AuthResult }>(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      const { tokens } = envelope.data;

      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token);
      processQueue(null, tokens.access_token);

      originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
