import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cashSessionsApi } from "@/api/cash-sessions";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth-store";
import type { CashSessionListParams, CloseCashSessionPayload, OpenCashSessionPayload } from "@/types/cash-session";

/** Sesi kas aktif milik kasir yang sedang login. `null` kalau belum ada sesi dibuka. */
export function useCurrentCashSession() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: queryKeys.cashSessions.current,
    queryFn: cashSessionsApi.getCurrent,
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}

export function useOpenCashSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpenCashSessionPayload) => cashSessionsApi.open(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cashSessions.current });
      toast.success("Sesi kas dibuka.");
    },
    onError: (error) => toast.error(error, "Gagal membuka sesi kas."),
  });
}

export function useCloseCashSession(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CloseCashSessionPayload) => cashSessionsApi.close(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cashSessions.current });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashSessions.all });
    },
    onError: (error) => toast.error(error, "Gagal menutup sesi kas."),
  });
}

/** Admin-only: daftar semua sesi kas, bisa difilter per kasir & tanggal. */
export function useCashSessions(params?: CashSessionListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.cashSessions.list(params),
    queryFn: () => cashSessionsApi.list(params),
    enabled,
    placeholderData: (prev) => prev,
  });
}

/** Admin-only: detail 1 sesi kas + ringkasan transaksinya. */
export function useCashSessionDetail(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.cashSessions.detail(id!),
    queryFn: () => cashSessionsApi.detail(id!),
    enabled: id !== undefined,
  });
}
