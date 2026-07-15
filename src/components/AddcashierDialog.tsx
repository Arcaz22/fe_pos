import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCashier } from "@/hooks/useAuth";
import { addUserSchema, type AddUserFormValues } from "@/schemas/user-schema";

interface AddCashierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCashierDialog({ open, onOpenChange }: AddCashierDialogProps) {
  const createCashier = useCreateCashier();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { email: "", password: "", role: "cashier" },
  });

  const onSubmit = (values: AddUserFormValues) => {
    createCashier.mutate(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
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
          <DialogTitle>Tambah Akun Baru</DialogTitle>
          <DialogDescription>Buat akun kasir atau admin baru. Akun ini bisa langsung dipakai login.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="kasir2@toko.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Minimal 8 karakter" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Kasir</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createCashier.isPending}>
              {createCashier.isPending ? "Membuat..." : "Buat Akun"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
