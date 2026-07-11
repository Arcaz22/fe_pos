import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/api/products";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/lib/toast";
import type { ProductListParams, ProductPayload } from "@/types/product";

export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsApi.list(params),
    placeholderData: (prev) => prev, // biar list gak "kedip" kosong saat ganti filter/page
  });
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id!),
    queryFn: () => productsApi.detail(id!),
    enabled: id !== undefined,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success("Produk berhasil ditambahkan.");
    },
    onError: (error) => toast.error(error, "Gagal menambahkan produk."),
  });
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
      toast.success("Produk berhasil diperbarui.");
    },
    onError: (error) => toast.error(error, "Gagal memperbarui produk."),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success("Produk berhasil dihapus.");
    },
    onError: (error) => toast.error(error, "Gagal menghapus produk. Cek apakah produk masih dipakai di order."),
  });
}
