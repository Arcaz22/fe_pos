import { AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import type {
  CashSession,
  CashSessionDetail,
  CashSessionListParams,
  CloseCashSessionPayload,
  OpenCashSessionPayload,
} from "@/types/cash-session";
import type { PaginatedResult } from "@/types/common";

export const cashSessionsApi = {
  open: (payload: OpenCashSessionPayload) =>
    apiClient.post<CashSession>("/cash-sessions/open", payload).then((r) => r.data),

  // 404 artinya kasir ini memang belum punya sesi aktif — itu kondisi NORMAL,
  // bukan error, jadi ditangkap dan dikembalikan sebagai `null`.
  getCurrent: (): Promise<CashSession | null> =>
    apiClient
      .get<CashSession>("/cash-sessions/current")
      .then((r) => r.data)
      .catch((err: AxiosError) => {
        if (err.response?.status === 404) return null;
        throw err;
      }),

  close: (id: number, payload: CloseCashSessionPayload) =>
    apiClient.post<CashSession>(`/cash-sessions/${id}/close`, payload).then((r) => r.data),

  // Admin-only
  list: (params?: CashSessionListParams): Promise<PaginatedResult<CashSession>> =>
    apiClient.get<CashSession[]>("/cash-sessions", { params }).then((r) => ({
      items: r.data,
      total: (r.meta?.total as number | undefined) ?? r.data.length,
    })),

  detail: (id: number) => apiClient.get<CashSessionDetail>(`/cash-sessions/${id}`).then((r) => r.data),
};
