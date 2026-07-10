export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  created_at: string;
  updated_at: string;
}

export interface ProductListParams {
  offset?: number;
  limit?: number;
  name?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: "id" | "name" | "price" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
}

export interface ProductPayload {
  name: string;
  description?: string | null;
  price: number;
}
