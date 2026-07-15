import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

interface CashPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  isLoading?: boolean;
  onConfirm: (cashReceived: number) => void;
}

export function CashPaymentDialog({ open, onOpenChange, totalAmount, isLoading, onConfirm }: CashPaymentDialogProps) {
  const [cashReceivedInput, setCashReceivedInput] = useState("");

  const cashReceived = parseFloat(cashReceivedInput) || 0;
  const change = useMemo(() => cashReceived - totalAmount, [cashReceived, totalAmount]);
  const isValid = cashReceived >= totalAmount;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(cashReceived);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setCashReceivedInput("");
    onOpenChange(next);
  };

  // Tombol pecahan uang umum biar kasir gak perlu ngetik manual tiap transaksi
  const quickAmounts = useMemo(() => {
    const rounded = Math.ceil(totalAmount / 5000) * 5000;
    const options = [totalAmount, rounded, rounded + 5000, rounded + 10000, rounded + 50000];
    return Array.from(new Set(options)).slice(0, 4);
  }, [totalAmount]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terima Pembayaran Tunai</DialogTitle>
          <DialogDescription>Masukkan jumlah uang yang diterima dari pelanggan.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md bg-muted/60 p-3 text-sm">
            <span className="text-muted-foreground">Total Tagihan</span>
            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cash_received">Uang Diterima</Label>
            <Input
              id="cash_received"
              type="number"
              inputMode="numeric"
              min={0}
              step="500"
              autoFocus
              placeholder="0"
              value={cashReceivedInput}
              onChange={(e) => setCashReceivedInput(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCashReceivedInput(String(amount))}
              >
                {formatCurrency(amount)}
              </Button>
            ))}
          </div>

          <div
            className={`flex items-center justify-between rounded-md p-3 text-sm ${
              isValid ? "bg-emerald-50 text-emerald-700" : "bg-muted/60 text-muted-foreground"
            }`}
          >
            <span className="font-medium">Kembalian</span>
            <span className="text-lg font-semibold">
              {cashReceivedInput ? formatCurrency(Math.max(change, 0)) : "-"}
            </span>
          </div>

          {cashReceivedInput && !isValid && (
            <p className="text-xs text-destructive">Uang diterima kurang dari total tagihan.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || isLoading}>
            {isLoading ? "Memproses..." : "Konfirmasi Lunas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
