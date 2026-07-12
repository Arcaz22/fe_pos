import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    num
  );
}

export function formatDateTime(isoString: string): string {
  return format(new Date(isoString), "d MMM yyyy, HH:mm", { locale: localeId });
}

export function formatDate(isoString: string): string {
  return format(new Date(isoString), "d MMM yyyy", { locale: localeId });
}
