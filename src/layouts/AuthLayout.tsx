import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight">POS Kasir</h1>
          <p className="text-sm text-muted-foreground">Masuk untuk mulai melayani pesanan</p>
        </div>
        {children}
      </div>
    </div>
  );
}
