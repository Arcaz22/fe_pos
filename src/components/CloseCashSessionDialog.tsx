import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCloseCashSession } from "@/hooks/useCashSession";
import { closeCashSessionSchema, type CloseCashSessionFormValues } from "@/schemas/cash-session";
import { formatCurrency } from "@/lib/format";
import type { CashSession } from "@/types/cash-session";

interface CloseCashSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CashSession;
}

export function CloseCashSessionDialog({ open, onOpenChange, session }: CloseCashSessionDialogProps) {
  const closeSession = useCloseCashSession(session.id);
  const [result, setResult] = useState<CashSession | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CloseCashSessionFormValues>({
    resolver: zodResolver(closeCashSessionSchema),
    defaultValues: { closing_balance: 0, notes: "" },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      setResult(null);
    }
    onOpenChange(next);
  };

  const onSubmit = (values: CloseCashSessionFormValues) => {
    closeSession.mutate(
      { closing_balance: values.closing_balance, notes: values.notes || null },
      { onSuccess: (updated) => setResult(updated) }
    );
  };

  const variance = result ? parseFloat(result.variance ?? "0") : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {!result ? (
          <>
            <DialogHeader>
              <DialogTitle>Tutup Sesi Kas</DialogTitle>
              <DialogDescription>
                Hitung uang tunai fisik di laci sekarang, lalu masukkan jumlahnya di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center justify-between rounded-md bg-muted/60 p-3 text-sm">
                <span className="text-muted-foreground">Modal Awal</span>
                <span className="font-medium">{formatCurrency(session.opening_balance)}</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="closing_balance">Uang Fisik di Laci Sekarang</Label>
                <Input
                  id="closing_balance"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step="1000"
                  placeholder="0"
                  autoFocus
                  {...register("closing_balance", { valueAsNumber: true })}
                />
                {errors.closing_balance && (
                  <p className="text-xs text-destructive">{errors.closing_balance.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea id="notes" placeholder="Contoh: ada uang rusak, dll" {...register("notes")} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={closeSession.isPending}>
                  {closeSession.isPending ? "Menutup..." : "Tutup Sesi"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Sesi Kas Ditutup</DialogTitle>
              <DialogDescription>Berikut hasil rekonsiliasi kas untuk sesi ini.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modal Awal</span>
                <span className="font-medium">{formatCurrency(result.opening_balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kas Seharusnya</span>
                <span className="font-medium">{formatCurrency(result.expected_balance ?? "0")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uang Fisik Dihitung</span>
                <span className="font-medium">{formatCurrency(result.closing_balance ?? "0")}</span>
              </div>
              <div
                className={`mt-2 flex items-center justify-between rounded-md p-3 font-semibold ${
                  variance === 0
                    ? "bg-emerald-50 text-emerald-700"
                    : variance > 0
                      ? "bg-blue-50 text-blue-700"
                      : "bg-red-50 text-red-700"
                }`}
              >
                <span>{variance === 0 ? "Kas Sesuai" : variance > 0 ? "Kas Lebih" : "Kas Kurang"}</span>
                <span>{formatCurrency(Math.abs(variance))}</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Selesai</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
