import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import type { AuthResult, LoginPayload, RegisterPayload, User } from "@/types/auth";

export const authApi = {
  login: (payload: LoginPayload) => apiClient.post<AuthResult>("/auth/login", payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResult>("/auth/register", payload).then((r) => r.data),

  me: () => apiClient.get<User>("/auth/me").then((r) => r.data),

  // Backend mewajibkan refresh_token di body /auth/logout untuk revoke token itu.
  logout: () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) return Promise.resolve();
    return apiClient.post<void>("/auth/logout", { refresh_token: refreshToken }).then((r) => r.data);
  },
};
