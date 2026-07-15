import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { PaginationControls } from "@/components/PaginationControls";
import { ProductFormDialog } from "@/components/ProductFormDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Product } from "@/types/product";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const pagination = usePagination();

  const { data, isLoading } = useProducts({
    name: debouncedSearch || undefined,
    offset: pagination.offset,
    limit: pagination.limit,
    sort_by: "name",
    sort_order: "asc",
  });
  const products = data?.items;

  const deleteProduct = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deletingProduct, setDeletingProduct] = useState<Product | undefined>(undefined);

  const openCreate = () => {
    setEditingProduct(undefined);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const columns: DataTableColumn<Product>[] = [
    { key: "name", header: "Nama Produk", render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "category", header: "Kategori", render: (p) => <span>{p.category || "-"}</span> },
    {
      key: "description",
      header: "Deskripsi",
      render: (p) => <span className="text-muted-foreground">{p.description || "-"}</span>,
    },
    { key: "price", header: "Harga", render: (p) => formatCurrency(p.price), className: "text-right" },
    { key: "updated_at", header: "Terakhir Diubah", render: (p) => formatDateTime(p.updated_at) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <RoleGuard allow={["admin"]}>
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeletingProduct(p)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </RoleGuard>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produk</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar menu/produk yang bisa dipesan.</p>
        </div>
        <RoleGuard allow={["admin"]}>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Tambah Produk
          </Button>
        </RoleGuard>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          pagination.reset();
        }}
        searchPlaceholder="Cari nama produk..."
      />

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        getRowKey={(p) => p.id}
        emptyTitle="Belum ada produk"
        emptyDescription="Tambahkan produk pertama untuk mulai menerima order."
      />

      {!isLoading && data && (
        <PaginationControls
          offset={pagination.offset}
          limit={pagination.limit}
          total={data.total}
          currentCount={products?.length ?? 0}
          hasPrevPage={pagination.hasPrevPage}
          hasNextPage={pagination.hasNextPage(data.total)}
          onPrev={pagination.prevPage}
          onNext={pagination.nextPage}
        />
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingProduct} />

      <ConfirmDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(undefined)}
        title="Hapus produk?"
        description={`Produk "${deletingProduct?.name}" akan dihapus permanen. Order yang sudah memakai produk ini tidak akan terpengaruh.`}
        confirmLabel="Hapus"
        isLoading={deleteProduct.isPending}
        onConfirm={() =>
          deletingProduct &&
          deleteProduct.mutate(deletingProduct.id, { onSuccess: () => setDeletingProduct(undefined) })
        }
      />
    </div>
  );
}
