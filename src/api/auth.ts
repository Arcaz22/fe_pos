import { apiClient } from "@/lib/api-client";
import type { LoginPayload, RegisterPayload, TokenPair, User } from "@/types/auth";

export const authApi = {
  login: (payload: LoginPayload) => apiClient.post<TokenPair>("/auth/login", payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<User>("/auth/register", payload).then((r) => r.data),

  me: () => apiClient.get<User>("/auth/me").then((r) => r.data),

  logout: () => apiClient.post<void>("/auth/logout").then((r) => r.data),
};
