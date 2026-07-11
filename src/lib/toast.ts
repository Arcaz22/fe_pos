import { toast as sonnerToast } from "sonner";
import { AxiosError } from "axios";

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail ?? error.response?.data?.message;
    if (typeof detail === "string") return detail;
    if (error.response?.status === 401) return "Sesi berakhir, silakan login kembali.";
    if (error.response?.status === 403) return "Kamu tidak punya akses untuk aksi ini.";
    if (error.response?.status === 404) return "Data tidak ditemukan.";
  }
  return fallback;
}

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (error: unknown, fallback: string) => sonnerToast.error(extractErrorMessage(error, fallback)),
  info: (message: string) => sonnerToast.info(message),
};
