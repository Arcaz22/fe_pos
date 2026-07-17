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
import { Button } from "@/components/ui/button";
import { useOpenCashSession } from "@/hooks/useCashSession";
import { openCashSessionSchema, type OpenCashSessionFormValues } from "@/schemas/cash-session";

interface OpenCashSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpenCashSessionDialog({ open, onOpenChange }: OpenCashSessionDialogProps) {
  const openSession = useOpenCashSession();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OpenCashSessionFormValues>({
    resolver: zodResolver(openCashSessionSchema),
    defaultValues: { opening_balance: 0 },
  });

  const onSubmit = (values: OpenCashSessionFormValues) => {
    openSession.mutate(
      { opening_balance: values.opening_balance },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buka Sesi Kas</DialogTitle>
          <DialogDescription>Masukkan modal awal (uang tunai) yang ada di laci kasir saat ini.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="opening_balance">Modal Awal</Label>
            <Input
              id="opening_balance"
              type="number"
              inputMode="numeric"
              min={0}
              step="1000"
              placeholder="0"
              autoFocus
              {...register("opening_balance", { valueAsNumber: true })}
            />
            {errors.opening_balance && <p className="text-xs text-destructive">{errors.opening_balance.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={openSession.isPending}>
              {openSession.isPending ? "Membuka..." : "Buka Sesi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
