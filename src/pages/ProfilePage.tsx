import { useState } from "react";
import { UserCircle, Mail, Shield, CalendarClock, UserPlus } from "lucide-react";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/RoleGuard";
import { AddCashierDialog } from "@/components/AddcashierDialog";
import { formatDateTime } from "@/lib/format";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  cashier: "Kasir",
};

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const [addUserOpen, setAddUserOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-md space-y-4">
        <CardSkeleton />
      </div>
    );
  }

  if (!user) {
    return <p className="text-sm text-muted-foreground">Gagal memuat data profil.</p>;
  }

  return (
    <div className="max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
        <p className="text-sm text-muted-foreground">Informasi akun kamu saat ini.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserCircle className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">{user.email}</CardTitle>
            <Badge className="mt-1">{ROLE_LABEL[user.role] ?? user.role}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 border-t border-border pt-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Email</span>
            <span className="ml-auto font-medium text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Role</span>
            <span className="ml-auto font-medium text-foreground">{ROLE_LABEL[user.role] ?? user.role}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            <span>Bergabung sejak</span>
            <span className="ml-auto font-medium text-foreground">{formatDateTime(user.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      <RoleGuard allow={["admin"]}>
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Kelola Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Tambahkan akun kasir atau admin baru untuk tim kamu.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setAddUserOpen(true)}>
              <UserPlus className="h-4 w-4" /> Tambah Akun
            </Button>
          </CardContent>
        </Card>
      </RoleGuard>

      <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10" onClick={logout}>
        Keluar
      </Button>

      <AddCashierDialog open={addUserOpen} onOpenChange={setAddUserOpen} />
    </div>
  );
}
