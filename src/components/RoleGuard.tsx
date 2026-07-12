import type { ReactNode } from "react";
import { useAuthStore } from "@/store/auth-store";
import type { Role } from "@/types/auth";

interface RoleGuardProps {
  allow: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

/** Sembunyikan children kalau role user saat ini tidak termasuk daftar `allow`. */
export function RoleGuard({ allow, children, fallback = null }: RoleGuardProps) {
  const role = useAuthStore((s) => s.user?.role);
  if (!role || !allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
