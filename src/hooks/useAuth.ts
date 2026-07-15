import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth-store";
import type { LoginPayload, RegisterPayload } from "@/types/auth";

/** Ambil profil user yang sedang login. Hanya jalan kalau sudah ada access token. */
export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: !!accessToken,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setTokens(data.tokens.access_token, data.tokens.refresh_token);
      setUser(data.user);
      toast.success(`Selamat datang, ${data.user.email}`);
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast.error(error, "Email atau password salah.");
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    authApi.logout().catch(() => {
      // abaikan error network saat logout — tetap bersihkan sesi lokal
    });
    logout();
    queryClient.clear();
    navigate("/login", { replace: true });
  };
}

export function useCreateCashier() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (result) => {
      toast.success(`Akun ${result.user.email} berhasil dibuat.`);
    },
    onError: (error) => toast.error(error, "Gagal membuat akun baru."),
  });
}
