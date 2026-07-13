import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/layouts/AppShell";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";

// NOTE: Halaman Products & Orders (list/create/detail/edit) ditambahkan di Tahap 4.
// Route-nya sudah disiapkan di sini sebagai placeholder supaya nav sidebar
// (lihat layouts/AppShell.tsx) sudah bisa diklik tanpa error 404.
function ComingSoon({ label }: { label: string }) {
  return <div className="text-sm text-muted-foreground">Halaman {label} — menyusul di Tahap 4.</div>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <AppShell>
                  <DashboardPage />
                </AppShell>
              }
            />
            <Route
              path="/products"
              element={
                <AppShell>
                  <ProductsPage />
                </AppShell>
              }
            />
            <Route
              path="/orders"
              element={
                <AppShell>
                  <ComingSoon label="Order" />
                </AppShell>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <AppShell>
                  <ComingSoon label="Detail Order" />
                </AppShell>
              }
            />
            <Route
              path="/profile"
              element={
                <AppShell>
                  <ComingSoon label="Profil" />
                </AppShell>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
