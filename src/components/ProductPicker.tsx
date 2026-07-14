import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency } from "@/lib/format";

interface ProductPickerProps {
  onAdd: (product: { id: number; name: string; price: number }) => void;
}

export function ProductPicker({ onAdd }: ProductPickerProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useProducts({
    name: debouncedSearch || undefined,
    limit: 50,
    sort_by: "name",
    sort_order: "asc",
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={1} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="Produk tidak ditemukan" />
      ) : (
        <div className="max-h-[60vh] space-y-1 overflow-auto pr-1">
          {data.items.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onAdd({ id: product.id, name: product.name, price: parseFloat(product.price) })}
              className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2.5 text-left text-sm transition-colors hover:border-primary hover:bg-muted/60"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(product.price)}</p>
              </div>
              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
