import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/layouts/AppShell";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import OrdersPage from "@/pages/OrdersPage";
import CreateOrderPage from "@/pages/CreateOrderPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import OrderEditPage from "@/pages/OrderEditPage";
import ProfilePage from "./pages/ProfilePage";

// function ComingSoon({ label }: { label: string }) {
//   return <div className="text-sm text-muted-foreground">Halaman {label} — menyusul.</div>;
// }

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
                  <OrdersPage />
                </AppShell>
              }
            />
            <Route
              path="/orders/new"
              element={
                <AppShell>
                  <CreateOrderPage />
                </AppShell>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <AppShell>
                  <OrderDetailPage />
                </AppShell>
              }
            />
            <Route
              path="/orders/:id/edit"
              element={
                <AppShell>
                  <OrderEditPage />
                </AppShell>
              }
            />
            <Route
              path="/profile"
              element={
                <AppShell>
                  <ProfilePage />
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
