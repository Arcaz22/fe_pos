import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  offset: number;
  limit: number;
  total: number;
  currentCount: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationControls({
  offset,
  limit,
  total,
  currentCount,
  hasPrevPage,
  hasNextPage,
  onPrev,
  onNext,
}: PaginationControlsProps) {
  const from = total === 0 ? 0 : offset + 1;
  const to = offset + currentCount;

  return (
    <div className="flex items-center justify-between pt-3">
      <span className="text-sm text-muted-foreground">
        Menampilkan {from}–{to} dari {total} data
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={!hasPrevPage}>
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNextPage}>
          Berikutnya <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
