import { toast as sonnerToast } from "sonner";
import { AxiosError } from "axios";

interface BackendErrorBody {
  message?: string;
  errors?: Array<{ field?: string | null; detail: string }>;
}

const ERROR_MESSAGE_MAP: Record<string, string> = {
  "Cash session does not have enough cash for change.": "Kas tidak cukup untuk memberi kembalian.",
  "Cash session has pending cash orders.": "Masih ada order cash pending, selesaikan/cancel dulu sebelum tutup kas.",
  "There are pending cash orders in this cash session.":
    "Masih ada order cash pending, selesaikan/cancel dulu sebelum tutup kas.",
};

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as BackendErrorBody | undefined;
    // Backend selalu balas error sebagai { message, errors: [{ field, detail }] }
    const firstDetail = body?.errors?.[0]?.detail;
    if (firstDetail) return ERROR_MESSAGE_MAP[firstDetail] ?? firstDetail;
    if (body?.message) return ERROR_MESSAGE_MAP[body.message] ?? body.message;
  }
  return fallback;
}

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (error: unknown, fallback: string) => sonnerToast.error(extractErrorMessage(error, fallback)),
  info: (message: string) => sonnerToast.info(message),
};
