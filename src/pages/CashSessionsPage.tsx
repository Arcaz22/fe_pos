import { useState } from "react";
import { CalendarDays, Eye, LockKeyhole, UnlockKeyhole, WalletCards } from "lucide-react";
import { useCashSessionDetail, useCashSessions, useCurrentCashSession } from "@/hooks/useCashSession";
import { usePagination } from "@/hooks/usePagination";
import { useAuthStore } from "@/store/auth-store";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { PaginationControls } from "@/components/PaginationControls";
import { OpenCashSessionDialog } from "@/components/OpenCashSessionDialog";
import { CloseCashSessionDialog } from "@/components/CloseCashSessionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { CashSession } from "@/types/cash-session";

function CashSessionStatusBadge({ status }: { status: CashSession["status"] }) {
  return status === "open" ? (
    <Badge className="bg-emerald-50 text-emerald-700">Terbuka</Badge>
  ) : (
    <Badge variant="outline">Ditutup</Badge>
  );
}

export default function CashSessionsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === "admin";
  const pagination = usePagination();

  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [cashierUserId, setCashierUserId] = useState("");
  const [openedFrom, setOpenedFrom] = useState("");
  const [openedTo, setOpenedTo] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>();

  const currentSession = useCurrentCashSession();
  const sessionList = useCashSessions(
    isAdmin
      ? {
          offset: pagination.offset,
          limit: pagination.limit,
          cashier_user_id: cashierUserId ? Number(cashierUserId) : undefined,
          opened_from: openedFrom || undefined,
          opened_to: openedTo || undefined,
        }
      : undefined,
    isAdmin
  );
  const detail = useCashSessionDetail(selectedSessionId);

  const current = currentSession.data;
  const sessions = sessionList.data?.items;
  const selectedDetail = detail.data;

  const columns: DataTableColumn<CashSession>[] = [
    {
      key: "id",
      header: "ID",
      render: (session) => <span className="numeric-emphasis font-medium">#{session.id}</span>,
    },
    { key: "cashier", header: "Kasir", render: (session) => session.cashier_user_id },
    { key: "status", header: "Status", render: (session) => <CashSessionStatusBadge status={session.status} /> },
    { key: "opening", header: "Modal Awal", render: (session) => formatCurrency(session.opening_balance) },
    {
      key: "expected",
      header: "Kas Seharusnya",
      render: (session) => (session.expected_balance ? formatCurrency(session.expected_balance) : "-"),
    },
    {
      key: "variance",
      header: "Selisih Kas",
      render: (session) => (session.variance ? formatCurrency(session.variance) : "-"),
    },
    { key: "opened_at", header: "Dibuka", render: (session) => formatDateTime(session.opened_at) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: () => (
        <Button variant="ghost" size="icon" aria-label="Lihat detail">
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const resetFilters = () => {
    setCashierUserId("");
    setOpenedFrom("");
    setOpenedTo("");
    pagination.reset();
  };

  const hasActiveFilters = Boolean(cashierUserId || openedFrom || openedTo);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sesi Kas</h1>
          <p className="text-sm text-muted-foreground">Buka, tutup, dan audit sesi kas tunai.</p>
        </div>
        {!currentSession.isLoading && (
          current ? (
            <Button variant="outline" onClick={() => setCloseDialog(true)}>
              <LockKeyhole className="h-4 w-4" /> Tutup Sesi
            </Button>
          ) : (
            <Button onClick={() => setOpenDialog(true)}>
              <UnlockKeyhole className="h-4 w-4" /> Buka Sesi
            </Button>
          )
        )}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Sesi Aktif</CardTitle>
          <WalletCards className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          {currentSession.isLoading ? (
            <p className="text-sm text-muted-foreground">Memuat sesi kas...</p>
          ) : current ? (
            <div className="grid gap-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Status</p>
                <div className="mt-1">
                  <CashSessionStatusBadge status={current.status} />
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Modal Awal</p>
                <p className="mt-1 font-medium">{formatCurrency(current.opening_balance)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Dibuka</p>
                <p className="mt-1 font-medium">{formatDateTime(current.opened_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ID Sesi</p>
                <p className="numeric-emphasis mt-1 font-medium">#{current.id}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada sesi kas aktif untuk user ini.</p>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Riwayat Sesi</h2>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="w-40 space-y-1.5">
              <Label htmlFor="cashier_user_id">ID Kasir</Label>
              <Input
                id="cashier_user_id"
                type="number"
                min={1}
                value={cashierUserId}
                onChange={(event) => {
                  setCashierUserId(event.target.value);
                  pagination.reset();
                }}
                placeholder="Semua"
              />
            </div>
            <div className="w-44 space-y-1.5">
              <Label htmlFor="opened_from">Dibuka dari</Label>
              <Input
                id="opened_from"
                type="date"
                value={openedFrom}
                onChange={(event) => {
                  setOpenedFrom(event.target.value);
                  pagination.reset();
                }}
              />
            </div>
            <div className="w-44 space-y-1.5">
              <Label htmlFor="opened_to">Dibuka sampai</Label>
              <Input
                id="opened_to"
                type="date"
                value={openedTo}
                onChange={(event) => {
                  setOpenedTo(event.target.value);
                  pagination.reset();
                }}
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={resetFilters}>
                Reset filter
              </Button>
            )}
          </div>

          <DataTable
            columns={columns}
            data={sessions}
            isLoading={sessionList.isLoading}
            getRowKey={(session) => session.id}
            onRowClick={(session) => setSelectedSessionId(session.id)}
            emptyTitle="Belum ada sesi kas"
            emptyDescription={hasActiveFilters ? "Tidak ada sesi yang cocok dengan filter ini." : "Sesi kas akan muncul setelah kasir membuka sesi."}
          />

          {!sessionList.isLoading && sessionList.data && (
            <PaginationControls
              offset={pagination.offset}
              limit={pagination.limit}
              total={sessionList.data.total}
              currentCount={sessions?.length ?? 0}
              hasPrevPage={pagination.hasPrevPage}
              hasNextPage={pagination.hasNextPage(sessionList.data.total)}
              onPrev={pagination.prevPage}
              onNext={pagination.nextPage}
            />
          )}
        </div>
      )}

      <OpenCashSessionDialog open={openDialog} onOpenChange={setOpenDialog} />
      {current && <CloseCashSessionDialog open={closeDialog} onOpenChange={setCloseDialog} session={current} />}

      <Dialog open={selectedSessionId !== undefined} onOpenChange={(open) => !open && setSelectedSessionId(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Sesi Kas</DialogTitle>
            <DialogDescription>Ringkasan transaksi tunai pada sesi ini.</DialogDescription>
          </DialogHeader>
          {detail.isLoading || !selectedDetail ? (
            <p className="text-sm text-muted-foreground">Memuat detail...</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Sesi</p>
                  <p className="numeric-emphasis font-medium">#{selectedDetail.session.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <CashSessionStatusBadge status={selectedDetail.session.status} />
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Order</p>
                  <p className="font-medium">{selectedDetail.summary.order_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Penjualan</p>
                  <p className="font-medium">{formatCurrency(selectedDetail.summary.total_amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Tunai Lunas</p>
                  <p className="font-medium">{selectedDetail.summary.paid_cash_order_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Tunai Lunas</p>
                  <p className="font-medium">{formatCurrency(selectedDetail.summary.paid_cash_total)}</p>
                </div>
              </div>
              {selectedDetail.session.notes && (
                <div className="rounded-md bg-muted/60 p-3">
                  <p className="text-muted-foreground">Catatan</p>
                  <p className="mt-1">{selectedDetail.session.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
