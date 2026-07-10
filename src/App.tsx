import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";

// NOTE: Router & halaman-halaman ditambahkan di Tahap 3.
// Untuk sekarang App hanya membungkus provider dasar (React Query + Toast)
// supaya struktur project ini sudah bisa di-`npm install` & di-run.
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Hello World!!
      </div>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
