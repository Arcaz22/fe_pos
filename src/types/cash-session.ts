export type CashSessionStatus = "open" | "closed";

export interface CashSession {
  id: number;
  cashier_user_id: number;
  opening_balance: string;
  closing_balance: string | null;
  expected_balance: string | null;
  variance: string | null;
  status: CashSessionStatus;
  notes: string | null;
  opened_at: string;
  closed_at: string | null;
}

export interface CashSessionSummary {
  order_count: number;
  total_amount: string;
  paid_cash_order_count: number;
  paid_cash_total: string;
}

export interface CashSessionDetail {
  session: CashSession;
  summary: CashSessionSummary;
}

export interface CashSessionListParams {
  offset?: number;
  limit?: number;
  cashier_user_id?: number;
  opened_from?: string;
  opened_to?: string;
}

export interface OpenCashSessionPayload {
  opening_balance: number;
}

export interface CloseCashSessionPayload {
  closing_balance: number;
  notes?: string | null;
}
