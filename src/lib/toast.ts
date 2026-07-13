import { toast as sonnerToast } from "sonner";
import { AxiosError } from "axios";

interface BackendErrorBody {
  message?: string;
  errors?: Array<{ field?: string | null; detail: string }>;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as BackendErrorBody | undefined;
    // Backend selalu balas error sebagai { message, errors: [{ field, detail }] }
    const firstDetail = body?.errors?.[0]?.detail;
    if (firstDetail) return firstDetail;
    if (body?.message) return body.message;
  }
  return fallback;
}

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (error: unknown, fallback: string) => sonnerToast.error(extractErrorMessage(error, fallback)),
  info: (message: string) => sonnerToast.info(message),
};
